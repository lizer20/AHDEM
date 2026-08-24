# AHDEM — Proje Devir Notu

Bu dosya, projeyi yeni bir sohbete veya yeni bir kişiye devretmek için hazırlanmıştır.
Son güncelleme: **23 Ağustos 2026**

---

## 1. Proje nedir, ne durumda

**Ankara Hukuk Demokrasi Müzakereleri (AHDEM) Topluluğu**nun resmî internet sitesi.
Site yayında ve çalışıyor.

| | |
|---|---|
| **Site adresi** | https://ahdem.online |
| **Yedek adres** | https://lizer20.github.io/AHDEM/ |
| **Depo (kaynak kod)** | https://github.com/lizer20/AHDEM |
| **Yayın yöntemi** | GitHub Pages (`main` dalı, kök dizin) |
| **Alan adı sağlayıcısı** | Name.com |
| **Analiz** | Google Search Console — alan adı mülkü, topluluk hesabında |
| **Sosyal medya** | @demokrasimuzakereleri (Instagram) |
| **E-posta** | auhfdemokrasimuzakereleri@gmail.com |

**Topluluk:** Ankara Üniversitesi Hukuk Fakültesi bünyesinde 2022'de kuruldu.
2023'ten bu yana dört konferans düzenledi. Beşincisi **AHDEM 2027**,
25–28 Mart 2027, Ankara Üniversitesi Cebeci Yerleşkesi, tema: *1950–1960, Bir Dönemi Anlamak.*

**İletişim:** Rüveyda Cam (Başkan) 0545 252 75 37 · Pelin Yüksel (Başkan Vekili) 0537 828 84 48

---

## 2. Dosya yapısı

```
/
├── index.html              Ana sayfa (topluluk + konferans anlatımı)
├── stil.css                TÜM SAYFALARIN ORTAK STİLİ — en kritik dosya
├── 404.html                Hatalı adres sayfası (kökte durmalı)
│
├── konferanslar/index.html 2023–2027 konferans arşivi
├── duyurular/index.html    Duyurular + etkinlik takvimi
├── sss/index.html          Sık sorulan sorular
├── iletisim/index.html     İletişim
├── gizlilik/index.html     KVKK aydınlatma metni
├── sponsorluk/index.html   Sponsorluk dosyası (kurumlara gönderilen sayfa)
│
├── sss.html                ┐
├── iletisim.html           ├ Eski adreslerden yeni klasörlere yönlendirme.
├── sponsorluk.html         ┘ Silme, eski linkler bunlara güveniyor.
│
├── foto/1..12.jpg          Sitede kullanılan, web için küçültülmüş fotoğraflar
├── fotoğraflar/*.jpeg      Orijinal fotoğraflar (sitede kullanılmıyor, arşiv)
│
├── logo-topluluk.png       Yuvarlak altın mühür — şeffaf zeminli
├── logo-konferans-beyaz.png    Beyaz çizim, şeffaf — KOYU zeminlerde
├── logo-konferans-lacivert.png Lacivert çizim, şeffaf — AÇIK zeminlerde
├── logo-konferans.png      Eski lacivert kutulu sürüm — kullanılmıyor
│
├── favicon.ico, favicon-16/32/48/192.png, apple-touch-icon.png
├── paylasim.png            1200x630 sosyal medya paylaşım kartı
├── sitemap.xml, robots.txt
├── CNAME                   İçinde "ahdem.online" yazar. SİLME.
│
├── ahdem-tanitim.mp4       Tanıtım videosu (99 MB)
├── kapak.jpg               Videonun kapak karesi
│
├── sunum-kaynak.html       PDF sunumun kaynağı — DONDURULDU, bkz. bölüm 8
└── Ankara_..._Sponsorluk_Dosyasi.pdf   19 sayfalık sunum
```

> **UYARI — yedekte olması gereken dosya:** `ahdem-tanitim.mov` (407 MB), videonun
> orijinal kalitedeki kaynağı. Boyutu nedeniyle depoda yok. Yalnızca harici yedekte
> bulunur; kaybolursa geriye sadece sıkıştırılmış mp4 kalır.

