// =====================================================================
//  AHDEM — yönetim paneli
//  Giriş: Supabase Auth (e-posta + şifre).
//  Yetki: veritabanındaki editors tablosu (is_editor()). Bu dosyanın
//  herkese görünür olması bir açık değildir; ne yapılabileceğine
//  sunucudaki RLS kuralları karar verir.
// =====================================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1/+esm';
import { AYAR, fotoAdresi, el } from '../haberler.js';

const sb = createClient(AYAR.url, AYAR.anahtar);
const $ = id => document.getElementById(id);
const AYLAR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz',
               'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const SLUG_KALIP = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// ---------- yardımcılar ----------------------------------------------

function goster(bolum) {
  $('gYukleniyor').hidden = true;
  for (const b of ['gGiris', 'gYetkisiz', 'gAna']) $(b).hidden = b !== bolum;
}

let bildirimZaman;
function bildir(mesaj, hata) {
  const b = $('bildirim');
  b.textContent = mesaj;
  b.className = 'p-bildirim' + (hata ? ' hata' : '');
  b.hidden = false;
  clearTimeout(bildirimZaman);
  bildirimZaman = setTimeout(() => { b.hidden = true; }, hata ? 7000 : 3500);
}

function tarihMetni(iso) {
  if (!iso) return '';
  const [y, a, g] = iso.split('-').map(Number);
  return g + ' ' + AYLAR[a - 1] + ' ' + y;
}

function slugla(s) {
  const tr = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'i̇': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'â': 'a', 'î': 'i', 'û': 'u' };
  return String(s).toLocaleLowerCase('tr').replace(/i̇|[çğıöşüâîû]/g, c => tr[c] || c)
    .replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
    .replace(/-+$/, '');
}

function hataMetni(err) {
  const m = (err && (err.message || err.error_description || err.error)) || String(err);
  if (err && err.code === '23505') return 'Bu adres başka bir haberde kullanılıyor. Adresi değiştir.';
  if ((err && err.code === '42501') || /row-level security|Unauthorized/i.test(m))
    return 'Yetkin yok. Oturumun kapanmış olabilir ya da hesabın editors tablosunda kayıtlı değil.';
  if (/JWT|session|token/i.test(m)) return 'Oturumun süresi dolmuş. Sayfayı yenileyip tekrar giriş yap.';
  if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'Bağlantı kurulamadı. İnternetini kontrol et.';
  return m;
}

// Fotoğrafı en fazla 1000 piksele küçült, JPEG kalite 78 (sitenin kuralı).
function kucult(dosya) {
  return new Promise((coz, red) => {
    const url = URL.createObjectURL(dosya);
    const im = new Image();
    im.onerror = () => { URL.revokeObjectURL(url); red(new Error('Bu fotoğraf okunamadı. JPEG ya da PNG seç.')); };
    im.onload = () => {
      URL.revokeObjectURL(url);
      let en = im.naturalWidth, boy = im.naturalHeight;
      const max = 1000;
      if (en > max || boy > max) {
        if (en >= boy) { boy = Math.round(boy * max / en); en = max; }
        else { en = Math.round(en * max / boy); boy = max; }
      }
      const c = document.createElement('canvas');
      c.width = en; c.height = boy;
      const x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, en, boy);
      x.drawImage(im, 0, 0, en, boy);
      c.toBlob(b => b ? coz({ blob: b, url: URL.createObjectURL(b) })
                      : red(new Error('Fotoğraf dönüştürülemedi.')), 'image/jpeg', 0.78);
    };
    im.src = url;
  });
}

async function fotoYukle(klasor, blob) {
  const yol = klasor + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.jpg';
  const { error } = await sb.storage.from(AYAR.depo)
    .upload(yol, blob, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: false });
  if (error) throw error;
  return yol;
}

async function fotoSil(yollar) {
  const liste = yollar.filter(Boolean);
  if (!liste.length) return;
  const { error } = await sb.storage.from(AYAR.depo).remove(liste);
  if (error) console.warn('Fotoğraf silinemedi:', error);
}

// Açık form varken sayfadan çıkılırsa uyar.
let formKirli = false;
window.addEventListener('beforeunload', e => { if (formKirli) { e.preventDefault(); e.returnValue = ''; } });

// ---------- oturum ---------------------------------------------------

