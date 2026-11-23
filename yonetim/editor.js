// =====================================================================
//  AHDEM Yönetim — blog metin editörü
//  contenteditable + araç çubuğu, Word'den (.docx) içe aktarma ve
//  Word'den yapıştırırken biçimi koruma. Çıktı her zaman zengin.js
//  temizleyicisinden geçer.
// =====================================================================

import { el, paragraflar } from '../haberler.js';
import { temizParca, temizHtml, htmlMi } from '../zengin.js';

const YAZI_TIPLERI = [
  ['', 'Varsayılan yazı tipi'],
  ["Lora, Georgia, serif", 'Lora'],
  ["Poppins, Arial, sans-serif", 'Poppins'],
  ["'Times New Roman', Times, serif", 'Times New Roman'],
  ["Georgia, serif", 'Georgia'],
  ["Garamond, 'EB Garamond', Georgia, serif", 'Garamond'],
  ["Cambria, Georgia, serif", 'Cambria'],
  ["Calibri, Carlito, Arial, sans-serif", 'Calibri'],
  ["Arial, Helvetica, sans-serif", 'Arial'],
  ["Verdana, Geneva, sans-serif", 'Verdana'],
  ["Tahoma, Verdana, sans-serif", 'Tahoma'],
  ["'Courier New', Courier, monospace", 'Courier New']
];
const PUNTOLAR = [8, 9, 10, 10.5, 11, 12, 13, 14, 16, 18, 20, 22, 24, 28, 32, 36, 48, 60, 72];
const BLOKLAR = [['p', 'Normal metin'], ['h2', 'Başlık 1'], ['h3', 'Başlık 2'], ['h4', 'Başlık 3'],
                 ['blockquote', 'Alıntı']];

// ---------- simgeler -------------------------------------------------
const SIMGE = {
  geri: 'M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11',
  ileri: 'm15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13',
  sol: 'M4 6h16M4 10h10M4 14h16M4 18h10',
  orta: 'M4 6h16M7 10h10M4 14h16M7 18h10',
  sag: 'M4 6h16M10 10h10M4 14h16M10 18h10',
  iki: 'M4 6h16M4 10h16M4 14h16M4 18h16',
  madde: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
  numara: 'M10 6h10M10 12h10M10 18h10M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1',
  girinti: 'M3 8l4 4-4 4M11 6h10M11 12h10M11 18h10',
  cikinti: 'M7 8l-4 4 4 4M11 6h10M11 12h10M11 18h10',
  baglanti: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
  baglantiKaldir: 'M10 13a5 5 0 0 0 7.5.5l1-1M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7M3 3l18 18',
  resim: 'M4 5h16v14H4zM4 15l4-4 5 5M14 13l2-2 4 4M15.5 8.5h.01',
  tablo: 'M3 5h18v14H3zM3 10h18M3 15h18M9 5v14M15 5v14',
  cizgi: 'M3 12h18',
  temizle: 'M4 7V5h12v2M10 5l-3 14M3 21 21 3',
  tam: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
  word: 'M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13l1.5 5 2.5-5 2.5 5L16 13'
};
function simge(ad) {
  const ns = 'http://www.w3.org/2000/svg';
  const s = document.createElementNS(ns, 'svg');
  s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('aria-hidden', 'true');
  const p = document.createElementNS(ns, 'path');
  p.setAttribute('d', SIMGE[ad]);
  s.append(p);
  return s;
}

// =====================================================================
//  Word / HTML → sitenin biçimi
//  Kaynak yalıtılmış bir iframe'de çizilir, her öğenin GERÇEK (hesaplanmış)
//  stili okunur ve yalnızca gereken özellikler satır içi stile yazılır.
// =====================================================================

function yalitimliCerceve() {
  return new Promise(coz => {
    const f = document.createElement('iframe');
    f.setAttribute('sandbox', 'allow-same-origin');
    f.setAttribute('aria-hidden', 'true');
    f.tabIndex = -1;
    f.style.cssText = 'position:fixed;left:-12000px;top:0;width:900px;height:700px;opacity:0;pointer-events:none;border:0;';
    f.srcdoc = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;color:#000;background:#fff;}</style></head><body></body></html>';
    f.onload = () => coz(f);
    document.body.append(f);
  });
}