---

## 3. Çalışma kuralları

1. **`stil.css` ortaktır.** Yedi sayfa da onu kullanır. Bir rengi veya boşluğu
   değiştirdiğinde tüm site değişir — istenen budur, kopyalama yapma.
2. **Menü ve footer yedi sayfada aynıdır.** Menüye bir bağlantı eklersen
   yedi dosyada da elle eklemen gerekir. Atlanan sayfa tutarsızlık yaratır.
3. **Alt klasördeki sayfalar `../` kullanır.** `sss/index.html` içinde CSS
   `../stil.css`, logo `../logo-topluluk.png` şeklindedir. Kök dizindeki
   `index.html` ve `404.html` böyle değildir (404 mutlak yol kullanır: `/stil.css`).
4. **Ana sayfaya bağlantı `./` veya `../` ile verilir**, `index.html` yazılmaz.
   Amaç adres çubuğunda `ahdem.online/index.html` görünmemesi.
5. **Yayına almak:** dosyaları depoya yükle. GitHub Pages 1–2 dakika içinde
   yayınlar. CSS değiştiyse tarayıcıda sert yenileme gerekir (Ctrl+F5).

---

## 4. Sık yapılan işler

### Yeni duyuru veya etkinlik eklemek
`duyurular/index.html` dosyasını aç. İçinde hazır kalıplar yorum satırı olarak
duruyor (`<!-- YENİ ETKİNLİK EKLEMEK İÇİN ... -->`). Kalıbı kopyala, yorum
işaretlerinden çıkar, doldur. Duyurular bölümündeki `<div class="bos">` bloğunu
ilk gerçek duyuruyu eklerken sil.

### Yeni ekip üyesi eklemek
`index.html` içinde `id="ekip"` bölümünü bul. Orada da hazır kalıp var:

```html
<div class="member">
  <div class="ph-av">AS</div>
  <b>Ad Soyad</b>
  <div class="role">Görevi</div>
</div>
```

`ph-av` baş harflerdir. Kart sayısının 3'ün katı olması masaüstünde daha düzgün durur.

### Yeni fotoğraf eklemek
Fotoğrafı en fazla 1400 piksele küçült, JPEG kalite ~82 ile kaydet, `foto/13.jpg`
gibi sıradaki numarayla klasöre koy. Sonra `index.html` içindeki `<div class="gal">`
listesine ekle. **Dikkat:** galeri düzeni 12 fotoğrafa göre kurulu —
2 geniş (`class="w"`) + 6 orta + 4 küçük (`class="q"`). Sayı değişirse bu dağılımı
yeniden hesaplamak gerekir, yoksa telefonda veya masaüstünde boş hücre kalır.

### Yeni sayfa eklemek
Mevcut bir klasörü (`sss/` gibi) kopyala, adını değiştir, içeriğini değiştir.
Sonra yedi sayfanın menüsüne ve footer'ına yeni bağlantıyı ekle.

### Videoyu değiştirmek
Video depoda **değil**, GitHub Releases'te barındırılıyor (dosya boyutu sınırını
aşmamak için). Yeni videoyu Releases'e yükle, `index.html` içindeki
`<source src="https://github.com/lizer20/AHDEM/releases/download/v1/ahdem-tanitim.mp4">`
satırını yeni bağlantıyla değiştir.

---

## 5. Tasarım sistemi

```css
--ink:#12203A       /* lacivert — koyu zeminler, başlıklar */
--ink-soft:#2E4260  /* gövde metni */
--paper:#FAF7F1     /* krem zemin */
--paper-2:#F1ECE3   /* ikinci krem — menü, alternatif bantlar */
--gold:#B8862F      /* altın vurgu, butonlar */
--gold-soft:#E8D5AC /* koyu zeminde altın */
--line:#D9D1C4      /* çerçeveler */
--muted:#6B7A90     /* ikincil metin */
--maxw:1160px       /* içerik genişliği */
```

Yazı tipleri: **Poppins** (gövde) + **Lora** (serif vurgular). Google Fonts'tan yükleniyor.

