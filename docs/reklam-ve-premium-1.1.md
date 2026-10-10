# Yayın listesi: reklam, Premium aboneliği ve hesap (aynı sürümde)

Uygulama ücretsiz kalıyor.

**Reklam kuralları**
- Kişiselleştirilmemiş AdMob banner'ı yalnızca Ana sayfa, Geçmiş ve Analiz ekranlarının en altında çıkar. Adet kaydı, günlük kayıt ve ayar ekranlarında reklam yok.
- Onboarding'den sonraki ilk 7 gün hiç reklam gösterilmez; reklam SDK'sı ve izin formu bile başlatılmaz. 1.0.0'dan güncelleyenler için bu 7 gün güncellemenin ilk açılışından itibaren sayılır.

**Nilemy Premium** otomatik yenilenen bir aboneliktir (aylık ya da yıllık) ve şunları içerir:
- Reklamsız kullanım
- Analiz'de: tüm zamanlar (yıllara göre ortalamalar, olağan fark), belirti örüntüleri (en az 3 döngüde görülen), ruh hali / enerji / ağrı döngü haritası
- Döngü özeti PDF'i (yorumsuz döküm, "tıbbi değerlendirme değildir" notuyla) ve paylaşılabilir yıllık özet görseli
- Akıllı hatırlatıcılar: belirti uyarısı ve kullanıcının kendi günlük hatırlatıcıları
- Günlük kayda sınırsız özel belirti ekleme

Ücretsiz sürümde mevcut Analiz ekranı aynen kalır. Günlük kayda eklenen enerji alanı herkese açıktır.

## Yayından önce yapılması gerekenler