async function oturumKontrol() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    $('kullanici').hidden = true;
    goster('gGiris');
    return;
  }
  $('kEposta').textContent = session.user.email || '';
  $('kullanici').hidden = false;

  const { data: yetki, error } = await sb.rpc('is_editor');
  if (error || yetki !== true) { goster('gYetkisiz'); return; }

  goster('gAna');
  haberleriYukle();
  etkinlikleriYukle();
}

$('girisForm').addEventListener('submit', async e => {
  e.preventDefault();
  const dugme = $('girisDugme');
  $('girisHata').textContent = '';
  dugme.disabled = true;
  const { error } = await sb.auth.signInWithPassword({
    email: $('gEposta').value.trim(),
    password: $('gSifre').value
  });
  dugme.disabled = false;
  if (error) {
    $('girisHata').textContent = /invalid login credentials/i.test(error.message)
      ? 'E-posta ya da şifre hatalı.' : 'Giriş yapılamadı: ' + hataMetni(error);
    return;
  }
  $('gSifre').value = '';
  await oturumKontrol();
});

$('cikis').addEventListener('click', async () => {
  if (formKirli && !confirm('Kaydedilmemiş değişiklikler var. Yine de çıkış yapılsın mı?')) return;
  formKirli = false;
  await sb.auth.signOut();
  haberFormKapat(); etkinlikFormKapat();
  await oturumKontrol();
});

// ---------- sekmeler -------------------------------------------------

document.querySelectorAll('.p-sekme').forEach(s => s.addEventListener('click', () => {
  document.querySelectorAll('.p-sekme').forEach(x => {
    const secili = x === s;
    x.setAttribute('aria-selected', secili ? 'true' : 'false');
    $(x.dataset.sekme).hidden = !secili;
  });
}));

// =====================================================================
//  HABERLER
// =====================================================================

let haberler = [];
let hDuzenlenen = null;        // düzenlenen haberin id'si; yeni haberde null
let hKapak = null;             // { yol, url } kayıtlı | { blob, url } yeni | null
let hGaleri = [];              // [{ yol?, blob?, url, alt }]
let hEskiYollar = [];          // düzenleme başladığında kayıtlı olan fotoğraflar
let hSlugElle = false, hTarihElle = false;

async function haberleriYukle() {
  const { data, error } = await sb.from('haberler').select('*')
    .order('tarih', { ascending: false }).order('olusturuldu', { ascending: false });
  if (error) {
    $('haberListesi').replaceChildren(el('div', { class: 'p-bosliste', text: 'Haberler yüklenemedi: ' + hataMetni(error) }));
    return;
  }
  haberler = data;
  haberListesiCiz();
}

function haberListesiCiz() {
  const kutu = $('haberListesi');
  if (!haberler.length) {
    kutu.replaceChildren(el('div', { class: 'p-bosliste', text: 'Henüz haber yok. "Yeni Haber" düğmesiyle ilkini ekle.' }));
    return;
  }
  kutu.replaceChildren(...haberler.map(h => el('div', { class: 'p-satir' },
    h.kapak ? el('img', { src: fotoAdresi(h.kapak), alt: '', loading: 'lazy' }) : el('div', { class: 'p-yok' }),
    el('div', { class: 'p-satir-ic' },
      el('strong', { text: h.baslik, title: h.baslik }),
      el('small', {}, h.tarih_metin + ' · ' + h.etiket,
        el('span', { class: 'rozet ' + (h.yayinda ? 'acik' : 'taslak'), text: h.yayinda ? 'Yayında' : 'Taslak' }))),
    el('div', { class: 'p-eylem' },
      h.yayinda ? el('a', { class: 'p-kucuk', href: '../duyurular/haber/?s=' + encodeURIComponent(h.slug),
                            target: '_blank', rel: 'noopener', text: 'Sitede gör' }) : null,
      dugme(h.yayinda ? 'Yayından kaldır' : 'Yayınla', () => haberYayinDegistir(h)),
      dugme('Düzenle', () => haberFormAc(h)),
      dugme('Sil', () => haberSil(h), true))
  )));
}

function dugme(yazi, is, tehlike) {
  const b = el('button', { class: 'p-kucuk' + (tehlike ? ' tehlike' : ''), type: 'button', text: yazi });
  b.addEventListener('click', is);
  return b;
}

