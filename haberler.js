// =====================================================================
//  AHDEM — haber ve etkinlik verisi (Supabase)
//  Ziyaretçi sayfaları yalnızca OKUR. Yazma yetkisi yonetim/ panelinde
//  ve veritabanındaki RLS kurallarıyla korunur.
//
//  Publishable anahtarın burada görünmesi normaldir. "Secret" ya da
//  "service_role" anahtarı bu dosyaya ASLA yazılmaz.
// =====================================================================

export const AYAR = {
  url: 'https://fzfvmpxhtvzzfxzooycf.supabase.co',
  anahtar: 'sb_publishable_PVboV0XhJ4gbIxnL9QF-1Q_gHEnfD8y',
  depo: 'haber-foto'
};

// ---------- okuma ----------------------------------------------------

async function oku(yol) {
  const iptal = new AbortController();
  const zaman = setTimeout(() => iptal.abort(), 8000);
  try {
    const r = await fetch(AYAR.url + '/rest/v1/' + yol, {
      headers: { apikey: AYAR.anahtar },
      signal: iptal.signal
    });
    if (!r.ok) throw new Error('Supabase ' + r.status);
    return await r.json();
  } finally {
    clearTimeout(zaman);
  }
}

function bugun() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
         String(d.getDate()).padStart(2, '0');
}

const KART_ALANLARI = 'slug,etiket,baslik,tarih,tarih_metin,yer,ozet,kapak,kapak_alt';

export function haberleriGetir(adet) {
  return oku('haberler?select=' + KART_ALANLARI +
             '&yayinda=eq.true&order=tarih.desc,olusturuldu.desc' +
             (adet ? '&limit=' + adet : ''));
}

export async function haberGetir(slug) {
  const r = await oku('haberler?select=*&yayinda=eq.true&slug=eq.' +
                      encodeURIComponent(slug) + '&limit=1');
  return r[0] || null;
}

// Tarihi geçen etkinlik kendiliğinden listeden düşer; tarihsiz olanlar
// ("Tarih yakında") en sonda kalır.
export function etkinlikleriGetir() {
  return oku('etkinlikler?select=baslik,tarih,tarih_metin,aciklama,yer' +
             '&yayinda=eq.true&or=(tarih.is.null,tarih.gte.' + bugun() + ')' +
             '&order=tarih.asc.nullslast,sira.asc');
}

// ---------- blog ----------

const YAZI_KART = 'slug,etiket,baslik,yazar,tarih,ozet,kapak,kapak_alt';

export function yazilariGetir(adet) {
  return oku('yazilar?select=' + YAZI_KART +
             '&yayinda=eq.true&order=tarih.desc,olusturuldu.desc' +
             (adet ? '&limit=' + adet : ''));
}

export async function yaziGetir(slug) {
  const r = await oku('yazilar?select=*&yayinda=eq.true&slug=eq.' +
                      encodeURIComponent(slug) + '&limit=1');
  return r[0] || null;
}

// Ana sayfadaki öne çıkan blok. Kapalıysa RLS satırı hiç vermez → null.
export async function oneCikanGetir() {
  const r = await oku('one_cikan?select=etiket,baslik,metin,dugme,baglanti&id=eq.1&limit=1');
  return r[0] || null;
}

// Yalnızca site içi yol ("/blog/") ya da https:// kabul edilir.
export function guvenliBaglanti(adres) {
  const a = String(adres || '').trim();
  if (/^\/(?![\/\\])/.test(a) || /^https:\/\/[^\s]+$/.test(a)) return a;
  return null;
}

const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz',
               'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
export function tarihYaz(iso) {
  if (!iso) return '';
  const [y, a, g] = String(iso).split('-').map(Number);
  return g + ' ' + AYLAR[a - 1] + ' ' + y;
}

export function fotoAdresi(yol) {
  return AYAR.url + '/storage/v1/object/public/' + AYAR.depo + '/' +
         String(yol).split('/').map(encodeURIComponent).join('/');
}

// ---------- DOM yardımcıları -----------------------------------------
// Veritabanından gelen metin hiçbir zaman HTML olarak yorumlanmaz;
// her şey textContent ile yazılır.

