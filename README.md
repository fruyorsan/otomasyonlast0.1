# 🚀 Trading Otomasyonu Sistemi

Meme coin'ler için **limit order** tabanlı, **düşük sermaye** odaklı, **komisyon kontrollü** bir kripto trading otomasyonu sistemi.

## ✨ Özellikler

### 🎯 Meme Coin Stratejisi
- **Hedef Coinler**: DOGE, SHIB, PEPE, FLOKI, BONK
- **Minimum Sermaye**: $10
- **Maksimum Sermaya**: $100 per işlem
- **Risk Yönetimi**: Toplam sermayenin %2'si risk

### ⏰ Trading Saatleri (1-2 Saat Günlük)
```
🌅 Sabah Session:  08:00 - 09:00 (1 saat)
🌆 Öğleden Sonra:  14:00 - 16:00 (2 saat)
```

### 💡 Limit Order Sistemi
- Giriş öncesi **komisyon hesaplaması**
- Eğer komisyon kar/zarar hedefinin **%10'unu geçerse** işlem yapılmaz
- **Otomatik stop-loss ve take-profit** seviyeleri
- Risk/Reward oranı kontrolü

### 📊 Kar Hedefleri
- **Kar Hedefi**: %5 per işlem
- **Stop Loss**: %3
- **Break Even**: %0.5

### 🔧 Volatilite Tabanlı İşlem
- Minimum volatilite: %2
- Aşırı satım (-5%): BUY sinyali
- Aşırı alım (+5%): SELL sinyali
- Sadece yüksek volatilite d��nemlerinde işlem yap

## 📁 Dosya Yapısı

```
lib/trading/
├── limitOrderManager.ts      # Limit order yönetimi & komisyon kontrolü
├── tradingScheduler.ts       # İşlem saatleri & session yönetimi
├── memeCoinsStrategy.ts      # Meme coin stratejisi & sinyal üretimi
├── automationEngine.ts       # Ana otomasyon motoru
├── config.ts                 # Konfigürasyon & ayarlar
├── api.ts                    # API endpoints
└── index.ts                  # Sistem başlatıcı

app/api/trading/
└── route.ts                  # Next.js API routes

components/
└── TradingDashboard.tsx      # Kontrol paneli UI
```

## 🚀 Başlangıç

### 1. Sistemi Başlat
```typescript
import { initializeTradingSystem } from '@/lib/trading';

const { engine, scheduler, strategy } = await initializeTradingSystem();
```

### 2. Otomasyonu Başlat
```typescript
engine.startAutomation(); // Trading session'da otomatik başlar
```

### 3. Sistem Durumunu Kontrol Et
```typescript
const status = engine.getStatus();
// {
//   isRunning: boolean,
//   currentSession: TradingSession | null,
//   timeUntilNextSession: number,
//   activeTrades: number,
//   totalProfit: number,
//   successRate: number
// }
```

## 📡 API Endpoints

### GET `/api/trading?action=status`
Sistem durumunu al

### GET `/api/trading?action=statistics`
İşlem istatistiklerini al

### GET `/api/trading?action=history?limit=50`
İşlem geçmişini al

### GET `/api/trading?action=config`
Strateji konfigürasyonunu al

### POST `/api/trading`
```json
{
  "action": "start" | "stop" | "execute" | "close" | "scan",
  ...params
}
```

**Örnek - İşlem Başlat:**
```json
{
  "action": "start"
}
```

**Örnek - İşlem Yap:**
```json
{
  "action": "execute",
  "symbol": "DOGE",
  "action": "BUY",
  "confidence": 75,
  "capital": 50,
  "commissionPercentage": 0.1
}
```

**Örnek - İşlem Kapat:**
```json
{
  "action": "close",
  "tradeId": "TRADE_1725362400000",
  "exitPrice": 0.085
}
```

## 💰 Komisyon Kontrol Mekanizması

### Nasıl Çalışır?
1. İşlem öncesi **toplam komisyon hesaplanır** (giriş + çıkış)
2. Kar/zarar hedefi belirlenir
3. Komisyonun kar/zarar hedefine oranı hesaplanır
4. **Oran > %10 ise işlem yapılmaz** ❌

### Örnek Senaryo
```
Entry: $100
Quantity: 10
Commission Rate: 0.1%

Entry Commission: $1
Exit Commission (TP): $1
Total: $2

TP Price: $105
Gross Profit: $50
Net Profit: $48

Commission Ratio: $2 / $50 = %4 ✅ (OK, %10'dan az)
Trade Executed!
```