async function haberYayinDegistir(h) {
  const { data, error } = await sb.from('haberler').update({ yayinda: !h.yayinda }).eq('id', h.id).select('id');
  if (error || !data.length) { bildir(error ? hataMetni(error) : 'Değişiklik kaydedilemedi.', true); return; }
  bildir(h.yayinda ? 'Haber yayından kaldırıldı.' : 'Haber yayında.');
  haberleriYukle();
}

async function haberSil(h) {
  if (!confirm('"' + h.baslik + '" silinsin mi?\n\nFotoğraflarıyla birlikte kalıcı olarak silinir, geri alınamaz.')) return;
  const { data, error } = await sb.from('haberler').delete().eq('id', h.id).select('id');
  if (error || !data.length) { bildir(error ? hataMetni(error) : 'Haber silinemedi.', true); return; }
  await fotoSil([h.kapak, ...(h.galeri || []).map(g => g.yol)]);
  bildir('Haber silindi.');
  haberleriYukle();
}

// ---------- haber formu ----------------------------------------------

function haberFormAc(h) {
  if (formKirli && !confirm('Açık formda kaydedilmemiş değişiklikler var. Vazgeçilsin mi?')) return;
  const f = h || {};
  hDuzenlenen = f.id || null;
  $('hfBaslik').textContent = h ? 'Haberi düzenle' : 'Yeni haber';
  $('hBaslik').value = f.baslik || '';
  $('hEtiket').value = f.etiket || 'Topluluk Haberi';
  $('hSlug').value = f.slug || '';
  $('hTarih').value = f.tarih || '';
  $('hTarihMetin').value = f.tarih_metin || '';
  $('hYer').value = f.yer || '';
  $('hOzet').value = f.ozet || '';
  $('hGovde').value = f.govde || '';
  $('hKapakAlt').value = f.kapak_alt || '';
  $('hKapakYazi').value = f.kapak_yazi || '';
  $('hYayinda').checked = !!f.yayinda;
  hKapak = f.kapak ? { yol: f.kapak, url: fotoAdresi(f.kapak) } : null;
  hGaleri = (f.galeri || []).filter(g => g && g.yol).map(g => ({ yol: g.yol, url: fotoAdresi(g.yol), alt: g.alt || '' }));
  hEskiYollar = [f.kapak, ...hGaleri.map(g => g.yol)].filter(Boolean);
  hSlugElle = !!h;            // yayındaki haberin adresi kendiliğinden değişmesin
  hTarihElle = !!h;
  $('hKapakDosya').value = ''; $('hGaleriDosya').value = '';
  $('hHata').textContent = ''; $('hDurum').textContent = '';
  slugIpucu(); ozetSay(); kapakCiz(); galeriCiz();

  $('haberListeBolum').hidden = true;
  $('haberForm').hidden = false;
  formKirli = false;
  $('haberForm').scrollIntoView({ block: 'start' });
  $('hBaslik').focus();
}

function haberFormKapat() {
  $('haberForm').hidden = true;
  $('haberListeBolum').hidden = false;
  for (const g of hGaleri) if (g.blob) URL.revokeObjectURL(g.url);
  if (hKapak && hKapak.blob) URL.revokeObjectURL(hKapak.url);
  hKapak = null; hGaleri = []; hDuzenlenen = null;
  formKirli = false;
}

function slugIpucu() {
  const s = $('hSlug').value;
  const uyari = hDuzenlenen ? ' Yayındaki bir haberin adresini değiştirirsen paylaşılmış eski bağlantılar çalışmaz.' : '';
  $('hSlugIpucu').textContent = (s ? 'Haberin adresi: ahdem.online/duyurular/haber/?s=' + s + '.'
                                   : 'Yalnızca küçük harf, rakam ve tire.') + uyari;
}
function ozetSay() { $('hOzetSay').textContent = $('hOzet').value.length; }

$('haberForm').addEventListener('input', () => { formKirli = true; });
$('hBaslik').addEventListener('input', () => {
  if (!hSlugElle) { $('hSlug').value = slugla($('hBaslik').value); slugIpucu(); }
});
$('hSlug').addEventListener('input', () => { hSlugElle = true; slugIpucu(); });
$('hTarih').addEventListener('input', () => {
  if (!hTarihElle) $('hTarihMetin').value = tarihMetni($('hTarih').value);
});
$('hTarihMetin').addEventListener('input', () => { hTarihElle = true; });
$('hOzet').addEventListener('input', ozetSay);