### AdMob
1. admob.google.com'da iOS ve Android için birer uygulama oluştur (paket: `com.meyildiz.nilemy`).
2. Her birine bir **Banner** reklam birimi ekle.
3. `app.json` içindeki `iosAppId` / `androidAppId` değerlerini (şu an Google'ın test kimlikleri) kendi uygulama kimliklerinle değiştir.
4. `src/lib/ads.ts` içindeki `UNITS.ios` / `UNITS.android` değerlerini kendi banner birimi kimliklerinle değiştir.
5. AdMob → Gizlilik ve mesajlaşma: **GDPR mesajı** oluştur ve yayınla (AB/BK/İsviçre için izin formu bu mesajdan gelir). İstersen ABD eyaletleri mesajını da aç.
6. AdMob → Engelleme kontrolleri: hassas kategorileri (ör. kumar, alkol, flört, kilo verme) kapat; içerik derecesini en fazla **PG** bırak (kod da PG ile sınırlıyor).
7. nilemy.com'a `app-ads.txt` ekle (AdMob kurulumda içeriğini verir).

### App Store Connect
1. **Ücretli Uygulamalar Sözleşmesi** (İşletme → Sözleşmeler): imzalı ve banka/vergi bilgileri tamam olmalı, yoksa abonelikler satılamaz.
2. **Abonelikler** → Abonelik grubu oluştur: ad "Nilemy Premium". Grubun TR/EN görünen adını ekle.
3. Gruba iki otomatik yenilenen abonelik ekle:
   - `com.meyildiz.nilemy.premium.yearly`: süre 1 yıl, referans adı "Premium Yearly"
   - `com.meyildiz.nilemy.premium.monthly1`: süre 1 ay, referans adı "Premium Monthly"
   Her biri için fiyat (Türkiye fiyatını seç, diğer ülkeleri Apple hesaplar), TR/EN görünen ad ve açıklama ve inceleme ekran görüntüsü (Premium ekranı) ekle. Yıllık planı gruptaki sıralamada üste koy.
4. İstersen yıllık plana **Tanıtım teklifi** olarak ücretsiz deneme (ör. 1 hafta) ekle. Kodda değişiklik gerekmez; Apple'ın satın alma ekranı denemeyi kendisi gösterir.
5. Uygulama sayfasında **Kullanım Koşulları (EULA)** bağlantısını doldur: Apple'ın standart EULA'sını kullanabilir ya da nilemy.com/terms koyabilirsin. Açıklamanın sonuna da Kullanım Koşulları ve Gizlilik Politikası bağlantılarını yaz (abonelikli uygulamalarda Apple bunu istiyor).
6. Abonelikleri 1.1 build'iyle birlikte incelemeye gönder (ilk abonelikler mutlaka bir build ile birlikte gönderilmeli).
7. **App Privacy** güncellemesi ("Veri toplanmıyor" artık doğru değil). Üçüncü taraf (Google AdMob) için:
   - Konum → Kaba konum
   - Tanımlayıcılar → Cihaz kimliği
   - Kullanım verisi → Ürün etkileşimi, Reklam verisi
   - Tanılama → Çökme verisi, Performans verisi, Diğer tanılama verisi
   - Hepsinin amacı: **Üçüncü taraf reklamcılık** (tanılama için ayrıca Analiz).
   - Kullanıcıya bağlı mı: **Hayır**. İzleme için kullanılıyor mu: **Hayır** (reklam kimliği yok, kişiselleştirme yok, ATT istenmiyor).
   - Sağlık ve fitness: **toplanmıyor** (kayıtlar cihazdan çıkmıyor).
8. **App Review notu** (aşağıdaki metni kullan).
9. **AB (DSA) tüccar durumu**: Uygulama artık para kazandığı için "trader" olarak güncelle; Apple AB mağaza sayfasında adres, telefon ve e-posta gösterir.
10. Yaş derecelendirmesi anketinde reklamla ilgili soru varsa "Evet, reklam içerir" de.

### Google Play Console
1. **Abonelikler**: iki abonelik ürünü oluştur, kimlikleri App Store'dakiyle aynı: `com.meyildiz.nilemy.premium.yearly` (temel plan: 1 yıl, otomatik yenilenen) ve `com.meyildiz.nilemy.premium.monthly1` (temel plan: 1 ay). Fiyatları ve TR/EN açıklamaları ekle, temel planları etkinleştir.
2. **Reklamlar** beyanı: Uygulama reklam içeriyor → Evet.
3. **Reklam kimliği** beyanı: Kullanmıyor (AD_ID izni `app.json`'da engellendi).
4. **Veri güvenliği**: Yaklaşık konum, Cihaz veya diğer kimlikler, Uygulama etkileşimleri, Tanılama → Toplanıyor ve Google ile paylaşılıyor, amaç Reklam/Pazarlama ve Analiz; aktarımda şifreli. Sağlık bilgisi: toplanmıyor.

### Gizlilik politikası
- Uygulama içi Gizlilik ekranı ve nilemy.com/privacy bu PR'da güncellendi. Site, PR birleşince yayına girer; uygulama 1.0.1 ile.
- KVKK: Metinlerde marka adı ("Nilemy") kullanılıyor; veri sorumlusunun yasal kimliği avukat görüşüne bırakıldı (`/mnt/project-files/reklam/kvkk-metinleri-avukat.docx`, Soru 4). Google'a yurt dışı aktarım politikada anlatılıyor; Türkiye'de ayrı bir açık rıza ekranı eklemedik, çünkü Google'ın izin formu yalnızca AB/BK/İsviçre/ABD eyaletlerinde çıkıyor. Türkiye için ayrı bir açık rıza ekranı istersen ayrı bir iş olarak ekleyebiliriz (bir hukukçuya da sormanı öneririm).

## Apple'a 1.0.1 inceleme notu (taslak)

> Nilemy 1.1 adds two things. (1) The free version shows Google AdMob banner ads at the bottom of the Home, History and Insights screens. Only non-personalised ads are requested, no advertising identifier is used and the app does not track users, so there is no App Tracking Transparency prompt. Google's consent form (UMP) is shown first where required. No health data or user logs are ever passed to the ads SDK; logs remain encrypted on the device. (2) An auto-renewable subscription, "Nilemy Premium" (monthly: com.meyildiz.nilemy.premium.monthly1, yearly: com.meyildiz.nilemy.premium.yearly), removes ads and unlocks deeper insights (all-time trends, symptom patterns, a mood/energy/pain map), a cycle summary PDF, a year-in-review image, smart reminders and custom symptoms. All Premium features run on the device. It is available from Me › Nilemy Premium, from Insights and from the "Remove ads" link above each banner; the screen shows each plan's price and period, the auto-renewal terms and links to the Terms of Use and Privacy Policy, with Restore purchase and Manage subscription buttons. The App Privacy section and Privacy Policy (https://nilemy.com/privacy) have been updated accordingly.

## Test
- Development build gerekiyor (`eas build --profile development` ya da `npx expo run:ios`); Expo Go'da reklam ve satın alma modülleri yok.
- Development build'lerde her zaman Google'ın test reklamları gelir.
- Aboneliği iOS'ta Sandbox hesabıyla, Android'de lisans test kullanıcısıyla dene. Sandbox'ta abonelikler hızlı yenilenir (1 ay ≈ 5 dakika); bittiğinde uygulama öne gelince reklamların geri geldiğini kontrol et.
- İzin formunu Türkiye'den görmek için geçici olarak `AdsConsent.gatherConsent({ debugGeography: AdsConsentDebugGeography.EEA, testDeviceIdentifiers: [...] })` kullanılabilir.


## Hesap ve şifreli yedek (aynı sürüme eklendi)

**Firebase'de yapılacaklar (kurulum bitti, kalanlar):**
- Android derlemesi yapılınca EAS'teki imza sertifikasının SHA-1'ini Firebase → Proje ayarları → Android uygulaması'na ekle (Google ile giriş Android'de bunsuz çalışmaz). `npx eas-cli@latest credentials -p android` SHA-1'i gösterir.
- Apple ile girişte hesap silinirken Apple jetonunun iptali için: Apple Developer → Keys → "Sign in with Apple" anahtarı oluştur; Firebase → Authentication → Apple → "OAuth code flow configuration" bölümüne Team ID, Key ID ve özel anahtarı gir. Bu yapılmazsa hesap yine silinir, yalnızca Apple tarafındaki bağlantı kullanıcı kendi Apple Kimliği ayarlarından kaldırana kadar kalır.
- Firebase → Authentication → Templates: parola sıfırlama e-postasının dilini Türkçe yap, gönderen adını "Nilemy" yap.
- Firebase → Authentication → Settings → "User account linking": "Link accounts that use the same email" seçili kalsın (varsayılan).

**App Store Connect → App Privacy (hesap için eklenecekler):**
- İletişim bilgileri → E-posta adresi: Uygulama işlevselliği; kullanıcıya bağlı: Evet; izleme: Hayır.
- İletişim bilgileri → Ad: Uygulama işlevselliği; kullanıcıya bağlı: Evet; izleme: Hayır. (Google ile girişte Firebase profil adını kaydediyor.)
- Tanımlayıcılar → Kullanıcı kimliği: Uygulama işlevselliği; kullanıcıya bağlı: Evet; izleme: Hayır.
- Sağlık ve fitness → Sağlık: Uygulama işlevselliği; kullanıcıya bağlı: Evet; izleme: Hayır. Yedek uçtan uca şifreli olduğu için Apple'ın tanımına göre bu beyan isteğe bağlı sayılabilir, ama temkinli olmak için beyan etmeni öneririm.
- Reklam (AdMob) satırları yukarıdaki gibi kalır; hiçbiri hesapla ilişkilendirilmez.

**Google Play → Veri güvenliği (hesap için eklenecekler):**
- Kişisel bilgiler → Ad, E-posta adresi, Kullanıcı kimlikleri: toplanıyor, paylaşılmıyor; amaç Uygulama işlevselliği ve Hesap yönetimi; isteğe bağlı.
- Sağlık ve fitness → Sağlık bilgileri: toplanıyor (uçtan uca şifreli), paylaşılmıyor; amaç Uygulama işlevselliği; isteğe bağlı.
- Aktarım sırasında şifreleniyor: Evet. Kullanıcı verilerin silinmesini isteyebilir: Evet (uygulama içinde ve info@nilemy.com).
- **Hesap silme bağlantısı** (Play zorunlu kılıyor): https://nilemy.com/support/ (SSS'de "Hesabımı nasıl silerim?" bölümü).

**App Review notu eki:**
> Accounts are optional. Reviewers can tap "Continue without signing in" on the Welcome screen to use the app without an account. To try the account flow, sign in with Apple or Google, or sign up with any email, then create a Nilemy password (it encrypts the backup on the device). Accounts can be deleted in Me › Account › Delete account.

**Test:**
- Google ile giriş: development build gerekiyor (Expo Go'da yok). iOS'ta çalışır; Android'de SHA-1 eklenmeden çalışmaz.
- Apple ile giriş: gerçek bir iPhone'da (simülatörde Apple Kimliği ile giriş yapılmış olmalı).
- İki telefonla dene: birinde kayıt ekle, diğerinde uygulamayı öne getir; değişikliğin birkaç saniye içinde gelmesi gerekir.
- Uçak modunda kayıt ekle, interneti aç, uygulamayı öne getir: eşitlenmeli.
- Kurtarma koduyla parolayı sıfırla, sonra yeni parolayla başka telefonda yedeği aç.
