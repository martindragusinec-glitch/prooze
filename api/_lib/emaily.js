// HTML e-maily PROOZE: upozornění na poptávku pro firmu a potvrzení pro zákazníka.
// Tabulkový layout s inline styly (Gmail, Outlook, Seznam), barvy značky, bez externích fontů.

const C = { pine: '#0F3A2E', pine2: '#174C3D', sun: '#FFC83A', soft: '#FFF3CC', mist: '#F1F4EE', muted: '#4F6A61', line: '#DDE3DC' };
const FONT = "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const telHref = (t) => 'tel:' + String(t).replace(/[^\d+]/g, '').replace(/^00/, '+').replace(/^(\d{9})$/, '+420$1');

function shell({ base, preheader, body }) {
  return `<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>PROOZE</title></head>
<body style="margin:0;padding:0;background:${C.mist};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.mist};"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;font-family:${FONT};color:${C.pine};">
<tr><td style="background:${C.pine};padding:22px 28px;"><img src="${base}/assets/brand/email-logo.png" width="150" height="36" alt="PROOZE" style="display:block;border:0;width:150px;height:auto;"></td></tr>
${body}
<tr><td style="padding:20px 28px;background:${C.mist};font-size:13px;line-height:1.5;color:${C.muted};">PROOZE · Pavel Kočí · Tomanova 1630, 274 01 Slaný · IČO 88327078<br><a href="tel:+420773898698" style="color:${C.pine};">773 898 698</a> · <a href="mailto:info@prooze.cz" style="color:${C.pine};">info@prooze.cz</a> · <a href="${base}/" style="color:${C.pine};">prooze.cz</a></td></tr>
</table></td></tr></table></body></html>`;
}

const row = (k, v) => v ? `<tr><td style="padding:10px 0;border-top:1px solid ${C.line};font-size:14px;color:${C.muted};width:150px;vertical-align:top;">${esc(k)}</td><td style="padding:10px 0;border-top:1px solid ${C.line};font-size:15px;font-weight:700;vertical-align:top;">${v}</td></tr>` : '';
const btn = (href, label, bg = C.sun, fg = C.pine) => `<a href="${href}" style="display:inline-block;background:${bg};color:${fg};text-decoration:none;font-weight:800;font-size:16px;padding:14px 22px;border-radius:12px;">${label}</a>`;

/** E-mail pro firmu (info@prooze.cz). */
export function leadEmail({ d, L, attr, base, prijato }) {
  const isCall = d.typ === 'zavolat';
  const title = isCall ? 'Zavolejte mi zpět' : 'Nová poptávka z webu';
  const tags = isCall ? [] : [L('sluzba', d.sluzba), L('objekt', d.objekt)].filter((x) => x && x !== '–');
  const answers = isCall ? row('Kdy se hodí', esc(L('kdy', d.kdy))) : [
    row('Služba', esc(L('sluzba', d.sluzba))),
    row('Stavba', esc(L('objekt', d.objekt))),
    d.strecha ? row('Střecha', esc(L('strecha', d.strecha))) : '',
    d.spotreba ? row('Platí za elektřinu', esc(L('spotreba', d.spotreba))) : '',
    row('Obec / PSČ', esc(d.psc)),
    row('E-mail', d.email ? `<a href="mailto:${esc(d.email)}" style="color:${C.pine};">${esc(d.email)}</a>` : ''),
  ].join('');
  const note = d.poznamka ? `<tr><td style="padding:0 28px 8px;"><div style="background:${C.soft};border-radius:12px;padding:14px 16px;font-size:15px;line-height:1.5;"><b>Poznámka:</b><br>${esc(d.poznamka).replace(/\n/g, '<br>')}</div></td></tr>` : '';
  const src = Object.entries(attr).filter(([k]) => k !== 'stranka');
  const attrRows = src.length ? `<tr><td style="padding:8px 28px 22px;font-size:12.5px;line-height:1.6;color:${C.muted};"><b style="color:${C.pine};">Odkud přišel:</b> ${src.map(([k, v]) => `${esc(k)}: ${esc(v)}`).join(' · ')}${attr.stranka ? `<br>Odesláno ze stránky: ${esc(attr.stranka)}` : ''}</td></tr>` : '';
  const body = `
<tr><td style="padding:28px 28px 6px;">
  <div style="font-size:13px;font-weight:700;color:${C.muted};">${esc(title)} · ${esc(prijato)}</div>
  <div style="font-size:30px;line-height:1.1;font-weight:800;margin:8px 0 6px;">${esc(d.jmeno)}</div>
  ${tags.length ? `<div>${tags.map((t) => `<span style="display:inline-block;background:${C.mist};border-radius:999px;padding:5px 11px;margin:4px 6px 0 0;font-size:13px;font-weight:700;">${esc(t)}</span>`).join('')}</div>` : ''}
</td></tr>
<tr><td style="padding:18px 28px 6px;">${btn(telHref(d.telefon), `Zavolat ${esc(d.telefon)}`)}${d.email ? ` &nbsp; ${btn(`mailto:${esc(d.email)}`, 'Napsat e-mail', C.pine, '#ffffff')}` : ''}</td></tr>
<tr><td style="padding:16px 28px 14px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${answers}</table></td></tr>
${note}${attrRows}`;
  return shell({ base, preheader: `${title}: ${d.jmeno}, ${d.telefon}`, body });
}