$('yeniHaber').addEventListener('click', () => haberFormAc(null));
$('hVazgec').addEventListener('click', () => {
  if (formKirli && !confirm('Kaydedilmemiş değişiklikler silinsin mi?')) return;
  haberFormKapat();
});

// ---------- fotoğraflar ----------

function kapakCiz() {
  const k = $('hKapakKutu');
  if (hKapak) k.replaceChildren(el('img', { src: hKapak.url, alt: '' }));
  else k.replaceChildren('Kapak seçilmedi');
  $('hKapakKaldir').hidden = !hKapak;
}

$('hKapakDosya').addEventListener('change', async e => {
  const d = e.target.files[0];
  if (!d) return;
  try {
    const r = await kucult(d);
    if (hKapak && hKapak.blob) URL.revokeObjectURL(hKapak.url);
    hKapak = r;
    formKirli = true;
    kapakCiz();
  } catch (err) { bildir(err.message, true); }
  e.target.value = '';
});

$('hKapakKaldir').addEventListener('click', () => {
  if (hKapak && hKapak.blob) URL.revokeObjectURL(hKapak.url);
  hKapak = null; formKirli = true; kapakCiz();
});

function galeriCiz() {
  $('hGaleri').replaceChildren(...hGaleri.map((g, i) => {
    const alt = el('input', { type: 'text', maxlength: '200', placeholder: 'Açıklama (isteğe bağlı)' });
    alt.value = g.alt;
    alt.addEventListener('input', () => { g.alt = alt.value; });
    const sirala = (yon) => {
      const j = i + yon;
      if (j < 0 || j >= hGaleri.length) return;
      [hGaleri[i], hGaleri[j]] = [hGaleri[j], hGaleri[i]];
      formKirli = true; galeriCiz();
    };
    return el('figure', {},
      el('img', { src: g.url, alt: '' }),
      el('figcaption', {}, alt,
        el('div', { class: 'p-eylem', style: 'justify-content:flex-start;' },
          i > 0 ? dugme('‹', () => sirala(-1)) : null,
          i < hGaleri.length - 1 ? dugme('›', () => sirala(1)) : null,
          dugme('Kaldır', () => {
            if (g.blob) URL.revokeObjectURL(g.url);
            hGaleri.splice(i, 1); formKirli = true; galeriCiz();
          }, true))));
  }));
}

$('hGaleriDosya').addEventListener('change', async e => {
  const dosyalar = Array.from(e.target.files);
  e.target.value = '';
  if (!dosyalar.length) return;
  $('hDurum').textContent = 'Fotoğraflar hazırlanıyor…';
  for (const d of dosyalar) {
    try { const r = await kucult(d); hGaleri.push({ ...r, alt: '' }); }
    catch (err) { bildir(d.name + ': ' + err.message, true); }
  }
  $('hDurum').textContent = '';
  formKirli = true;
  galeriCiz();
});

// ---------- kaydet ----------

