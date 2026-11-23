// =====================================================================
//  AHDEM — biçimli blog metni (HTML) temizleyici
//  Panelde yazılan ya da Word'den aktarılan metin HTML olarak saklanır.
//  Sitede gösterilmeden ÖNCE ve panelde kaydedilmeden ÖNCE buradan geçer:
//  yalnızca izinli etiketler, izinli stil özellikleri ve güvenli bağlantılar
//  kalır. Betik, olay özniteliği, dış kaynaklı görsel vb. hepsi atılır.
// =====================================================================

import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3.4.17/dist/purify.es.mjs';
import { AYAR } from './haberler.js';

export const FOTO_ONEK = AYAR.url + '/storage/v1/object/public/' + AYAR.depo + '/';

const ETIKETLER = ['p', 'br', 'h2', 'h3', 'h4', 'blockquote', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
  'sub', 'sup', 'span', 'a', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'img', 'hr'];
const OZNITELIKLER = ['href', 'target', 'rel', 'src', 'alt', 'colspan', 'rowspan', 'style', 'title'];
const STILLER = ['font-family', 'font-size', 'font-weight', 'font-style', 'text-decoration-line', 'color',
  'background-color', 'text-align', 'text-indent', 'margin-left', 'list-style-type', 'width'];
const GENISLIK_ETIKET = new Set(['img', 'table', 'td', 'th']);

const kalip = document.createElement('span');
function stilSuz(deger, etiket) {
  kalip.removeAttribute('style');
  kalip.style.cssText = deger;
  const cikti = [];
  for (const ad of STILLER) {
    const v = kalip.style.getPropertyValue(ad).trim();
    if (!v || /url\s*\(|expression|javascript|[\\<>]/i.test(v)) continue;
    if (ad === 'width' && (!GENISLIK_ETIKET.has(etiket) || !/^\d+(\.\d+)?(px|%)$/.test(v))) continue;
    cikti.push(ad + ':' + v);
  }
  return cikti.join(';');
}

let taslakModu = false;
const temizleyici = DOMPurify();

temizleyici.addHook('uponSanitizeAttribute', (dugum, veri) => {
  if (veri.attrName === 'style') {
    veri.attrValue = stilSuz(veri.attrValue, dugum.nodeName.toLowerCase());
    if (!veri.attrValue) veri.keepAttr = false;
  }
});

temizleyici.addHook('afterSanitizeAttributes', dugum => {
  if (dugum.nodeName === 'IMG') {
    const src = dugum.getAttribute('src') || '';
    const izinli = src.startsWith(FOTO_ONEK) || (taslakModu && /^data:image\/(png|jpe?g|gif|webp);base64,/i.test(src));
    if (!izinli) dugum.remove();
    else if (!dugum.hasAttribute('alt')) dugum.setAttribute('alt', '');
  }
  if (dugum.nodeName === 'A') {
    const h = dugum.getAttribute('href') || '';
    if (!/^(https?:\/\/|mailto:|\/(?![\/\\])|#)/i.test(h)) { dugum.removeAttribute('href'); return; }
    if (/^https?:\/\//i.test(h)) { dugum.setAttribute('target', '_blank'); dugum.setAttribute('rel', 'noopener noreferrer'); }
    else { dugum.removeAttribute('target'); dugum.removeAttribute('rel'); }
  }
});

const AYAR_TEMIZ = { ALLOWED_TAGS: ETIKETLER, ALLOWED_ATTR: OZNITELIKLER, ALLOW_DATA_ATTR: false };

// taslak: panelde düzenlenirken henüz yüklenmemiş (data:) görsellere izin ver.
export function temizHtml(html, taslak) {
  taslakModu = !!taslak;
  try { return temizleyici.sanitize(String(html || ''), AYAR_TEMIZ); }
  finally { taslakModu = false; }
}

export function temizParca(html, taslak) {
  taslakModu = !!taslak;
  try { return temizleyici.sanitize(String(html || ''), { ...AYAR_TEMIZ, RETURN_DOM_FRAGMENT: true }); }
  finally { taslakModu = false; }
}

// Eski kayıtlar düz metin (boş satırla ayrılmış paragraflar); yenileri HTML.
export function htmlMi(metin) { return /^\s*</.test(String(metin || '')); }