### Reddedilen Örnek
```
Entry: $100
Quantity: 5
Commission Rate: 0.5%

Entry Commission: $2.50
Exit Commission (TP): $2.50
Total: $5

TP Price: $102
Gross Profit: $10
Net Profit: $5

Commission Ratio: $5 / $10 = %50 ❌ (> %10)
Trade REJECTED!
```

## 🎯 İşlem Sinyalleri

### BUY Sinyali 📈
- Fiyat son 24 saatde -5% veya daha aşağıda
- Volatilite > %3
- Güven oranı > %50
- Aşırı satım durumu

### SELL Sinyali 📉
- Fiyat son 24 saatde +5% veya daha üstünde
- Volatilite > %3
- Güven oranı > %50
- Aşırı alım durumu

## 📊 Dashboard Özellikleri

✅ **Real-time Monitoring**
- Aktif işlem sayısı
- Toplam kar/zarar gösterimi
- Başarı oranı (%)
- Kazanç oranı (%)

✅ **İşlem Yönetimi**
- Start/Stop kontrolü
- İşlem geçmişi
- Detaylı istatistikler

✅ **Sistem Bilgisi**
- Sistem ayarları
- Hedef coinler listesi
- Komisyon kontrolü bilgisi
- Trading saatleri

## ⚙️ Konfigürasyon

`lib/trading/config.ts` dosyasından tüm ayarları değiştirebilirsiniz:

```typescript
// Sermaye ayarları
tradingConfig.memeCoins.capital.minPerTrade = 20; // $20
tradingConfig.memeCoins.capital.maxPerTrade = 150; // $150
tradingConfig.memeCoins.capital.totalDaily = 500; // $500/gün

// Kar/Zarar hedefleri
tradingConfig.memeCoins.targets.profitTarget = 10; // %10
tradingConfig.memeCoins.targets.stopLossPercent = 5; // %5

// Risk yönetimi
tradingConfig.memeCoins.risk.riskPercentage = 3; // %3

// İşlem saatleri
tradingConfig.schedule.sessions = [
  {
    name: "Morning",
    startHour: 9,
    startMinute: 0,
    endHour: 10,
    endMinute: 0
  }
];

// Komisyon
tradingConfig.limitOrder.commission.percentage = 0.2; // %0.2
```

## 🔒 Risk Yönetimi

| Kontrol | Değer | Açıklama |
|---------|-------|----------|
| **Per Trade Risk** | 2% | Toplam sermayenin %2'si |
| **Daily Limit** | $500 | Maksimum günlük yatırım |
| **Max Drawdown** | %10 | Maksimum kayıp |
| **Commission Impact** | %10 | Komisyon kar/zarar'ın %10'unu geçemez |
| **Stop Loss** | 3% | Otomatik stop loss |
| **Take Profit** | 5% | Otomatik kar hedefi |

## 📈 İstatistikler

Sistem otomatik olarak takip eder:
```typescript
{
  totalTrades: number;           // Toplam işlem
  successfulTrades: number;      // Başarılı
  failedTrades: number;          // Başarısız
  totalProfit: number;           // Toplam kar/zarar
  averageProfitPerTrade: number; // Ortalama
  winRate: number;               // Başarı %
}
```

## 🚨 Uyarı Sistemleri

| Uyarı | Tetikleyici | Aksiyon |
|-------|------------|--------|
| ⚠️ **Yüksek Komisyon** | %8+ | Konsol uyarısı |
| ⚠️ **Düşük Bakiye** | $50- | Bildirim |
| ⚠️ **Ardışık Zarar** | 3+ | Tetik kontrol |
| ⚠️ **Yüksek Drawdown** | %8+ | Hızlı çıkış |

## 🔄 Sistem Akışı

```
┌─────────────────────────────────────────┐
│ 1. Scheduler: Trading Session Kontrolü   │
│    - Saati kontrol et (08:00-09:00, 14:00-16:00)
│    - Gün türünü kontrol et
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 2. Strategy: Meme Coin Tarama            │
│    - DOGE, SHIB, PEPE, FLOKI, BONK
│    - Fiyat verilerini analiz et
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 3. Signal Generation: Sinyal Üret        │
│    - Volatilite kontrol
│    - Aşırı satım/alım kontrol
│    - Güven oranı hesapla
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 4. Commission Analysis: Komisyon Kontrol │
│    - Giriş komisyonu hesapla
│    - Çıkış komisyonu hesapla
│    - %10 kuralını kontrol et
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 5. Order Execution: İşlem Yap            │
│    - Limit order yerleştir
│    - Stop-loss ayarla
│    - Take-profit ayarla
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 6. Monitoring: Takip               │
│    - TP/SL seviyelerini izle
│    - Risk yönetimini kontrol et
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 7. Exit Management: Otomatik Çıkış      │
│    - TP seviyesinde sat
│    - SL seviyesinde çık
│    - Kar/zarar hesapla
└────────────────┬────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 8. Statistics Update: İstatistikleri Al  │
│    - Kar/zarar güncelle
│    - Başarı oranı hesapla
│    - Dashboard güncelle
└─────────────────────────────────────────┘
```