$('haberForm').addEventListener('submit', async e => {
  e.preventDefault();
  $('hHata').textContent = '';

  const v = {
    baslik: $('hBaslik').value.trim(),
    etiket: $('hEtiket').value,
    slug: $('hSlug').value.trim(),
    tarih: $('hTarih').value,
    tarih_metin: $('hTarihMetin').value.trim(),
    yer: $('hYer').value.trim(),
    ozet: $('hOzet').value.trim().replace(/\s+/g, ' '),
    govde: $('hGovde').value.trim(),
    kapak_alt: $('hKapakAlt').value.trim(),
    kapak_yazi: $('hKapakYazi').value.trim(),
    yayinda: $('hYayinda').checked
  };
  const eksik = [];
  if (v.baslik.length < 3) eksik.push('başlık');
  if (!SLUG_KALIP.test(v.slug)) eksik.push('adres (küçük harf, rakam ve tire)');
  if (!v.tarih) eksik.push('tarih');
  if (!v.tarih_metin) eksik.push('sayfada görünecek tarih');
  if (!v.ozet) eksik.push('özet');
  if (!v.govde) eksik.push('haber metni');
  if (eksik.length) { $('hHata').textContent = 'Eksik ya da hatalı: ' + eksik.join(', ') + '.'; return; }
  if (v.yayinda && !hKapak && !confirm('Kapak fotoğrafı yok. Haber fotoğrafsız yayınlansın mı?')) return;

  const dugmeK = $('hKaydet');
  dugmeK.disabled = true;
  const yeniYuklenen = [];
  try {
    // 1) Yeni fotoğrafları yükle. Kayıt başarısız olursa hepsi geri silinir.
    const bekleyen = (hKapak && hKapak.blob ? 1 : 0) + hGaleri.filter(g => g.blob).length;
    let sayac = 0;
    const yukle = async blob => {
      $('hDurum').textContent = 'Fotoğraf yükleniyor (' + (++sayac) + '/' + bekleyen + ')…';
      const yol = await fotoYukle(v.slug, blob);
      yeniYuklenen.push(yol);
      return yol;
    };
    const kapakYol = hKapak ? (hKapak.blob ? await yukle(hKapak.blob) : hKapak.yol) : null;
    const galeri = [];
    for (const g of hGaleri) galeri.push({ yol: g.blob ? await yukle(g.blob) : g.yol, alt: g.alt.trim() });

    // 2) Kaydı yaz.
    $('hDurum').textContent = 'Kaydediliyor…';
    const satir = { ...v, kapak: kapakYol, galeri };
    const sorgu = hDuzenlenen
      ? sb.from('haberler').update(satir).eq('id', hDuzenlenen).select('id')
      : sb.from('haberler').insert(satir).select('id');
    const { data, error } = await sorgu;
    if (error) throw error;
    if (!data || !data.length) throw new Error('Kayıt yazılamadı. Yetkini kontrol et.');

    // 3) Artık kullanılmayan eski fotoğrafları depodan temizle.
    const kullanilan = new Set([kapakYol, ...galeri.map(g => g.yol)]);
    await fotoSil(hEskiYollar.filter(y => !kullanilan.has(y)));

    bildir(v.yayinda ? 'Kaydedildi, haber sitede.' : 'Taslak olarak kaydedildi.');
    haberFormKapat();
    haberleriYukle();
  } catch (err) {
    await fotoSil(yeniYuklenen);
    $('hHata').textContent = 'Kaydedilemedi: ' + hataMetni(err);
  } finally {
    dugmeK.disabled = false;
    $('hDurum').textContent = '';
  }
});

// =====================================================================
//  YAKLAŞAN ETKİNLİKLER
// =====================================================================

let etkinlikler = [];
let eDuzenlenen = null;
let eTarihElle = false;

async function etkinlikleriYukle() {
  const { data, error } = await sb.from('etkinlikler').select('*')
    .order('tarih', { ascending: true, nullsFirst: false }).order('sira', { ascending: true });
  if (error) {
    $('etkinlikListesi').replaceChildren(el('div', { class: 'p-bosliste', text: 'Etkinlikler yüklenemedi: ' + hataMetni(error) }));
    return;
  }
  etkinlikler = data;
  const kutu = $('etkinlikListesi');
  if (!etkinlikler.length) {
    kutu.replaceChildren(el('div', { class: 'p-bosliste',
      text: 'Henüz etkinlik yok. Duyurular sayfası şu an HTML\'deki yedek AHDEM 2027 kaydını gösteriyor olabilir; ilk etkinliği ekleyince onun yerini alır.' }));
    return;
  }
  const bugun = new Date().toISOString().slice(0, 10);
  kutu.replaceChildren(...etkinlikler.map(k => {
    const gecti = k.tarih && k.tarih < bugun;
    return el('div', { class: 'p-satir fotosuz' },
      el('div', { class: 'p-satir-ic' },
        el('strong', { text: k.baslik, title: k.baslik }),
        el('small', {}, k.tarih_metin + (k.yer ? ' · ' + k.yer : ''),
          el('span', { class: 'rozet ' + (k.yayinda && !gecti ? 'acik' : 'taslak'),
                       text: gecti ? 'Tarihi geçti' : (k.yayinda ? 'Yayında' : 'Taslak') }))),
      el('div', { class: 'p-eylem' },
        dugme(k.yayinda ? 'Yayından kaldır' : 'Yayınla', () => etkinlikYayinDegistir(k)),
        dugme('Düzenle', () => etkinlikFormAc(k)),
        dugme('Sil', () => etkinlikSil(k), true)));
  }));
}

async function etkinlikYayinDegistir(k) {
  const { data, error } = await sb.from('etkinlikler').update({ yayinda: !k.yayinda }).eq('id', k.id).select('id');
  if (error || !data.length) { bildir(error ? hataMetni(error) : 'Değişiklik kaydedilemedi.', true); return; }
  bildir(k.yayinda ? 'Etkinlik yayından kaldırıldı.' : 'Etkinlik yayında.');
  etkinlikleriYukle();
}