Tekrar eden bileşenler: `.band` (bölüm), `.band.alt` (krem zemin), `.band.dark`
(lacivert zemin), `.eyebrow` (küçük altın üst etiket), `.goldbar` (altın çizgi),
`.card`, `.note`, `.btn`, `.btn.ghost`, `.member`, `.kayit`, `.yil`, `.faq`.

Kırılma noktaları: 980px, 900px, 820px, **720px** (menü hamburgere döner), 640px, 560px.

---

## 6. Alan adı ve DNS

Name.com → MY DOMAINS → ahdem.online → Manage DNS Records

| Tür | Host | Değer |
|---|---|---|
| A | (boş) | 185.199.108.153 |
| A | (boş) | 185.199.109.153 |
| A | (boş) | 185.199.110.153 |
| A | (boş) | 185.199.111.153 |
| AAAA | (boş) | 2606:50c0:8000::153 |
| AAAA | (boş) | 2606:50c0:8001::153 |
| AAAA | (boş) | 2606:50c0:8002::153 |
| AAAA | (boş) | 2606:50c0:8003::153 |
| CNAME | www | lizer20.github.io |
| TXT | (boş) | google-site-verification=kW4VFvzFRQMP_gtjVc49-CliWNTqSGrqiA1ermIZcvo |

A ve AAAA kayıtları GitHub Pages'in sunucularıdır, değişmez. TXT kaydı Google
Search Console doğrulaması içindir, **silinirse mülk doğrulaması düşer**.

GitHub tarafında: Settings → Pages → Custom domain: `ahdem.online`, Enforce HTTPS açık.
Depodaki `CNAME` dosyası bu ayarın karşılığıdır, silinirse alan adı bağlantısı kopar.

---

## 7. Açık işler

**Ekip onayı bekleyen (içerik uydurulmadı, doğrulanması gerekiyor):**
- `sss/index.html` — yedi sorunun cevapları mevcut malzemeden türetildi, okunmalı.
  Katılım ücreti ve başvuru takvimi bilinmediği için bilerek boş bırakıldı.
- `gizlilik/index.html` — KVKK metni taslaktır, sayfanın başında bu uyarı duruyor.

**Bilgi geldiğinde yapılacak:**
- Duyurular sayfası boş; ilk gerçek duyuru geldiğinde doldurulacak.
- `index.html` içindeki JSON-LD yapılandırılmış verisinde `offers` (katılım ücreti,
  kayıt bağlantısı) ve `performer` (konuk konuşmacı) alanları eksik. Başvurular
  açıldığında eklenirse Google arama sonucunda etkinlik kartı zenginleşir.
- Ekip bölümüne akademik danışman bilgisi eklenebilir.

**Ertelenen kararlar:**
- **Kurumsal e-posta.** Gmail yerine info@ahdem.online. Üç yol vardı:
  Cloudflare Email Routing + Gmail (ücretsiz, ana sunucuları Cloudflare'a taşımak
  gerekir), Zoho Mail Free (bölgeye göre görünmeyebiliyor), ya da yıllık ~15 dolarlık
  ücretli kutu. Şimdilik Gmail'de kalındı.
- Kişisel hesaptaki eski Search Console mülkü henüz kaldırılmadı. Kaldırılırsa
  `index.html` içindeki `google-site-verification` meta etiketi de silinebilir
  (alan adı doğrulaması DNS üzerinden yürüdüğü için ona gerek kalmıyor).
- Sponsorluk sayfasında bütçe rakamı/bandı yok. Firmaların teklifi değerlendirmesi
  için en azından bir aralık vermek dönüş oranını artırır.

**Google durumu:** Site 23 Ağustos 2026'da Search Console'a eklendi, sitemap
başarıyla okundu (7 sayfa keşfedildi). Dizine ekleme birkaç gün–birkaç hafta sürer.
Süreci hızlandıran şey bağlantıdır: Instagram biyografisi, fakülte/üniversite
sayfalarından verilecek linkler.

---

## 8. Sunum / PDF (dondurulmuş)

`sunum-kaynak.html` → 19 sayfalık sponsorluk PDF'inin kaynağıdır. **Site ve sunum
tamamen ayrıldı, sunum çalışması durduruldu.** Sponsorluk içeriği artık
`sponsorluk/index.html` sayfasında yaşıyor.