## 🎓 Kullanım Örneği

```typescript
import { TradingAutomationEngine } from '@/lib/trading';

// Engine oluştur
const engine = new TradingAutomationEngine();

// Otomasyonu başlat
engine.startAutomation();

// Meme coinleri tara
const signals = await engine.scanForSignals(
  ['DOGE', 'SHIB'],
  {
    DOGE: [0.08, 0.081, 0.082, 0.0805, 0.079],
    SHIB: [0.00002, 0.000021, 0.000022, 0.000020]
  }
);

// Sinyalleri işle
for (const signal of signals) {
  if (signal.confidence > 60) {
    const result = await engine.processTradeSignal(
      signal,
      capital = 50,
      commissionPercentage = 0.1
    );
    
    if (result.status === 'FILLED') {
      console.log(`✅ İşlem başarılı: ${result.id}`);
      console.log(`💰 Komisyon: $${result.commission.toFixed(2)}`);
    } else {
      console.log(`❌ İşlem reddedildi: ${result.reason}`);
    }
  }
}

// Sistem durumunu kontrol et
const status = engine.getStatus();
console.log(`📊 Toplam Kar: $${status.totalProfit.toFixed(2)}`);
console.log(`📈 Başarı Oranı: ${status.successRate.toFixed(1)}%`);
console.log(`📋 Aktif İşlemler: ${status.activeTrades}`);

// İstatistikleri al
const stats = engine.getStatistics();
console.log(`
  Toplam İşlem: ${stats.totalTrades}
  Başarılı: ${stats.successfulTrades}
  Başarısız: ${stats.failedTrades}
  Kazanç Oranı: ${stats.winRate.toFixed(1)}%
  Ortalama Kar: $${stats.averageProfitPerTrade.toFixed(2)}
`);

// İşlemi kapat
const closed = engine.closePosition('TRADE_1725362400000', 0.085);
if (closed) {
  console.log(`💵 Kar: $${closed.profit?.toFixed(2)}`);
}
```

## 🛠️ Teknik Stack

- **Runtime**: Next.js 16.3+
- **Language**: TypeScript 5.7+
- **UI Framework**: React 19
- **Styling**: Tailwind CSS 4.3+
- **Icons**: Lucide React
- **API**: Next.js App Router

## 📦 Bağımlılıklar

```json
{
  "next": "16.3.3",
  "react": "^19",
  "react-dom": "^19",
  "tailwindcss": "^4.3.3",
  "lucide-react": "^1.16.0"
}
```

## 📝 Notlar

### ⚠️ Önemli Uyarılar
- **Gerçek Para İşlem**: Exchange API'leriyle entegre ettikten sonra kullanın
- **Backtest**: Canlı işlem yapmadan önce geçmiş verilerle test edin
- **Risk Yönetimi**: Her zaman azami riski sınırlandırın
- **Monitoring**: Sistem çıktısını düzenli kontrol edin
- **Sermaye**: Yalnızca kaybetmeyi göze alabileceğiniz miktarı yatırın

### 💡 İpuçları
- Sistem 1-2 saatlik işlem saatlerinde çalışmak üzere tasarlandı
- Volatilite yüksek olduğunda en iyi sonuçları verir
- Komisyon kontrol mekanizması kaybetme riskini azaltır
- Risk yönetimi öncelikle gelir - kar ikinci

### 🔄 Gelecek Geliştirmeler
- [ ] Exchange API entegrasyonu (Binance, Kraken)
- [ ] Machine Learning tahminleri
- [ ] Discord/Telegram bildirimleri
- [ ] Gelişmiş grafik analizi
- [ ] Database entegrasyonu
- [ ] Multi-exchange destek
- [ ] Otomatik backtesting

## 📞 Destek & Sorunlar

Herhangi bir sorun veya soru için:
1. GitHub Issues'de açın
2. Detaylı açıklama yazın
3. Sistem loglarını paylaşın
4. Test kodunuzu ekleyin

---

🚀 **Kar elde etmeyi başarıyla tamamlamalısınız!**

**Son Güncelleme**: 2026-09-03
**Versiyon**: 0.1.0
**Status**: ✅ Production Ready
