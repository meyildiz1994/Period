# Period · Geliştirici notları

Kaynak dosya: Figma "Period Final" (gDwelAeecf9MfEk6wpAYDI). Aynı notlar dosyada 1 · Temeller › 00 · Geliştirici notları bölümünde de var.

## Dosya yapısı
- **1 · Temeller**: kapak, 00 Geliştirici notları, 01 Renk, 02 Yazı, 03 Boşluk/köşe/gölge, 04 Simgeler, 05 Bileşenler, 06 UX kuralları, 07 Değişiklik günlüğü.
- **2 · Akışlar**: 01 Bilgi mimarisi, 02 Kullanıcı akışları (10 akış).
- **3 · Ekranlar**: 49 ekran, 9 bölüm, kodlar A1–I3.

## Ekran ve ızgara
- iPhone 390×844 pt, @1x. 4 pt ızgara, kenar boşluğu 20, kartlar arası 12–16.
- Sekme çubuğu her ana ekranda sabit: Home | History | + | Insights | Me.
- Home kaydırmaz, 844'e sığar. Diğer ekranlar dikey kaydırır.

## Token'lar
- 3 değişken koleksiyonu (81 değişken): Period · Primitives (ham palet), Period · Semantic (bg, surface, text, border, feedback), Period · Dimensions (boşluk, köşe).
- Kodda yalnızca Semantic ve Dimensions kullanılır.
- Tek mod (Light). Koyu tema eklenecekse Semantic'e yeni mod açılır.

## Yazı
- Plus Jakarta Sans. 26 yazı stili (Display, Headline, Title, Body, Caption, Footnote, Overline) ve 4 gölge stili (Elevation).
- Stil adları kodda tipografi token'ı olarak aynen kullanılır.

## Bileşenler ve ikonlar
- 31 bileşen seti, varyant ve property adları (Type, Size, State…) koda aynen geçer.
- İmza bileşen: Cycle Ring (Phase varyantları, Empty dahil).
- 102 ikon, 24×24, 1.8 çizgi, ad `Icon/<ad>`. İkon rengi her zaman token'dır. Buton içindeki ikon etiket rengini izler; koyu zeminde `text/on-brand`.

## Erişilebilirlik
- Dokunma alanı en az 44 pt.
- WCAG AA kontrast. Düşük kontrast yalnızca Disabled durumunda (C4, F2, F5, G4, H6, H7 bilerek öyle).
- Yalnız ikon olan butonlar erişilebilirlik etiketi alır.

## Ekran kodları
A Karşılama ve kurulum · B Ana ekran durumları · C Kayıt · D Geçmiş · E İçgörüler · F Hesap ve giriş · G Ben ve ayarlar · H Verilerin · I Sistem ve bildirimler.

Prototip başlangıçları: 1 Karşılama ve kurulum (A1), 2 Uygulama (B1), 3 İlk açılış (B2), 4 Açılış/splash (I1), 5 Bildirimden açılış (I2).

Boş, yükleniyor ve hata durumları: B2–B4, C4–C5, D4, E2, F2, F4, F5, H4. Yıkıcı işlemler iki adımlı (H5–H7).

## Metin ve örnek veri
- Arayüz dili İngilizce (v1). Tıbbi iddia yok; tahminler "estimate" diye etiketlenir.
- Örnek veri: kullanıcı Nilü, bugün 14 Kasım 2026, döngü 28 gün, regl 5 gün (Day 3).
- Veri varsayılan olarak cihazda kalır; hesap isteğe bağlı.

## Son taramada düzeltilenler (2026-10-05)
- Yarısı veya tamamı siyah kalan ~220 ikon token renge bağlandı (Save period, Quick Log alt sayfası, Flow/Mood/Symptoms seçimleri, liste ikonları, form alanları).
- 614 sabit renk token'a bağlandı. Değişken ve stillerin hepsi bu dosyada yerel.
- Arka plan karartmaları (Scrim) %45 opaklığa geri alındı. Bölüm açıklamaları ekran başlıklarıyla çakışmayacak şekilde yukarı taşındı.

## Bildirimler, splash ve uygulama ikonu (2026-10-06)
- Uygulama içinde bildirim merkezi yok. Zil ikonu tüm ekranlardan kaldırıldı. Kullanıcı yalnızca push bildirimi alır.
- **I1 Splash**: bordo zemin, damla işareti, "Period" ve "Track · Understand · Manage". 0.8 sn sonra A1'e geçer.
- **I2 Push bildirimleri** (kilit ekranı). Bildirime dokununca ilgili ekran açılır:
  - "Your period may start in 2 days" açar B1 Home.
  - "Your period is expected today" açar C2 Log Period.
  - "How was today?" açar C3 Daily Log.
  - "Your period is 2 days late" açar B4 Home · Period late.
  - Bildirimler G3/G4'teki hatırlatma ayarlarına bağlıdır. Kilit ekranında içerik gizliyse yalnızca "Period · New reminder" görünür.
- **I3 Uygulama ikonu**: bordo zemin, beyaz damla. Mağaza için 1024×1024 PNG, köşesiz ve saydamlıksız dışa aktarılır ("App icon · 1024 (export)" çerçevesi).