PDF yeniden basılması gerekirse Chromium ile 13.333×7.5 inç sayfa boyutunda basılır:

```js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file:///TAM/YOL/sunum-kaynak.html', {waitUntil:'load'});
  await p.waitForTimeout(2500);
  await p.pdf({ path: 'cikti.pdf', width: '13.333in', height: '7.5in',
                printBackground: true, margin: {top:0,bottom:0,left:0,right:0} });
  await b.close();
})();
```

**Bilinen eksik:** PDF'in 19. sayfasında Pelin Yüksel'in unvanı hâlâ
"Başkan Yardımcısı" yazıyor; doğrusu **"Başkan Vekili"**. Sitede düzeltildi,
PDF'te düzeltilmedi. Sponsorlara göndermeden önce düzeltilmeli.

Slayt eklenip silinirse sayfa numaraları (`<div class="num">NN</div>`) yeniden
üretilmelidir; kapak hariç 02'den başlar.

---

## 10. GEÇİCİ GİZLEME — duyuru sonrası geri açılacak

23 Ağustos 2026'da, konferans henüz duyurulmadığı için **2027 tarihleri (25–28 Mart 2027)
ve teması (1950–1960: Bir Dönemi Anlamak)** siteden geçici olarak kaldırıldı.

Metinler **silinmedi**, HTML yorumu içine alındı. Geri açmak için ilgili dosyada şu işareti ara:

```
<!-- ##### DUYURU ONCESI GIZLENDI - geri acmak icin bu yorum isaretlerini sil #####
     ... orijinal metin ...
     ##### GIZLEME BITIS ##### -->
```

Yorum işaretlerini sil, üstündeki geçici metni kaldır.

**Nerelerde gizleme var:**

| Dosya | Kaç yerde | Ne gizlendi |
|---|---|---|
| `index.html` | 3 | Hero şeridi, "2027 Teması" bölümünün tamamı, zaman çizelgesi 2027 satırı |
| `konferanslar/index.html` | 3 | 2027 kartının dönem etiketi, tarih cümlesi, özet |
| `duyurular/index.html` | 2 | Etkinlik tarihi rozeti, etkinlik açıklaması |
| `sss/index.html` | 1 | "Konferans nerede ve ne zaman?" cevabı |

**Yorum içinde olmayan, elle geri alınacaklar:**

- `index.html` içindeki JSON-LD verisinden `"startDate": "2027-03-25"` ve
  `"endDate": "2027-03-28"` satırları çıkarıldı, `description` alanı değiştirildi.
  Duyuru sonrası geri eklenmeli — Google etkinlik kartı için gerekli.
- Alt menüdeki "2027 Teması" etiketi yedi sayfada "AHDEM 2027" olarak değiştirildi.
- `paylasim.png` tarihsiz sürümle değiştirildi. Tarihli orijinali
  `paylasim-tarihli.png` adıyla depoda duruyor; duyuru sonrası bu dosyayı
  `paylasim.png` olarak yeniden adlandırmak yeterli.

**Gizleme YAPILMAYAN yer:** `sponsorluk/index.html`. Kurumlara gönderilen sayfa olduğu
için tarih ve tema orada bilerek bırakıldı.

---

## 11. Yeni bir sohbete başlarken

Bu dosyayı paylaşıp şunu demek yeterli:

> AHDEM sitesi üzerinde çalışıyoruz. Kaynak https://github.com/lizer20/AHDEM
> deposunda, yayın adresi https://ahdem.online. Devir notundaki açık işlerden
> şununla başlayalım: …

**Dikkat edilecekler:**
- `stil.css` ortak; bir sayfa için yapılan değişiklik hepsini etkiler.
- Menü ve footer yedi sayfada aynı — birini değiştirirken hepsini değiştir.
- Alt klasördeki sayfalar `../` ile kök dizine bağlanır.
- Kuruma gidecek bir belge söz konusuysa unvan, kurum adı ve tarihlerde tahmin
  yürütme; teyit et.