export function el(etiket, ozellik, ...cocuklar) {
  const e = document.createElement(etiket);
  for (const [k, v] of Object.entries(ozellik || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else e.setAttribute(k, v);
  }
  for (const c of cocuklar) if (c != null && c !== false) e.append(c);
  return e;
}

// Boş satırla ayrılmış paragraflar; **iki yıldız** arası kalın.
export function paragraflar(metin) {
  return String(metin || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => {
    const e = el('p');
    p.replace(/\s*\n\s*/g, ' ').split(/\*\*(.+?)\*\*/).forEach((parca, i) => {
      if (parca) e.append(i % 2 ? el('strong', { text: parca }) : parca);
    });
    return e;
  });
}

// linkOnek: haber sayfasına giden yolun başı ('haber/' ya da 'duyurular/haber/')
export function haberKarti(h, linkOnek, yerGoster) {
  const adres = linkOnek + '?s=' + encodeURIComponent(h.slug);
  const foto = h.kapak
    ? el('div', { class: 'haber-foto' },
        el('img', { src: fotoAdresi(h.kapak), alt: h.kapak_alt || h.baslik,
                    loading: 'lazy', decoding: 'async' }))
    : null;
  return el('article', { class: 'haber' + (foto ? '' : ' fotosuz') },
    foto,
    el('div', { class: 'haber-ic' },
      el('div', { class: 'tar', text: h.tarih_metin }),
      el('h3', {}, el('a', { href: adres, text: h.baslik })),
      el('p', { text: h.ozet }),
      yerGoster && h.yer ? el('div', { class: 'yer', text: h.yer }) : null,
      el('div', { class: 'devam' }, 'Haberi oku ', el('i', { text: '›' }))
    )
  );
}

// linkOnek: yazı sayfasına giden yolun başı ('yazi/' ya da 'blog/yazi/')
export function yaziKarti(y, linkOnek) {
  const adres = linkOnek + '?s=' + encodeURIComponent(y.slug);
  const foto = y.kapak
    ? el('div', { class: 'haber-foto' },
        el('img', { src: fotoAdresi(y.kapak), alt: y.kapak_alt || y.baslik,
                    loading: 'lazy', decoding: 'async' }))
    : null;
  const ust = [y.etiket, tarihYaz(y.tarih)].filter(Boolean).join(' · ');
  return el('article', { class: 'haber yazi' + (foto ? '' : ' fotosuz') },
    foto,
    el('div', { class: 'haber-ic' },
      el('div', { class: 'tar', text: ust }),
      el('h3', {}, el('a', { href: adres, text: y.baslik })),
      el('p', { text: y.ozet }),
      y.yazar ? el('div', { class: 'yer', text: y.yazar }) : null,
      el('div', { class: 'devam' }, 'Yazıyı oku ', el('i', { text: '›' }))
    )
  );
}

export function etkinlikKaydi(e) {
  return el('div', { class: 'kayit' },
    el('div', { class: 'tar', text: e.tarih_metin || 'Tarih yakında' }),
    el('div', {},
      el('h3', { text: e.baslik }),
      ...paragraflar(e.aciklama),
      e.yer ? el('div', { class: 'yer', text: e.yer }) : null
    )
  );
}

export function bosKutu(...icerik) {
  return el('div', { class: 'bos' }, el('p', {}, ...icerik));
}

export function instagramBaglantisi() {
  return el('a', { href: 'https://instagram.com/demokrasimuzakereleri', target: '_blank',
                   rel: 'noopener', style: 'color:var(--gold);', text: '@demokrasimuzakereleri' });
}

// ---------- fotoğraf büyütme -----------------------------------------

export function lightboxKur(secici) {
  const kutu = document.getElementById('lightbox');
  const gor = document.getElementById('lbGorsel');
  const sayac = document.getElementById('lbSayac');
  const fotolar = Array.from(document.querySelectorAll(secici));
  if (!kutu || !fotolar.length) return;
  let i = 0;

  const goster = n => {
    i = (n + fotolar.length) % fotolar.length;
    gor.src = fotolar[i].getAttribute('src');
    gor.alt = fotolar[i].getAttribute('alt') || '';
    sayac.textContent = (i + 1) + ' / ' + fotolar.length;
  };
  const ac = n => { goster(n); kutu.classList.add('acik'); document.body.style.overflow = 'hidden'; };
  const kapat = () => { kutu.classList.remove('acik'); document.body.style.overflow = ''; };

  fotolar.forEach((f, n) => f.addEventListener('click', () => ac(n)));
  document.getElementById('lbKapat').addEventListener('click', kapat);
  document.getElementById('lbOnceki').addEventListener('click', e => { e.stopPropagation(); goster(i - 1); });
  document.getElementById('lbSonraki').addEventListener('click', e => { e.stopPropagation(); goster(i + 1); });
  kutu.addEventListener('click', e => { if (e.target === kutu) kapat(); });
  document.addEventListener('keydown', e => {
    if (!kutu.classList.contains('acik')) return;
    if (e.key === 'Escape') kapat();
    else if (e.key === 'ArrowLeft') goster(i - 1);
    else if (e.key === 'ArrowRight') goster(i + 1);
  });
  let x0 = null;
  kutu.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  kutu.addEventListener('touchend', e => {
    if (x0 === null) return;
    const d = e.changedTouches[0].clientX - x0;
    if (Math.abs(d) > 50) goster(d < 0 ? i + 1 : i - 1);
    x0 = null;
  }, { passive: true });
}
