# 1.0.1: Reklam ve Premium yayın listesi

Uygulama ücretsiz kalıyor. Ücretsiz sürüm Ana sayfa, Geçmiş ve Analiz ekranlarının altında kişiselleştirilmemiş AdMob banner'ı gösterir (adet kaydı, günlük kayıt ve ayar ekranlarında reklam yok). **Nilemy Premium** tek seferlik bir satın alma (abonelik değil): 1.0.1'de reklamları kaldırır. Mevcut Analiz ekranı herkese açık kalır. İleride gelecek yeni analizler `<PremiumOnly>` bileşeniyle Premium'a özel yapılabilir. Mağaza metninde ve Premium ekranında henüz çıkmamış özellik vaat etme; Apple bunu reddedebilir (2.3.1 / 3.1.1). Yeni analiz çıktığında o sürümde Premium ekranına eklenir.

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
1. **Uygulama İçi Satın Alma** → Tüketilmeyen (Non-Consumable), Ürün kimliği: `com.meyildiz.nilemy.premium`, ad: Nilemy Premium. Fiyat, TR/EN açıklama ve inceleme için ekran görüntüsü (Premium ekranı) ekle. 1.0.1 build'iyle birlikte incelemeye gönder.
2. **App Privacy** güncellemesi ("Veri toplanmıyor" artık doğru değil). Üçüncü taraf (Google AdMob) için:
   - Konum → Kaba konum
   - Tanımlayıcılar → Cihaz kimliği
   - Kullanım verisi → Ürün etkileşimi, Reklam verisi
   - Tanılama → Çökme verisi, Performans verisi, Diğer tanılama verisi
   - Hepsinin amacı: **Üçüncü taraf reklamcılık** (tanılama için ayrıca Analiz).
   - Kullanıcıya bağlı mı: **Hayır**. İzleme için kullanılıyor mu: **Hayır** (reklam kimliği yok, kişiselleştirme yok, ATT istenmiyor).
   - Sağlık ve fitness: **toplanmıyor** (kayıtlar cihazdan çıkmıyor).
3. **App Review notu** (aşağıdaki metni kullan).
4. **AB (DSA) tüccar durumu**: Uygulama artık para kazandığı için "trader" olarak güncelle; Apple AB mağaza sayfasında adres, telefon ve e-posta gösterir.
5. Yaş derecelendirmesi anketinde reklamla ilgili soru varsa "Evet, reklam içerir" de.

### Google Play Console
1. **Uygulama içi ürün** (tek seferlik): `com.meyildiz.nilemy.premium`.
2. **Reklamlar** beyanı: Uygulama reklam içeriyor → Evet.
3. **Reklam kimliği** beyanı: Kullanmıyor (AD_ID izni `app.json`'da engellendi).
4. **Veri güvenliği**: Yaklaşık konum, Cihaz veya diğer kimlikler, Uygulama etkileşimleri, Tanılama → Toplanıyor ve Google ile paylaşılıyor, amaç Reklam/Pazarlama ve Analiz; aktarımda şifreli. Sağlık bilgisi: toplanmıyor.

### Gizlilik politikası
- Uygulama içi Gizlilik ekranı ve nilemy.com/privacy bu PR'da güncellendi. Site, PR birleşince yayına girer; uygulama 1.0.1 ile.
- KVKK: Veri sorumlusu Nilufer Akten. Google'a yurt dışı aktarım politikada anlatılıyor; Türkiye'de ayrı bir açık rıza ekranı eklemedik, çünkü Google'ın izin formu yalnızca AB/BK/İsviçre/ABD eyaletlerinde çıkıyor. Türkiye için ayrı bir açık rıza ekranı istersen ayrı bir iş olarak ekleyebiliriz (bir hukukçuya da sormanı öneririm).

## Apple'a 1.0.1 inceleme notu (taslak)

> Nilemy 1.0.1 adds two things. (1) The free version shows Google AdMob banner ads at the bottom of the Home, History and Insights screens. Only non-personalised ads are requested, no advertising identifier is used and the app does not track users, so there is no App Tracking Transparency prompt. Google's consent form (UMP) is shown first where required. No health data or user logs are ever passed to the ads SDK; logs remain encrypted on the device. (2) A non-consumable in-app purchase, "Nilemy Premium" (com.meyildiz.nilemy.premium), removes ads. It is available from Me › Nilemy Premium and from the "Remove ads" link above each banner; a Restore purchase button is on the same screen. The App Privacy section and Privacy Policy (https://nilemy.com/privacy) have been updated accordingly.

## Test
- Development build gerekiyor (`eas build --profile development` ya da `npx expo run:ios`); Expo Go'da reklam ve satın alma modülleri yok.
- Development build'lerde her zaman Google'ın test reklamları gelir.
- Satın almayı iOS'ta Sandbox hesabıyla, Android'de lisans test kullanıcısıyla dene.
- İzin formunu Türkiye'den görmek için geçici olarak `AdsConsent.gatherConsent({ debugGeography: AdsConsentDebugGeography.EEA, testDeviceIdentifiers: [...] })` kullanılabilir.