async function etkinlikSil(k) {
  if (!confirm('"' + k.baslik + '" silinsin mi? Bu işlem geri alınamaz.')) return;
  const { data, error } = await sb.from('etkinlikler').delete().eq('id', k.id).select('id');
  if (error || !data.length) { bildir(error ? hataMetni(error) : 'Etkinlik silinemedi.', true); return; }
  bildir('Etkinlik silindi.');
  etkinlikleriYukle();
}

function etkinlikFormAc(k) {
  if (formKirli && !confirm('Açık formda kaydedilmemiş değişiklikler var. Vazgeçilsin mi?')) return;
  const f = k || {};
  eDuzenlenen = f.id || null;
  $('efBaslik').textContent = k ? 'Etkinliği düzenle' : 'Yeni etkinlik';
  $('eBaslik').value = f.baslik || '';
  $('eTarih').value = f.tarih || '';
  $('eTarihMetin').value = f.tarih_metin || 'Tarih yakında';
  $('eAciklama').value = f.aciklama || '';
  $('eYer').value = f.yer || '';
  $('eSira').value = f.sira != null ? f.sira : 0;
  $('eYayinda').checked = !!f.yayinda;
  eTarihElle = !!k;
  $('eHata').textContent = '';
  $('etkinlikListeBolum').hidden = true;
  $('etkinlikForm').hidden = false;
  formKirli = false;
  $('etkinlikForm').scrollIntoView({ block: 'start' });
  $('eBaslik').focus();
}

function etkinlikFormKapat() {
  $('etkinlikForm').hidden = true;
  $('etkinlikListeBolum').hidden = false;
  eDuzenlenen = null;
  formKirli = false;
}

$('etkinlikForm').addEventListener('input', () => { formKirli = true; });
$('eTarih').addEventListener('input', () => {
  if (!eTarihElle) $('eTarihMetin').value = $('eTarih').value ? tarihMetni($('eTarih').value) : 'Tarih yakında';
});
$('eTarihMetin').addEventListener('input', () => { eTarihElle = true; });
$('yeniEtkinlik').addEventListener('click', () => etkinlikFormAc(null));
$('eVazgec').addEventListener('click', () => {
  if (formKirli && !confirm('Kaydedilmemiş değişiklikler silinsin mi?')) return;
  etkinlikFormKapat();
});

$('etkinlikForm').addEventListener('submit', async e => {
  e.preventDefault();
  $('eHata').textContent = '';
  const v = {
    baslik: $('eBaslik').value.trim(),
    tarih: $('eTarih').value || null,
    tarih_metin: $('eTarihMetin').value.trim(),
    aciklama: $('eAciklama').value.trim(),
    yer: $('eYer').value.trim(),
    sira: parseInt($('eSira').value, 10) || 0,
    yayinda: $('eYayinda').checked
  };
  const eksik = [];
  if (!v.baslik) eksik.push('etkinliğin adı');
  if (!v.tarih_metin) eksik.push('sayfada görünecek tarih');
  if (eksik.length) { $('eHata').textContent = 'Eksik: ' + eksik.join(', ') + '.'; return; }

  const dugmeK = $('eKaydet');
  dugmeK.disabled = true;
  $('eDurum').textContent = 'Kaydediliyor…';
  try {
    const sorgu = eDuzenlenen
      ? sb.from('etkinlikler').update(v).eq('id', eDuzenlenen).select('id')
      : sb.from('etkinlikler').insert(v).select('id');
    const { data, error } = await sorgu;
    if (error) throw error;
    if (!data || !data.length) throw new Error('Kayıt yazılamadı. Yetkini kontrol et.');
    bildir(v.yayinda ? 'Kaydedildi, etkinlik sitede.' : 'Taslak olarak kaydedildi.');
    etkinlikFormKapat();
    etkinlikleriYukle();
  } catch (err) {
    $('eHata').textContent = 'Kaydedilemedi: ' + hataMetni(err);
  } finally {
    dugmeK.disabled = false;
    $('eDurum').textContent = '';
  }
});

// ---------- başlat ----------------------------------------------------

oturumKontrol().catch(err => {
  goster('gGiris');
  $('girisHata').textContent = 'Sunucuya ulaşılamadı: ' + hataMetni(err);
});
