# AHDEM 2027 Sponsorluk Dosyası — Proje Devir Notu

Bu dosya, projeyi yeni bir sohbete taşımak için hazırlanmıştır. Yeni sohbette bu metni
paylaşman yeterli: neyin istendiği, ne yapıldığı, nasıl yapıldığı ve sırada ne olduğu burada.

---

## 1. Proje nedir

**Ankara Hukuk Demokrasi Müzakereleri (AHDEM) Konferansı 2027** için hazırlanan sponsorluk
ve iş birliği dosyası. Amaç, firmalara "Ana Sponsor" olmayı teklif etmek.

| | |
|---|---|
| **Etkinlik** | AHDEM Konferansı 2027 |
| **Tarih** | 25–28 Mart 2027 |
| **Yer** | Ankara Üniversitesi Cebeci Yerleşkesi |
| **Ölçek** | 4 gün · 120+ üniversite öğrencisi · 40 kişilik ekip |
| **Tema** | 1950–1960: Bir Dönemi Anlamak |
| **Kaçıncı** | 5. konferans (2023'ten bu yana 4 konferans yapıldı) |

**İletişim:** Rüveyda Cam — Demokrasi Müzakereleri Topluluğu Başkanı — 0545 252 75 37 ·
Pelin Yüksel — Başkan Yardımcısı — 0537 828 84 48 ·
auhfdemokrasimuzakereleri@gmail.com · @demokrasimuzakereleri

---

## 2. Klasördeki dosyalar

Konum: `C:\Users\emreb\Desktop\AHDEM`

| Dosya | Ne işe yarar |
|---|---|
| `sunum-kaynak.html` | **Sunumun kaynağı.** 1280×720 sabit slaytlar. PDF bundan üretilir. |
| `Ankara_Hukuk_Demokrasi_Muzakereleri_Konferansi_2027_Sponsorluk_Dosyasi.pdf` | 19 sayfalık sunum. Kuruma gönderilen dosya. |
| `index.html` | **Web sayfası.** Tek dosya, mobil uyumlu, kaydırmalı. Sponsor adaylarına link olarak gönderilir. |
| `logo-hazirla.py` | Logo arka planı temizleme betiği (henüz çalıştırılmadı, aşağıya bak). |
| `PROJE-DEVIR-NOTU.md` | Bu dosya. |

**Önemli:** `sunum-kaynak.html` ve `index.html` **iki ayrı hattır**, ortak dosya paylaşmazlar.
Bir değişiklik ikisine de isteniyorsa iki dosyada ayrı ayrı yapılmalı.

---

## 3. PDF nasıl üretiliyor

`sunum-kaynak.html` Chromium ile 13.333×7.5 inç sayfa boyutunda PDF'e basılır:

```js
// render.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.goto('file:///TAM/YOL/sunum-kaynak.html', {waitUntil:'networkidle'});
  await p.waitForTimeout(2500);
  await p.pdf({
    path: 'Ankara_Hukuk_Demokrasi_Muzakereleri_Konferansi_2027_Sponsorluk_Dosyasi.pdf',
    width: '13.333in', height: '7.5in',
    printBackground: true,
    margin: {top:0, bottom:0, left:0, right:0}
  });
  await b.close();
})();
```

CSS'te `@page { size: 13.333in 7.5in; margin: 0; }` ve her slayt
`.slide { width:1280px; height:720px; page-break-after:always; }`.

**Kural:** HTML'de bir slaytı değiştirdikten sonra PDF'i yeniden basmak gerekir; PDF elle
düzenlenmez.

**Sayfa numaraları** her slaytta `<div class="num">NN</div>` olarak gömülü. Slayt eklenip
silindiğinde hepsini yeniden numaralamak gerekir (kapak hariç, 02'den başlar):

```python
import re
c=[1]
def nr(m):
    c[0]+=1; return '<div class="num">%02d</div>'%c[0]
s=re.sub(r'<div class="num">\d+</div>', nr, s)
```

---

## 4. Tasarım sistemi (iki dosyada ortak)

```css
--ink:#12203A       /* lacivert — koyu zeminler, başlıklar */
--ink-soft:#2E4260  /* gövde metni */
--paper:#FAF7F1     /* krem zemin */
--paper-2:#F1ECE3   /* ikinci krem (alternatif bantlar, notlar) */
--gold:#B8862F      /* altın vurgu */
--gold-soft:#E8D5AC /* koyu zeminde altın */
--line:#D9D1C4      /* çerçeveler */
--muted:#6B7A90     /* ikincil metin */
```

Yazı tipleri: **Poppins** (gövde/başlık) + **Lora** (serif vurgular, kurum adları).
Sitede Google Fonts ile yükleniyor; sunumda sistem fontu olarak varsayılıyor.

Tekrar eden bileşenler: `.eyebrow` (küçük altın üst etiket), `.goldbar` (56px altın çizgi),
`.card`, `.note` (soldan altın çizgili gri kutu), `.step` (numaralı akış kartı),
`.tier` (sponsorluk paketi kartı).

---

## 5. Sunumun içeriği (19 sayfa)

| # | Sayfa | Not |
|---|---|---|
| 01 | Kapak | Başlık, tarih/yer/ölçek, altta geçmiş sponsorlar bandı |
| 02 | **Yönetici Özeti** | 5 satırlık teklif özeti + "Neden AHDEM" koyu kutusu |
| 03 | Bir Bakışta | 4 / 120+ / 40 / 5. / 5 istatistikleri |
| 04 | Biz Kimiz | AHDEM tanıtımı + 6 beceri |
| 05 | **Geçmiş Sponsorlarımız** | 5 sponsor kartı + ev sahibi + boş "Ana Sponsor" alanı |
| 06 | Dört Konferanslık Birikim | 2023–2027 zaman çizelgesi + Yüksel Yalova kutusu |
| 07 | **Geçmiş Konferanslardan** | ⚠️ Fotoğraf yerleşimi boş — aşağıya bak |
| 08 | 2027 Teması | 1950–1960 + tarafsızlık ilkesi |
| 09 | **Konferansın Yapısı** | Yasama/Yürütme/Yargı + kriz komiteleri |
| 10 | Konferans Modeli | 5 adım + akademik ekip / organizasyon ekibi kartları |
| 11 | Katılımcı Profili | Fakülte dağılımı + temas süresi / dijital yansıma |
| 12 | Ana fikir | Koyu geçiş sayfası |
| 13 | Neden Bu İş Birliği | Sponsora 4 fayda |
| 14 | Sponsorluk Modelleri | Ana / Destek / İkram |
| 15 | Karşılaştırmalı Hak Tablosu | 14 satırlık hak matrisi |
| 16 | Marka Temas Noktaları | 5 an + 4 alan |
| 17 | **Logonuz Nerede Görünür** | 6 mockup: afiş, sahne fonu, roll-up, çanta, yaka kartı, sertifika |
| 18 | Şeffaf Bütçe | "Desteğiniz nerelerde harcanacak?" — ikonlu kalem listesi, tutar yok |
| 19 | İletişim | Kapanış + iletişim bilgileri |

Web sayfası aynı içeriği taşır, ek olarak en sonda **"Geçen sene AHDEM nasıldı?"** video
bölümü vardır (video henüz eklenmedi).

---

## 6. Yapılan değişikliklerin tam listesi

Sırasıyla, istenen → yapılan:

1. **Pelin'in telefonu** → 0537 828 84 48 eklendi (iletişim sayfası + e-posta imzası).
2. **İsim düzeltmesi** → "Pelin Yükselin" → **"Pelin Yüksel"**.
3. **"Devlet desteği" dili kaldırıldı** → Gençlik ve Spor Bakanlığı ile Mamak Belediyesi artık
   "kamu kurumlarının desteğiyle" değil, **"Geçmiş Sponsorlarımız"** başlığı altında geçiyor.
   İstatistik "2 kamu kurumundan resmî destek" → "geçmiş konferanslarda sponsor kurum".
   AÜHF ayrı tutuldu: **"Ev Sahibi Kurum — sponsor değil"**.
4. **E-posta taslağı sayfası silindi.**
5. **Dosya ikiye ayrıldı** → `sunum-kaynak.html` (PDF) ve `index.html` (web sitesi).
   Web sayfası sıfırdan yazıldı: yapışkan menü, mobil menü, hero + CTA butonları, yatay
   kaydırılabilir hak tablosu, tıklanabilir telefonlar, konusu doldurulmuş `mailto:` bağlantısı.
6. **"Komite" → "Komisyon"** (meclis komisyonu mantığı) — her iki dosyada.
7. **Yıllar düzeltildi** → 2023'ten bu yana; 2023:1969–73, 2024:1923–27, 2025:1978–82,
   2026:1993–97 (ekonomik kriz ve hükümet kurulamama krizi), 2027:1950–60. "5. kez düzenlenen".
8. **Dosyayı sponsor gözünde güçlendirme** → 3 yeni sayfa: Yönetici Özeti, Geçmiş
   Konferanslardan (fotoğraf ızgarası), Logonuz Nerede Görünür (6 mockup).
9. **Geçmiş sponsorlar 5'e çıkarıldı** → Gençlik ve Spor Bakanlığı, Mamak Belediyesi,
   Gün + Partners Avukatlık Bürosu, Maya Genç Düşünce Platformu, Ankara Hukuk Mezunu Avukatlar.
   Sayfa düzeni 5 dar kart + 2 geniş kart olarak yeniden kuruldu.
10. **Unvanlar** → "AHDEM Başkanı" yerine **"Demokrasi Müzakereleri Topluluğu Başkanı"**
    (ve Başkan Yardımcısı).
11. **"Altı ayrı komisyon" sayfası kaldırıldı** → yerine **"Yasama, yürütme ve yargı aynı
    masada"**: üç erk kartı, erklerin birbirini etkilemesi, **kriz komiteleri**, kaynak dosyası.
12. **Ekip vurguları eklendi** → akademik ekibin kuralları/işleyişi kurup yönettiği;
    organizasyon ekibinin konferanstan 6 ay önce başladığı ve bugün iletişime geçen ekibin
    o hazırlığın içinde olduğu.
13. **Bütçe sayfası** → başlık **"Desteğiniz nerelerde harcanacak?"**; boş `____ TL` sütunu ve
    TOPLAM satırı silindi, kalemler ikonlu kutucuklara dönüştü.
14. **"İş birliğinin beş adımı" (süreç/takvim) sayfası silindi** — sunumdan ve siteden.
15. **Yüksel Yalova eklendi** → zaman çizelgesi sayfasına vurgulu kutu olarak.
    ⚠️ **Unvan düzeltmesi yapıldı:** "Meclis eski başkanı" değil — TBMM'nin başkanlığını
    yapmamıştır. Doğrusu: **ANAP Aydın eski Milletvekili, TBMM eski Başkanvekili ve
    Devlet eski Bakanı Dr. Yüksel Yalova.**
16. **Logo yuvaları açıldı** — bkz. aşağıdaki bölüm.
17. Yol boyunca sayfa altındaki çizgiye taşan kart/metin blokları düzeltildi (s.3, s.5, s.9, s.18).

---

## 7. AÇIK İŞLER (yeni sohbette yapılacaklar)

### 7.1 ⚠️ Logolar — dosyalar gerekiyor

İki logo var:
- **Konferans logosu:** lacivert kare, beyaz defne çelengi içinde bina, altında "AHDEM".
- **Topluluk mührü:** yuvarlak, altın çerçeveli; "ANKARA HUKUK DEMOKRASİ MÜZAKERELERİ
  TOPLULUĞU" yazılı, ortada terazi + sütun + açık kitap.

Kod tarafı **hazır**. Her iki dosyaya da şu isimlerle `<img>` yuvaları kondu:

| Dosya adı | Nerede görünür |
|---|---|
| `logo-konferans.png` | Sunum kapağı (sol üst) · Site üst menüsü · Site hero |
| `logo-topluluk.png` | Sunum "Biz Kimiz" (sağ üst) · Sunum kapanış · Site "Biz Kimiz" · Site iletişim |

Yuvalar `onerror="this.style.display='none'"` ile korumalı: **dosya yoksa hiçbir şey
görünmez, kırık resim ikonu çıkmaz.** Yani şu anki PDF ve site logosuz ama bozuk değil.

**Yapılacak:** Bu iki logoyu (jpg/png/webp fark etmez) `AHDEM` klasörüne koy. Sonra:

- Konferans logosu koyu lacivert zeminlerde kullanılıyor ve kendi arka planı da lacivert —
  çoğu yerde arka plan silmeye gerek yok. Açık zeminde kullanılacaksa temizlenmeli.
- Topluluk mührünün arka planı siyah, **mutlaka temizlenmeli**.
- Klasörde hazır bekleyen `logo-hazirla.py` betiği bu işi yapar. Kaynakları
  `kaynak-konferans.*` ve `kaynak-topluluk.*` adıyla koyup çalıştırmak yeterli
  (`pip install pillow numpy` gerekir). Ya da yeni sohbette dosyaları verip
  "arka planı temizle ve göm" demek yeterli — Claude aynı işi yapar ve PDF'i yeniden basar.
- Ek olarak s.17'deki mockup'larda "AHDEM" yazan küçük altın kutucuklar gerçek logoyla
  değiştirilebilir.

### 7.2 ⚠️ Fotoğraflar (s.07)

"Geçmiş Konferanslardan" sayfasında 5 boş fotoğraf alanı var: genel kurul/açılış (büyük,
yatay), komisyon çalışması, katılımcı sunumu, fuaye, kapanış ve sertifika töreni.
**Bu sayfa boş haliyle sponsora gönderilmemeli** — ya fotoğraflar eklenmeli ya da sayfa
çıkarılmalı. Aynı ızgara sitede de var.

### 7.3 ⚠️ Bütçe rakamları

Bütçe sayfasında artık tutar yok (istenen buydu), yerine "kalem bazındaki güncel tutarlar
görüşme sürecinde ayrıntılı bir bütçe tablosu olarak paylaşılır" notu var. Yine de firmaların
teklifi değerlendirebilmesi için en azından bir **bant** vermek dönüşü ciddi biçimde artırır
(ör. "Ana Sponsorluk: X–Y TL"). Karar sizde.

### 7.4 Tanıtım videosu (sadece site)

Sitenin en sonunda **"Geçen sene AHDEM nasıldı?"** bölümü hazır, 9:16 dikey çerçeve bekliyor.
İki seçenek — HTML'de o noktada yorum satırı olarak da yazılı:

```html
<!-- mp4 için -->
<video controls playsinline poster="kapak.jpg">
  <source src="ahdem-tanitim.mp4" type="video/mp4">
</video>

<!-- Instagram reel için -->
<iframe src="https://www.instagram.com/reel/KOD/embed" allowfullscreen></iframe>
```

mp4 daha hızlı açılır ve Instagram'a bağımlı olmaz; tercih edilen budur.

### 7.5 Erişim/etki metrikleri (öneri, henüz yapılmadı)

Dosyada "120+ öğrenci" var ama bu bir markaya tek başına bir şey ifade etmiyor. Sponsorlar
erişim satın alır. Eklenmesi önerilen sayfa: kişi başı marka teması, toplam ürün/ikram teması,
tahmini sosyal medya erişimi, fotoğraf/video çıktısı, ulaşılan üniversite sayısı. Gerçek
rakamlar yoksa "hedeflenen" notuyla verilebilir.

### 7.6 Sitenin yayına alınması

`index.html` tek dosya ve dışa bağımlılığı yok (Google Fonts hariç). Herhangi bir statik
barındırmaya (Netlify, GitHub Pages, Cloudflare Pages) sürükle-bırak ile yüklenebilir.
Logo/video dosyaları eklenirse onların da aynı klasöre çıkılması gerekir.

---

## 8. Yeni sohbete başlarken

Bu metni yapıştırıp şunu demek yeterli:

> AHDEM klasöründeki `sunum-kaynak.html` ve `index.html` üzerinde çalışıyoruz. Sunumda bir
> değişiklik yaptıktan sonra PDF'i yeniden basman gerekiyor (Playwright + Chromium,
> 13.333×7.5 inç, printBackground). Devir notundaki açık işlerden şununla başlayalım: …

**Dikkat edilecekler:**
- Sunum ve site ayrı dosyalar — "her ikisinde de" denmedikçe sadece birine dokun.
- Slayt ekleyip silince sayfa numaralarını yeniden üret.
- Slaytlarda içerik uzayınca alt çizgiye taşma olur; her değişiklikten sonra ilgili sayfayı
  görsel olarak kontrol et.
- Kuruma gidecek bir belge — unvan, kurum adı ve tarih gibi bilgilerde tahmin yürütme, teyit et.