const RGB = s => (s || '').replace(/\s+/g, '');
const SEFFAF = new Set(['transparent', 'rgba(0,0,0,0)']);
function pt(px) {
  const n = parseFloat(px);
  if (!n) return '';
  return (Math.round(n * 0.75 * 2) / 2) + 'pt';
}
function aile(f) {
  f = (f || '').trim();
  if (!f) return '';
  if (/(^|,)\s*(serif|sans-serif|monospace)\s*$/i.test(f)) return f;
  const ad = f.split(',')[0].replace(/["']/g, '').trim();
  const ek = /courier|consolas|mono/i.test(ad) ? 'monospace'
           : /times|georgia|garamond|cambria|book|palatino|baskerville|lora|serif|minion|constantia/i.test(ad) ? 'serif'
           : 'sans-serif';
  return f + ', ' + ek;
}

// docx'ten gelen görsellerin türü çoğu zaman boş; ilk baytlardan anla.
function gorselAdresi(src) {
  const m = src.match(/^data:([^;,]*);base64,(.*)$/s);
  if (!m) return '';
  const v = m[2];
  const tur = v.startsWith('iVBOR') ? 'png' : v.startsWith('/9j/') ? 'jpeg' : v.startsWith('R0lG') ? 'gif'
            : v.startsWith('UklG') ? 'webp' : '';
  return tur ? 'data:image/' + tur + ';base64,' + v : '';
}

const GECILECEK = new Set(['SCRIPT', 'STYLE', 'HEAD', 'TITLE', 'META', 'LINK', 'NOSCRIPT', 'TEMPLATE', 'XML']);

function donustur(kok, win, uyarilar) {
  const cs = e => win.getComputedStyle(e);
  const gorunmez = e => GECILECEK.has(e.tagName) || cs(e).display === 'none';
  const blokMu = e => {
    const d = cs(e).display;
    return d === 'block' || d === 'list-item' || d === 'table' || d === 'flex' || d === 'grid' ||
           ['P', 'DIV', 'LI', 'UL', 'OL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'TABLE',
            'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'PRE'].includes(e.tagName);
  };
  const altindaBlokVar = e => [...e.querySelectorAll('*')].some(c => !GECILECEK.has(c.tagName) && blokMu(c));

  // ---- 1. kaynağı sıralı blok listesine çevir ----
  function topla(dugum, liste) {
    for (const n of dugum.childNodes) {
      if (n.nodeType === 3) { if (n.textContent.trim()) liste.push({ tur: 'satir', dugum: n }); continue; }
      if (n.nodeType !== 1 || gorunmez(n)) continue;
      const t = n.tagName;
      if (t === 'TABLE') { liste.push({ tur: 'tablo', e: n }); continue; }
      if (t === 'HR') { liste.push({ tur: 'hr' }); continue; }
      if (t === 'LI') {
        liste.push({ tur: 'blok', e: n });
        for (const c of n.children) if (c.tagName === 'UL' || c.tagName === 'OL') topla(c, liste);
        continue;
      }
      if (!blokMu(n)) { liste.push({ tur: 'satir', dugum: n }); continue; }
      if (altindaBlokVar(n)) topla(n, liste);
      else liste.push({ tur: 'blok', e: n });
    }
    return liste;
  }

  // ---- 2. satır içi içerik: üst öğeden FARKLI olan biçim yazılır ----
  function satirIci(kaynak, hedef, ustStil) {
    for (const n of kaynak.childNodes) {
      if (n.nodeType === 3) {
        const m = n.textContent.replace(/[\r\n\t]+/g, ' ');
        if (m) hedef.append(m);
        continue;
      }
      if (n.nodeType !== 1 || gorunmez(n)) continue;
      const t = n.tagName;
      if (t === 'UL' || t === 'OL') continue;               // ayrı blok olarak işlenir
      if (t === 'BR') { hedef.append(el('br')); continue; }
      if (t === 'IMG') {
        const src = gorselAdresi(n.getAttribute('src') || '');
        if (src) {
          const g = Math.round(parseFloat(cs(n).width) || 0);
          hedef.append(el('img', { src, alt: n.getAttribute('alt') || '', style: g ? 'width:' + g + 'px' : null }));
        } else uyarilar.resim++;
        continue;
      }
      if (/(^|\s)\S*tab-stop(\s|$)/.test(n.className || '')) { hedef.append(' '); continue; }
      const s = cs(n);
      let ic = hedef;
      const sar = e => { ic.append(e); ic = e; };
      if (t === 'A' && n.getAttribute('href') && !/^#/.test(n.getAttribute('href'))) sar(el('a', { href: n.getAttribute('href') }));
      const kalin = parseInt(s.fontWeight, 10) >= 600, ustKalin = parseInt(ustStil.fontWeight, 10) >= 600;
      if (kalin && !ustKalin) sar(el('strong'));
      if (s.fontStyle === 'italic' && ustStil.fontStyle !== 'italic') sar(el('em'));
      const sus = s.textDecorationLine || '';
      if (/underline/.test(sus) && t !== 'A') sar(el('u'));
      if (/line-through/.test(sus)) sar(el('s'));
      if (s.verticalAlign === 'super' || t === 'SUP') sar(el('sup'));
      else if (s.verticalAlign === 'sub' || t === 'SUB') sar(el('sub'));
      const stil = [];
      if (!kalin && ustKalin) stil.push('font-weight:400');
      if (s.fontStyle !== 'italic' && ustStil.fontStyle === 'italic') stil.push('font-style:normal');
      if (s.fontFamily !== ustStil.fontFamily) stil.push('font-family:' + aile(s.fontFamily));
      if (s.fontSize !== ustStil.fontSize && !/^SU[PB]$/.test(t) && !/super|sub/.test(s.verticalAlign)) stil.push('font-size:' + pt(s.fontSize));
      if (RGB(s.color) !== RGB(ustStil.color)) stil.push('color:' + s.color);
      if (!SEFFAF.has(RGB(s.backgroundColor))) stil.push('background-color:' + s.backgroundColor);
      if (stil.length) sar(el('span', { style: stil.join(';') }));
      if (blokMu(n)) { if (hedef.childNodes.length) hedef.append(el('br')); }
      satirIci(n, ic, s);
    }
  }

  function blokStili(s, liMi) {
    const st = [];
    if (/center|right|justify/.test(s.textAlign)) st.push('text-align:' + (s.textAlign === 'end' ? 'right' : s.textAlign));
    st.push('font-family:' + aile(s.fontFamily));
    if (pt(s.fontSize)) st.push('font-size:' + pt(s.fontSize));
    if (RGB(s.color) !== 'rgb(0,0,0)') st.push('color:' + s.color);
    if (!SEFFAF.has(RGB(s.backgroundColor))) st.push('background-color:' + s.backgroundColor);
    if (parseFloat(s.fontWeight) >= 600) st.push('font-weight:600');
    if (s.fontStyle === 'italic') st.push('font-style:italic');
    if (!liMi) {
      const ml = parseFloat(s.marginLeft) || 0, ti = parseFloat(s.textIndent) || 0;
      if (ml > 2) st.push('margin-left:' + pt(ml));
      if (Math.abs(ti) > 2) st.push('text-indent:' + (ti < 0 ? '-' : '') + pt(Math.abs(ti)));
    }
    return st.join(';');
  }

  // Liste ve başlık bilgisi
  function listeBilgisi(e) {
    if (e.dataset.wListe) return { sirali: e.dataset.wListe === 'o', seviye: +e.dataset.wSeviye || 0, tip: e.dataset.wTip || '' };
    if (e.tagName === 'LI') {
      let seviye = -1, p = e.parentElement, ust = null;
      while (p && p !== kok) { if (p.tagName === 'UL' || p.tagName === 'OL') { seviye++; ust = ust || p; } p = p.parentElement; }
      const tip = ust ? cs(ust).listStyleType : '';
      return { sirali: !!ust && ust.tagName === 'OL', seviye: Math.max(0, seviye), tip };
    }
    const m = (e.className || '').match(/-num-[^\s]*-(\d+)(\s|$)/);
    if (m) {
      const once = win.getComputedStyle(e, '::before').content || '';
      const sayac = once.match(/counter\([^,)]+,\s*([a-z-]+)/i);
      return { sirali: /counter\(/.test(once), seviye: +m[1], tip: sayac ? sayac[1] : '',
               girinti: Math.round(parseFloat(cs(e).marginLeft) || 0) };
    }
    return null;
  }
  function baslikSeviyesi(e) {
    const t = e.tagName;
    if (/^H[1-6]$/.test(t)) return Math.min(4, Math.max(2, +t[1] + 1));
    const m = (e.className || '').match(/(heading|balk|baslik|başlık)[_-]?(\d)/i);
    if (m) return Math.min(4, +m[2] + 1);
    if (/_(title|konubal|konu)/i.test(e.className || '')) return 2;
    return 0;
  }

  // ---- 3. blokları üret, listeleri iç içe topla ----
  function insaEt(liste, hedef) {
    // Word'de "Madde İşareti 2" gibi stiller ayrı listede 0. seviyedir; gerçek
    // iç içeliği girintiden çıkar: ardışık liste öğelerindeki farklı girintiler sıralanır.
    let grup = [];
    const grupBitir = () => {
      const girintiler = [...new Set(grup.map(b => b.li.girinti))].sort((a, b) => a - b);
      if (girintiler.length > 1) for (const b of grup) b.li.seviye = girintiler.indexOf(b.li.girinti);
      grup = [];
    };
    for (const b of liste) {
      b.li = b.tur === 'blok' ? listeBilgisi(b.e) : null;
      if (b.li && b.li.girinti != null) grup.push(b); else grupBitir();
    }
    grupBitir();
    let satirP = null;
    let yigin = [];                       // [{ liste, seviye, sirali, sonLi }]
    const listeKapat = () => { yigin = []; };
    for (const b of liste) {
      if (b.tur === 'satir') {
        listeKapat();
        if (!satirP) {
          satirP = el('p');
          const ust = b.dugum.parentElement;
          if (ust) satirP.setAttribute('style', blokStili(cs(ust)));
          hedef.append(satirP);
        }
        if (b.dugum.nodeType === 3) satirP.append(b.dugum.textContent.replace(/[\r\n\t]+/g, ' '));
        else satirIci({ childNodes: [b.dugum] }, satirP, cs(b.dugum.parentElement));
        continue;
      }
      satirP = null;
      if (b.tur === 'hr') { listeKapat(); hedef.append(el('hr')); continue; }
      if (b.tur === 'tablo') {
        listeKapat();
        const tablo = el('table'), govde = el('tbody');
        tablo.append(govde);
        for (const tr of b.e.rows) {
          const satir = el('tr');
          for (const hucre of tr.cells) {
            const h = el(hucre.tagName === 'TH' ? 'th' : 'td', {
              colspan: hucre.colSpan > 1 ? hucre.colSpan : null,
              rowspan: hucre.rowSpan > 1 ? hucre.rowSpan : null });
            const hs = cs(hucre);
            if (!SEFFAF.has(RGB(hs.backgroundColor))) h.setAttribute('style', 'background-color:' + hs.backgroundColor);
            insaEt(topla(hucre, []), h);
            satir.append(h);
          }
          govde.append(satir);
        }
        hedef.append(tablo);
        continue;
      }
      const e = b.e, s = cs(e);
      const li = b.li;
      if (li) {
        while (yigin.length && yigin[yigin.length - 1].seviye > li.seviye) yigin.pop();
        let ust = yigin[yigin.length - 1];
        if (ust && ust.seviye === li.seviye && ust.sirali !== li.sirali) { yigin.pop(); ust = yigin[yigin.length - 1]; }
        if (!ust || ust.seviye < li.seviye) {
          const yeni = el(li.sirali ? 'ol' : 'ul');
          if (li.tip && !/^(disc|decimal|none)$/.test(li.tip) && /^[a-z-]+$/.test(li.tip)) yeni.style.listStyleType = li.tip;
          if (ust && ust.sonLi) ust.sonLi.append(yeni); else hedef.append(yeni);
          ust = { liste: yeni, seviye: li.seviye, sirali: li.sirali, sonLi: null };
          yigin.push(ust);
        }
        const oge = el('li', { style: blokStili(s, true) || null });
        satirIci(e, oge, s);
        ust.liste.append(oge);
        ust.sonLi = oge;
        continue;
      }
      listeKapat();
      const bs = baslikSeviyesi(e);
      const alinti = e.tagName === 'BLOCKQUOTE' || /_(quote|alinti|alnt|intensequote)/i.test(e.className || '');
      const yeni = el(bs ? 'h' + bs : alinti ? 'blockquote' : 'p');
      const st = blokStili(s, false);
      if (st) yeni.setAttribute('style', st);
      const atilanOnce = uyarilar.resim;
      satirIci(e, yeni, s);
      if (!yeni.textContent.trim() && !yeni.querySelector('img')) {
        if (uyarilar.resim > atilanOnce) continue;              // yalnızca aktarılamayan görsel vardı
        if (!yeni.querySelector('br')) yeni.append(el('br'));   // Word'deki boş satır korunur
      }
      hedef.append(yeni);
    }
  }

  const sonuc = document.createDocumentFragment();
  insaEt(topla(kok, []), sonuc);
  return sonuc;
}

// Word'ün panoya koyduğu HTML'deki listeleri ve çöp öğeleri ön işle.
function wordOnIsle(belge, uyarilar) {
  belge.querySelectorAll('[style*="mso-list"]').forEach(e => {
    const st = e.getAttribute('style') || '';
    if (/mso-list:\s*ignore/i.test(st)) return;
    const m = st.match(/level(\d+)/i);
    if (!m || e.tagName !== 'P') return;
    const isaret = e.querySelector('[style*="mso-list:Ignore"],[style*="mso-list: Ignore"],[style*="mso-list:ignore"]');
    const metin = isaret ? isaret.textContent.trim() : '';
    e.dataset.wListe = /^[\(\[]?([0-9]+|[a-zA-Z]{1,3}|[ivxlcdmIVXLCDM]+)[.)\]]/.test(metin) ? 'o' : 'u';
    e.dataset.wSeviye = +m[1] - 1;
    if (/^[a-z][.)]/.test(metin)) e.dataset.wTip = 'lower-alpha';
    else if (/^[A-Z][.)]/.test(metin)) e.dataset.wTip = 'upper-alpha';
    else if (/^[ivx]+[.)]/.test(metin)) e.dataset.wTip = 'lower-roman';
    else if (/^[IVX]+[.)]/.test(metin)) e.dataset.wTip = 'upper-roman';
  });
  belge.querySelectorAll('[style*="mso-list"]').forEach(e => {
    if (/mso-list:\s*ignore/i.test(e.getAttribute('style') || '')) e.remove();
  });
  belge.querySelectorAll('script,link,meta,iframe,object,embed,o\\:p').forEach(e => e.remove());
  belge.querySelectorAll('img').forEach(e => {
    if (!gorselAdresi(e.getAttribute('src') || '')) { uyarilar.resim++; e.remove(); }
  });
}

async function htmlDonustur(html) {
  const uyarilar = { resim: 0 };
  const belge = new DOMParser().parseFromString(html, 'text/html');
  wordOnIsle(belge, uyarilar);
  const f = await yalitimliCerceve();
  try {
    const d = f.contentDocument;
    for (const st of belge.querySelectorAll('style')) d.head.append(d.importNode(st, true));
    d.body.replaceChildren(...[...belge.body.childNodes].map(n => d.importNode(n, true)));
    return { parca: donustur(d.body, f.contentWindow, uyarilar), uyarilar };
  } finally { f.remove(); }
}

// ---- .docx: docx-preview ile çiz, sonra aynı dönüştürücüden geçir ----
const KUTUPHANE = [
  ['https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
   'sha384-+mbV2IY1Zk/X1p/nWllGySJSUN8uMs+gUAN10Or95UBH0fpj6GfKgPmgC5EXieXG'],
  ['https://cdn.jsdelivr.net/npm/docx-preview@0.3.7/dist/docx-preview.min.js',
   'sha384-Fw+ZM2MtvxCe867uRzZY5GtGP+gs0NLvrlJS768RZWuKhOHMN4Fln3i3gMt1NSyQ']
];
let kutuphaneSozu = null;
function kutuphaneYukle() {
  if (!kutuphaneSozu) {
    kutuphaneSozu = KUTUPHANE.reduce((onceki, [src, sri]) => onceki.then(() => new Promise((coz, red) => {
      const s = document.createElement('script');
      s.src = src; s.integrity = sri; s.crossOrigin = 'anonymous';
      s.onload = coz;
      s.onerror = () => red(new Error('Word okuyucu yüklenemedi. İnternet bağlantını kontrol et.'));
      document.head.append(s);
    })), Promise.resolve()).catch(e => { kutuphaneSozu = null; throw e; });
  }
  return kutuphaneSozu;
}

async function docxDonustur(dosya) {
  await kutuphaneYukle();
  const uyarilar = { resim: 0 };
  const f = await yalitimliCerceve();
  try {
    const d = f.contentDocument;
    const govde = d.createElement('div'), stil = d.createElement('div');
    d.head.append(stil); d.body.append(govde);
    await window.docx.renderAsync(dosya, govde, stil, {
      className: 'w', inWrapper: true, ignoreWidth: true, ignoreHeight: true, ignoreFonts: true,
      breakPages: false, renderHeaders: false, renderFooters: false, renderFootnotes: true,
      renderEndnotes: true, renderComments: false, renderChanges: false, useBase64URL: true,
      experimental: true
    });
    // docx-preview, varsayılan paragraf stilini (Normal) sınıfsız paragrafların
    // içindeki metne uygulamıyor; Word'deki gibi olsun diye sınıfı açıkça ekle.
    const vars = (stil.textContent.match(/\.w p, p\.(w_[\w-]+)/) || [])[1];
    if (vars) govde.querySelectorAll('p').forEach(p => {
      if (![...p.classList].some(c => c.startsWith('w_'))) p.classList.add(vars);
    });
    return { parca: donustur(govde, f.contentWindow, uyarilar), uyarilar };
  } finally { f.remove(); }
}

// =====================================================================
//  Editör
// =====================================================================

export function editorKur({ kap, alan, kelimeSay, durum, resimHazirla, degisti }) {
  let kayitliAralik = null;
  const odakla = () => {
    alan.focus();
    if (kayitliAralik) { const s = getSelection(); s.removeAllRanges(); s.addRange(kayitliAralik); }
  };
  document.addEventListener('selectionchange', () => {
    const s = getSelection();
    if (s.rangeCount && alan.contains(s.anchorNode)) { kayitliAralik = s.getRangeAt(0).cloneRange(); durumGuncelle(); }
  });

  const komut = (ad, deger, css) => {
    odakla();
    document.execCommand('styleWithCSS', false, !!css);
    document.execCommand(ad, false, deger ?? null);
    sonra();
  };
  function sonra() { yapiDuzelt(); degisti(); sayac(); durumGuncelle(); }

  // Chrome'un liste komutlarının bıraktığı geçersiz yapıları düzelt:
  // <p><ul>…</ul></p> → <ul>…</ul>, <ul><ul>…</ul></ul> → önceki maddenin içine.
  function yapiDuzelt() {
    alan.querySelectorAll('p > ul, p > ol').forEach(l => {
      const p = l.parentElement;
      const hiza = p.style.textAlign;
      if (hiza) l.querySelectorAll(':scope > li').forEach(li => { if (!li.style.textAlign) li.style.textAlign = hiza; });
      if ([...p.childNodes].every(n => n === l || (n.nodeType === 3 && !n.textContent.trim()))) p.replaceWith(l);
      else p.after(l);
    });
    alan.querySelectorAll('ul > ul, ul > ol, ol > ul, ol > ol').forEach(l => {
      const onceki = l.previousElementSibling;
      if (onceki && onceki.tagName === 'LI') onceki.append(l);
    });
  }

  // Seçime bir stil özelliği uygula (font etiketi üretip span'e çevirerek).
  function stilUygula(ozellik, deger) {
    odakla();
    const s = getSelection();
    if (!s.rangeCount || s.isCollapsed) { bildirim('Önce biçimlendirilecek metni seç.'); return; }
    // Her özellik yalnızca kendi komutuyla işaretlenir; böylece punto değişince
    // yazı tipi ya da renk silinmez.
    if (ozellik === 'background-color') {
      document.execCommand('styleWithCSS', false, true);
      document.execCommand('hiliteColor', false, deger);
      sonra(); return;
    }
    document.execCommand('styleWithCSS', false, false);
    let secici;
    if (ozellik === 'font-size') { document.execCommand('fontSize', false, '7'); secici = 'font[size="7"]'; }
    else if (ozellik === 'color') { document.execCommand('foreColor', false, deger); secici = 'font[color]'; }
    else {
      const isaret = 'ahdem-isaret-' + Date.now();
      document.execCommand('fontName', false, isaret);
      secici = 'font[face="' + isaret + '"]';
    }
    const yeni = [];
    alan.querySelectorAll(secici).forEach(f => {
      const sp = document.createElement('span');
      if (deger) sp.style.setProperty(ozellik, deger);
      sp.append(...f.childNodes);
      sp.querySelectorAll('[style]').forEach(c => { c.style.removeProperty(ozellik); if (!c.getAttribute('style')) c.removeAttribute('style'); });
      f.replaceWith(sp);
      if (!sp.getAttribute('style')) { sp.replaceWith(...sp.childNodes); } else yeni.push(sp);
    });
    if (yeni.length) {
      const r = document.createRange();
      r.setStartBefore(yeni[0]); r.setEndAfter(yeni[yeni.length - 1]);
      s.removeAllRanges(); s.addRange(r);
    }
    sonra();
  }

  function bildirim(m, hata) { durum.textContent = m; durum.classList.toggle('hata', !!hata); clearTimeout(bildirim.z); bildirim.z = setTimeout(() => { durum.textContent = ''; }, 6000); }

  // ---------- araç çubuğu ----------
  const cubuk = el('div', { class: 'ed-cubuk', role: 'toolbar', 'aria-label': 'Metin biçimi' });
  const grup = (...c) => el('div', { class: 'ed-grup' }, ...c);
  const dugmeler = {};
  function dugme(ad, baslik, is, { simgeAd, metin, durumKomut } = {}) {
    const b = el('button', { type: 'button', class: 'ed-d', title: baslik, 'aria-label': baslik });
    if (simgeAd) b.append(simge(simgeAd)); else b.append(metin);
    b.addEventListener('mousedown', e => e.preventDefault());
    b.addEventListener('click', is);
    if (durumKomut) dugmeler[durumKomut] = b;
    return b;
  }
  function secim(baslik, secenekler, is, genis) {
    const s = el('select', { class: 'ed-sec', title: baslik, 'aria-label': baslik, style: genis ? 'width:' + genis : null });
    for (const [v, m] of secenekler) s.append(el('option', { value: v, text: m }));
    s.addEventListener('change', () => { const v = s.value; is(v); });
    return s;
  }
  function renk(baslik, harf, ozellik, varsayilan) {
    const k = el('span', { class: 'ed-d ed-renk', title: baslik });
    const cizgi = el('span', { class: 'ed-renk-cizgi', style: 'background:' + varsayilan });
    const g = el('input', { type: 'color', value: varsayilan, 'aria-label': baslik });
    k.append(el('span', { class: 'ed-renk-harf', text: harf }), cizgi, g);
    k.addEventListener('mousedown', () => { const s = getSelection(); if (s.rangeCount && alan.contains(s.anchorNode)) kayitliAralik = s.getRangeAt(0).cloneRange(); });
    g.addEventListener('change', () => { cizgi.style.background = g.value; stilUygula(ozellik, g.value); });
    return k;
  }

  const blokSec = secim('Paragraf biçimi', BLOKLAR, v => komut('formatBlock', '<' + v + '>'), '128px');
  const tipSec = secim('Yazı tipi', YAZI_TIPLERI, v => stilUygula('font-family', v), '148px');
  const puntoSec = secim('Punto', [['', 'Punto'], ...PUNTOLAR.map(p => [String(p), String(p)])],
                         v => { if (v) stilUygula('font-size', v + 'pt'); }, '74px');
  YAZI_TIPLERI.forEach(([v], i) => { tipSec.options[i].style.fontFamily = v || 'inherit'; });

  const wordDosya = el('input', { type: 'file', accept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document', hidden: true });
  const resimDosya = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp,image/gif', hidden: true });

  cubuk.append(
    grup(dugme('geri', 'Geri al (Ctrl+Z)', () => komut('undo'), { simgeAd: 'geri' }),
         dugme('ileri', 'Yinele (Ctrl+Y)', () => komut('redo'), { simgeAd: 'ileri' })),
    grup(blokSec),
    grup(tipSec, puntoSec),
    grup(dugme('b', 'Kalın (Ctrl+B)', () => komut('bold'), { metin: el('b', { text: 'K' }), durumKomut: 'bold' }),
         dugme('i', 'İtalik (Ctrl+I)', () => komut('italic'), { metin: el('i', { text: 'İ', style: 'font-family:Lora,serif' }), durumKomut: 'italic' }),
         dugme('u', 'Altı çizili (Ctrl+U)', () => komut('underline'), { metin: el('u', { text: 'A' }), durumKomut: 'underline' }),
         dugme('s', 'Üstü çizili', () => komut('strikeThrough'), { metin: el('s', { text: 'S' }), durumKomut: 'strikeThrough' }),
         dugme('sup', 'Üst simge', () => komut('superscript'), { metin: el('span', {}, 'x', el('sup', { text: '2' })), durumKomut: 'superscript' }),
         dugme('sub', 'Alt simge', () => komut('subscript'), { metin: el('span', {}, 'x', el('sub', { text: '2' })), durumKomut: 'subscript' })),
    grup(renk('Yazı rengi', 'A', 'color', '#b3261e'), renk('Vurgu rengi', 'V', 'background-color', '#fff2a8')),
    grup(dugme('sol', 'Sola hizala', () => komut('justifyLeft'), { simgeAd: 'sol', durumKomut: 'justifyLeft' }),
         dugme('orta', 'Ortala', () => komut('justifyCenter'), { simgeAd: 'orta', durumKomut: 'justifyCenter' }),
         dugme('sag', 'Sağa hizala', () => komut('justifyRight'), { simgeAd: 'sag', durumKomut: 'justifyRight' }),
         dugme('iki', 'İki yana yasla', () => komut('justifyFull'), { simgeAd: 'iki', durumKomut: 'justifyFull' })),
    grup(dugme('madde', 'Madde işaretli liste', () => komut('insertUnorderedList'), { simgeAd: 'madde', durumKomut: 'insertUnorderedList' }),
         dugme('numara', 'Numaralı liste', () => komut('insertOrderedList'), { simgeAd: 'numara', durumKomut: 'insertOrderedList' }),
         dugme('cikinti', 'Girintiyi azalt', () => komut('outdent', null, true), { simgeAd: 'cikinti' }),
         dugme('girinti', 'Girintiyi artır', () => komut('indent', null, true), { simgeAd: 'girinti' })),
    grup(dugme('baglanti', 'Bağlantı ekle (Ctrl+K)', baglantiEkle, { simgeAd: 'baglanti' }),
         dugme('baglantiKaldir', 'Bağlantıyı kaldır', () => komut('unlink'), { simgeAd: 'baglantiKaldir' }),
         dugme('resim', 'Resim ekle', () => { odakla(); resimDosya.click(); }, { simgeAd: 'resim' }),
         dugme('tablo', 'Tablo ekle', tabloEkle, { simgeAd: 'tablo' }),
         dugme('cizgi', 'Yatay çizgi', () => komut('insertHorizontalRule'), { simgeAd: 'cizgi' })),
    grup(dugme('temizle', 'Biçimi temizle', () => { komut('removeFormat'); }, { simgeAd: 'temizle' }),
         dugme('tam', 'Tam ekran', () => { kap.classList.toggle('ed-tam'); document.body.classList.toggle('ed-tam-acik', kap.classList.contains('ed-tam')); alan.focus(); }, { simgeAd: 'tam' })),
    grup(dugme('word', "Word'den içe aktar (.docx)", () => wordDosya.click(), { metin: el('span', { class: 'ed-word' }, simge('word'), ' Word\'den aktar') })),
    wordDosya, resimDosya
  );
  kap.prepend(cubuk);

  function baglantiEkle() {
    if (!kayitliAralik || kayitliAralik.collapsed) { bildirim('Önce bağlantı verilecek metni seç.'); return; }
    const adres = (prompt('Bağlantı adresi (https://… ya da /blog/ gibi site içi yol):', 'https://') || '').trim();
    if (!adres || adres === 'https://') return;
    if (!/^(https?:\/\/\S+|mailto:\S+|\/(?![\/\\])\S*)$/i.test(adres)) { bildirim('Geçersiz adres. https:// ile başlamalı.', true); return; }
    komut('createLink', adres);
  }
  function tabloEkle() {
    const g = (prompt('Tablo boyutu (satır x sütun):', '3x3') || '').toLowerCase().match(/^\s*(\d{1,2})\s*[x×*]\s*(\d{1,2})\s*$/);
    if (!g) return;
    const sat = Math.min(+g[1], 50), sut = Math.min(+g[2], 12);
    const tablo = el('table', {}, el('tbody', {}, ...Array.from({ length: sat }, () =>
      el('tr', {}, ...Array.from({ length: sut }, () => el('td', {}, el('br')))))));
    const kap2 = el('div', {}, tablo, el('p', {}, el('br')));
    komut('insertHTML', kap2.innerHTML);
  }

  // ---------- durum (aktif düğmeler, seçili yazı tipi/punto) ----------
  function durumGuncelle() {
    for (const [k, b] of Object.entries(dugmeler)) {
      let a = false; try { a = document.queryCommandState(k); } catch {}
      b.classList.toggle('aktif', a);
    }
    const s = getSelection();
    if (!s.rangeCount || !alan.contains(s.anchorNode)) return;
    let e = s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentElement;
    if (!e || !alan.contains(e)) return;
    const st = getComputedStyle(e);
    const p = pt(st.fontSize).replace('pt', '');
    puntoSec.value = PUNTOLAR.includes(+p) ? p : '';
    puntoSec.options[0].text = p ? p : 'Punto';
    const ilk = st.fontFamily.split(',')[0].replace(/["']/g, '').trim().toLowerCase();
    const i = YAZI_TIPLERI.findIndex(([v]) => v && v.split(',')[0].replace(/["']/g, '').trim().toLowerCase() === ilk);
    tipSec.value = i > 0 ? YAZI_TIPLERI[i][0] : '';
    const blok = e.closest('p,h2,h3,h4,blockquote,li,td,th');
    const bt = blok ? blok.tagName.toLowerCase() : 'p';
    blokSec.value = BLOKLAR.some(([v]) => v === bt) ? bt : 'p';
  }

  // ---------- kelime sayacı ----------
  function sayac() {
    const m = alan.innerText.trim();
    const k = m ? m.split(/\s+/).length : 0;
    kelimeSay.textContent = k.toLocaleString('tr-TR') + ' kelime · ' + m.length.toLocaleString('tr-TR') + ' karakter';
  }

  // ---------- ekleme yardımcıları ----------
  function htmlEkle(html) {
    odakla();
    document.execCommand('styleWithCSS', false, false);
    document.execCommand('insertHTML', false, temizHtml(html, true));
    sonra();
  }

  async function resimEkle(dosya) {
    try {
      bildirim('Resim hazırlanıyor…');
      const dataUrl = await resimHazirla(dosya);
      const alt = (prompt('Resmin kısa açıklaması (görme engelli okurlar ve Google için, boş bırakılabilir):', '') || '').trim();
      htmlEkle(el('div', {}, el('img', { src: dataUrl, alt })).innerHTML);
      bildirim('Resim eklendi. Kaydettiğinde siteye yüklenir.');
    } catch (err) { bildirim(err.message, true); }
  }

  async function wordAktar(dosya) {
    if (!/\.docx$/i.test(dosya.name)) {
      bildirim(/\.doc$/i.test(dosya.name) ? 'Eski .doc biçimi okunamıyor. Word\'de "Farklı Kaydet → Word Belgesi (.docx)" yapıp tekrar dene.' : 'Yalnızca .docx dosyası seç.', true);
      return;
    }
    if (bos() === false && !confirm('Editördeki mevcut metin silinip yerine Word belgesi konsun mu?')) return;
    try {
      bildirim('Word belgesi okunuyor…');
      const { parca, uyarilar } = await docxDonustur(dosya);
      alan.replaceChildren(temizParca(serilestir(parca), true));
      if (!alan.childNodes.length) alan.append(el('p', {}, el('br')));
      sonra();
      bildirim('Word belgesi aktarıldı.' + (uyarilar.resim ? ' ' + uyarilar.resim + ' görsel aktarılamadı; onları "Resim ekle" ile ayrıca ekle.' : ''));
      alan.focus();
    } catch (err) {
      console.error(err);
      bildirim('Word belgesi okunamadı: ' + (err.message || err), true);
    }
  }

  function serilestir(parca) { const d = document.createElement('div'); d.append(parca); return d.innerHTML; }

  wordDosya.addEventListener('change', () => { const d = wordDosya.files[0]; wordDosya.value = ''; if (d) wordAktar(d); });
  resimDosya.addEventListener('change', () => { const d = resimDosya.files[0]; resimDosya.value = ''; if (d) resimEkle(d); });

  // ---------- yapıştırma / sürükle-bırak ----------
  alan.addEventListener('paste', async e => {
    const cd = e.clipboardData;
    if (!cd) return;
    const html = cd.getData('text/html');
    const dosyalar = [...cd.files].filter(f => f.type.startsWith('image/'));
    if (!html && dosyalar.length) { e.preventDefault(); for (const f of dosyalar) await resimEkle(f); return; }
    if (!html) return;                                   // düz metin: tarayıcı halletsin
    e.preventDefault();
    const sec = getSelection();
    const aralik = sec.rangeCount && alan.contains(sec.anchorNode) ? sec.getRangeAt(0).cloneRange() : kayitliAralik;
    try {
      const wordMu = /urn:schemas-microsoft-com:office|mso-|class="?Mso/i.test(html);
      let eklenecek;
      if (wordMu || /docs-internal-guid|google-docs/i.test(html)) {
        const { parca, uyarilar } = await htmlDonustur(html);
        eklenecek = serilestir(parca);
        if (uyarilar.resim) bildirim(uyarilar.resim + ' görsel yapıştırılamadı (Word panoya dosya yolu koyuyor). Belgeyi "Word\'den aktar" ile al ya da resmi ayrıca ekle.');
      } else {
        eklenecek = temizHtml(html, true);
      }
      kayitliAralik = aralik;
      htmlEkle(eklenecek);
    } catch (err) {
      console.error(err);
      document.execCommand('insertText', false, cd.getData('text/plain'));
      bildirim('Biçim aktarılamadı, düz metin olarak yapıştırıldı.', true);
    }
  });
  alan.addEventListener('dragover', e => { if ([...e.dataTransfer.types].includes('Files')) e.preventDefault(); });
  alan.addEventListener('drop', e => {
    const dosyalar = [...(e.dataTransfer?.files || [])];
    if (!dosyalar.length) return;
    e.preventDefault();
    const nokta = document.caretRangeFromPoint ? document.caretRangeFromPoint(e.clientX, e.clientY) : null;
    if (nokta) kayitliAralik = nokta;
    for (const d of dosyalar) {
      if (/\.docx$/i.test(d.name)) { wordAktar(d); return; }
      if (d.type.startsWith('image/')) resimEkle(d);
    }
  });

  alan.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); baglantiEkle(); }
    if (e.key === 'Tab' && getSelection().anchorNode && getSelection().anchorNode.parentElement?.closest('li')) {
      e.preventDefault(); komut(e.shiftKey ? 'outdent' : 'indent', null, true);
    }
    if (e.key === 'Escape' && kap.classList.contains('ed-tam')) { kap.classList.remove('ed-tam'); document.body.classList.remove('ed-tam-acik'); }
  });
  alan.addEventListener('input', () => { degisti(); sayac(); });

  document.execCommand('defaultParagraphSeparator', false, 'p');

  // ---------- dışa açılan ----------
  function bos() {
    return !alan.textContent.trim() && !alan.querySelector('img,table,hr');
  }
  return {
    yukle(govde) {
      if (htmlMi(govde)) alan.replaceChildren(temizParca(govde, true));
      else alan.replaceChildren(...paragraflar(govde));
      if (!alan.childNodes.length) alan.append(el('p', {}, el('br')));
      kayitliAralik = null;
      kap.classList.remove('ed-tam'); document.body.classList.remove('ed-tam-acik');
      durum.textContent = '';
      sayac();
    },
    bos,
    // Kaydetmeden önce: temiz HTML'i taslak modunda bir kopyaya döker (görseller henüz data:).
    kopya() {
      const d = document.createElement('div');
      d.append(temizParca(alan.innerHTML, true));
      return d;
    }
  };
}

// Kaydedilecek son HTML: data: görseller yüklenmiş olmalı; kalanlar atılır.
export function sonHtml(kap) {
  // Sondaki boş paragrafları at
  while (kap.lastChild && kap.lastChild.nodeType === 1 && /^(P|H[2-4])$/.test(kap.lastChild.tagName) &&
         !kap.lastChild.textContent.trim() && !kap.lastChild.querySelector('img')) kap.lastChild.remove();
  return temizHtml(kap.innerHTML, false).trim();
}