/** Potvrzení pro zákazníka (jen když vyplnil e-mail). */
export function confirmEmail({ d, L, base }) {
  const first = String(d.jmeno).trim().split(/\s+/)[0];
  const sum = [L('sluzba', d.sluzba), L('objekt', d.objekt), d.strecha && L('strecha', d.strecha), d.spotreba && `elektřina ${L('spotreba', d.spotreba)}`].filter((x) => x && x !== '–');
  const step = (n, t, s) => `<td width="33%" style="vertical-align:top;padding:0 6px;"><div style="border:1.5px solid ${C.line};border-radius:14px;padding:14px;"><div style="width:26px;height:26px;line-height:26px;text-align:center;border-radius:13px;background:${C.pine};color:#fff;font-weight:800;font-size:13px;">${n}</div><div style="font-weight:800;font-size:15px;margin-top:8px;">${t}</div><div style="font-size:13px;color:${C.muted};margin-top:2px;">${s}</div></div></td>`;
  const body = `
<tr><td style="padding:30px 28px 8px;">
  <div style="font-size:28px;line-height:1.15;font-weight:800;">Děkujeme${first ? `, ${esc(first)}` : ''}. Poptávka je u&nbsp;nás.</div>
  <p style="font-size:16px;line-height:1.55;color:${C.muted};margin:12px 0 0;">Do 24&nbsp;hodin vám zavoláme z&nbsp;čísla <b style="color:${C.pine};">773&nbsp;898&nbsp;698</b>, ať ho poznáte. Domluvíme termín prohlídky, která je zdarma a&nbsp;nezávazná.</p>
</td></tr>
${sum.length ? `<tr><td style="padding:14px 28px 4px;">${sum.map((t) => `<span style="display:inline-block;background:${C.mist};border-radius:999px;padding:6px 12px;margin:4px 6px 0 0;font-size:13px;font-weight:700;">${esc(t)}</span>`).join('')}</td></tr>` : ''}
<tr><td style="padding:20px 22px 6px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${step(1, 'Zavoláme vám', 'a domluvíme prohlídku')}${step(2, 'Přijedeme', 'zaměřit střechu zdarma')}${step(3, 'Pošleme nabídku', 's pevnou cenou')}</tr></table></td></tr>
<tr><td style="padding:18px 28px 6px;font-size:15px;line-height:1.55;color:${C.muted};">Nabídku připravíme rychleji, když nám odpovědí na tento e-mail pošlete <b style="color:${C.pine};">fotky střechy</b> nebo <b style="color:${C.pine};">vyúčtování za elektřinu</b>.</td></tr>
<tr><td style="padding:16px 28px 28px;">${btn(`${base}/dotace/`, 'Na co máte nárok z dotací 2026')}</td></tr>`;
  return shell({ base, preheader: 'Do 24 hodin vám zavoláme a domluvíme prohlídku zdarma.', body });
}
