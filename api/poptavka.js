// Vercel Serverless Function: příjem poptávky a „Zavolejte mi“ z webu PROOZE.
// Pošle e-mail přes Resend a volitelně kopii na webhook (Make, CRM).
//
// Proměnné prostředí (Vercel → Settings → Environment Variables):
//   RESEND_API_KEY     klíč z https://resend.com (doména odesílatele musí být ověřená)
//   POPTAVKY_FROM      odesílatel, např. "Web PROOZE <web@prooze.cz>"
//   POPTAVKY_TO        příjemce, výchozí info@prooze.cz (více adres oddělte čárkou)
//   POPTAVKY_WEBHOOK   volitelně URL webhooku (Make/Zapier/CRM), dostane celou poptávku jako JSON
//
// Bez RESEND_API_KEY i bez webhooku vrací 503 a formulář nabídne zavolat. Data se nikam neukládají.

import { leadEmail, confirmEmail } from './_lib/emaily.js';

const LABELS = {
  sluzba: { strecha: 'Střecha', fve: 'Fotovoltaika', oboji: 'Střecha + FVE' },
  objekt: { 'rodinny-dum': 'Rodinný dům', 'bytovy-dum': 'Bytový dům / SVJ', firma: 'Firma nebo hala', obec: 'Obec, jiné' },
  strecha: { oprava: 'Zatéká, potřebuje opravu', uprava: 'Výměna krytiny', rekonstrukce: 'Celá rekonstrukce i s krovem', nova: 'Nová střecha (stavba)' },
  spotreba: { 'do-2000': 'do 2 000 Kč/měs.', '2000-4000': '2 000–4 000 Kč/měs.', '4000-7000': '4 000–7 000 Kč/měs.', 'nad-7000': 'víc nebo neví' },
  kdy: { dopoledne: 'dopoledne', odpoledne: 'odpoledne', kdykoli: 'kdykoli' },
};
const ATTR = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'referrer', 'landing', 'stranka'];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method' });
  }
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body && typeof body === 'object' ? body : {};
  const val = (k, max = 300) => String(body[k] ?? '').trim().slice(0, max);
  const wantsJson = String(req.headers.accept || '').includes('application/json') || String(req.headers['content-type'] || '').includes('application/json');
  const reply = (status, payload) => (wantsJson ? res.status(status).json(payload) : res.redirect(303, payload.ok ? '/dekujeme/' : '/kontakt/?chyba=1#poptavka'));

  // Ochrana proti spamu: vyplněné skryté pole „web“ nebo odeslání do 3 s = robot. Tváříme se, že je vše v pořádku.
  const seconds = Number(val('cas_s'));
  if (val('web') || (val('cas_s') !== '' && Number.isFinite(seconds) && seconds < 3)) return reply(200, { ok: true });

  const typ = val('typ') === 'zavolat' ? 'zavolat' : 'poptavka';
  const d = {
    typ,
    jmeno: val('jmeno', 120), telefon: val('telefon', 40), email: val('email', 160), psc: val('psc', 10),
    sluzba: val('sluzba'), objekt: val('objekt'), strecha: val('strecha'), spotreba: val('spotreba'),
    kdy: val('kdy'), poznamka: val('poznamka', 2000),
  };
  const errors = [];
  if (d.jmeno.length < 2) errors.push('jmeno');
  if (d.telefon.replace(/\D/g, '').length < 9) errors.push('telefon');
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) errors.push('email');
  if (typ === 'poptavka' && d.psc.length < 2) errors.push('psc'); // obec nebo PSČ
  if (errors.length) return reply(400, { ok: false, error: 'invalid', fields: errors });

  const attr = Object.fromEntries(ATTR.map((k) => [k, val(k, 500)]).filter(([, v]) => v));
  const L = (group, v) => (LABELS[group] && LABELS[group][v]) || v || '–';
  const subject = typ === 'zavolat'
    ? `Zavolejte mi: ${d.jmeno}, ${d.telefon}`
    : `Poptávka: ${L('sluzba', d.sluzba)}, ${L('objekt', d.objekt)} – ${d.jmeno}${d.psc ? ` (${d.psc})` : ''}`;
  const lines = typ === 'zavolat'
    ? ['Žádost o zavolání z webu PROOZE', '', `Jméno: ${d.jmeno}`, `Telefon: ${d.telefon}`, `Kdy se hodí: ${L('kdy', d.kdy)}`]
    : [
      'Nová poptávka z webu PROOZE', '',
      `Služba: ${L('sluzba', d.sluzba)}`,
      `Stavba: ${L('objekt', d.objekt)}`,
      d.strecha ? `Střecha: ${L('strecha', d.strecha)}` : null,
      d.spotreba ? `Platí za elektřinu: ${L('spotreba', d.spotreba)}` : null,
      '',
      `Jméno: ${d.jmeno}`,
      `Telefon: ${d.telefon}`,
      `E-mail: ${d.email || '–'}`,
      `Obec / PSČ stavby: ${d.psc || '–'}`,
      '',
      `Poznámka: ${d.poznamka || '–'}`,
    ].filter((x) => x !== null);
  if (Object.keys(attr).length) lines.push('', 'Odkud přišel:', ...Object.entries(attr).map(([k, v]) => `${k}: ${v}`));
  const text = lines.join('\n');

  const key = process.env.RESEND_API_KEY;
  const from = process.env.POPTAVKY_FROM;
  const to = (process.env.POPTAVKY_TO || 'info@prooze.cz').split(',').map((s) => s.trim()).filter(Boolean);
  const hook = process.env.POPTAVKY_WEBHOOK;
  if ((!key || !from) && !hook) return reply(503, { ok: false, error: 'not-configured' });

  const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.prooze.cz';
  const base = (process.env.SITE_URL || `https://${host}`).replace(/\/$/, '');
  const prijato = new Date().toLocaleString('cs-CZ', { timeZone: 'Europe/Prague', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
  const resend = (payload) => fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let sent = false;
  try {
    if (key && from) {
      const r = await resend({ from, to, reply_to: d.email || undefined, subject, text, html: leadEmail({ d, L, attr, base, prijato }) });
      sent = r.ok;
      if (!r.ok) console.error('Resend', r.status, await r.text().catch(() => ''));
      // potvrzení zákazníkovi: chyba neblokuje poptávku
      if (sent && d.email && process.env.POTVRZENI !== 'ne' && !/resend\.dev/.test(from)) {
        await resend({
          from, to: [d.email], reply_to: to[0],
          subject: 'Poptávka přijata, ozveme se do 24 hodin | PROOZE',
          text: `Děkujeme, poptávka je u nás. Do 24 hodin vám zavoláme z čísla 773 898 698 a domluvíme prohlídku zdarma.\n\nPROOZE, Tomanova 1630, Slaný, info@prooze.cz`,
          html: confirmEmail({ d, L, base }),
        }).catch(() => {});
      }
    }
    if (hook) {
      const r = await fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...d, ...attr, prijato: new Date().toISOString() }) });
      sent = sent || r.ok;
    }
  } catch {
    sent = false;
  }
  if (!sent) return reply(502, { ok: false, error: 'send' });
  return reply(200, { ok: true });
}
