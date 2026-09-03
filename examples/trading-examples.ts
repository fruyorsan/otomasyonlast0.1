/**
 * Trading System Initialization Example
 * Sistem başlatma ve kullanım örneği
 */

import { TradingAutomationEngine } from "@/lib/trading/automationEngine";
import { TradingScheduler } from "@/lib/trading/tradingScheduler";
import { MemeCoinsStrategy } from "@/lib/trading/memeCoinsStrategy";
import { LimitOrderManager } from "@/lib/trading/limitOrderManager";
import { tradingConfig, validateConfig } from "@/lib/trading/config";

/**
 * Örnek 1: Temel Sistem Başlatma
 */
export async function example1_basicInitialization() {
  console.log("📚 Örnek 1: Temel Sistem Başlatma\n");

  // Konfigürasyonu doğrula
  const validation = validateConfig();
  if (!validation.valid) {
    console.error("❌ Konfigürasyon hataları:", validation.errors);
    return;
  }

  // Engine oluştur
  const engine = new TradingAutomationEngine();

  // Sistem durumunu kontrol et
  const status = engine.getStatus();
  console.log("✅ Sistem Başlatıldı");
  console.log("Status:", status);
  console.log("");
}

/**
 * Örnek 2: Trading Session Kontrolü
 */
export async function example2_tradingScheduler() {
  console.log("📚 Örnek 2: Trading Session Kontrolü\n");

  const scheduler = new TradingScheduler();

  // Aktif session'ı kontrol et
  if (scheduler.isInTradingSession()) {
    const currentSession = scheduler.getCurrentSession();
    console.log("✅ Trading Session Aktif!");
    console.log("Session:", currentSession?.name);
  } else {
    const timeLeft = scheduler.getTimeUntilNextSession();
    console.log(`⏱️ Trading Session Dışında`);
    console.log(`Sonraki session'a ${timeLeft} dakika kaldı`);
  }

  // Bugünün tüm session'larını listele
  const todaySessions = scheduler.getTodaySessions();
  console.log("\n📋 Bugünün Session'ları:");
  todaySessions.forEach((session) => {
    console.log(
      `  - ${session.name}: ${session.startHour}:${String(session.startMinute).padStart(2, "0")} - ${session.endHour}:${String(session.endMinute).padStart(2, "0")}`
    );
  });
  console.log("");
}

/**
 * Örnek 3: Meme Coin Stratejisi
 */
export async function example3_memeCoinsStrategy() {
  console.log("📚 Örnek 3: Meme Coin Stratejisi\n");

  const strategy = new MemeCoinsStrategy();

  // Günlük işlem oturumunu başlat
  const session = strategy.startDailyTradingSession(100); // $100 sermaye

  console.log("💼 Günlük İşlem Oturumu:");
  console.log(`  Maksimum İşlem: ${session.maxTrades}`);
  console.log(`  Risk Per Trade: $${session.riskPerTrade.toFixed(2)}`);
  console.log("\n📝 Öneriler:");
  session.recommendations.forEach((rec) => console.log(`  ${rec}`));

  // Meme coin sinyali üret
  console.log("\n🎯 DOGE İçin Sinyal Analizi:");
  const prices = [0.08, 0.081, 0.082, 0.0805, 0.079]; // Son 5 fiyat
  const signal = await strategy.generateTradeSignal("DOGE", 0.079, prices);

  if (signal) {
    console.log(`  Action: ${signal.action}`);
    console.log(`  Strength: ${signal.strength.toFixed(1)}%`);
    console.log(`  Confidence: ${signal.confidence.toFixed(1)}%`);
    console.log(`  Reason: ${signal.reason}`);
  } else {
    console.log("  Sinyal yok (koşullar sağlanmıyor)");
  }

  console.log("");
}

/**
 * Örnek 4: Limit Order & Komisyon Kontrolü
 */
export async function example4_limitOrderCommission() {
  console.log("📚 Örnek 4: Limit Order & Komisyon Kontrolü\n");

  const limitOrderManager = new LimitOrderManager();

  // İşlem konfigürasyonu
  const tradeConfig = {
    symbol: "DOGE",
    entryPrice: 0.08,
    quantity: 100,
    stopLossPrice: 0.076, // %3 stop loss
    takeProfitPrice: 0.084, // %5 profit
    commissionPercentage: 0.1,
  };

  console.log("📊 İşlem Parametreleri:");
  console.log(`  Symbol: ${tradeConfig.symbol}`);
  console.log(`  Entry: $${tradeConfig.entryPrice}`);
  console.log(`  Quantity: ${tradeConfig.quantity}`);
  console.log(`  Stop Loss: $${tradeConfig.stopLossPrice}`);
  console.log(`  Take Profit: $${tradeConfig.takeProfitPrice}`);

  // Trade analiz
  const analysis = limitOrderManager.analyzeTrade(tradeConfig);

  console.log("\n💡 Analiz Sonuçları:");
  console.log(`  Geçerli: ${analysis.isValid ? "✅" : "❌"}`);
  console.log(`  Max Komisyon: $${analysis.maxCommission.toFixed(2)}`);
  console.log(`  Kar Hedefi: $${analysis.profitTarget.toFixed(2)}`);
  console.log(`  Zarar Hedefi: $${analysis.lossTarget.toFixed(2)}`);
  console.log(`  Komisyon Etkisi: ${analysis.commissionImpactPercent.toFixed(2)}%`);
  console.log(`  İşlem Yapılsın mı: ${analysis.shouldTrade ? "✅ EVET" : "❌ HAYIR"}`);

  if (!analysis.shouldTrade) {
    console.log(`  Sebep: ${analysis.reason}`);
  }

  console.log("");
}

/**
 * Örnek 5: Otomasyonu Başlat ve İşlem Yap
 */
export async function example5_automationExecution() {
  console.log("📚 Örnek 5: Otomasyonu Başlat ve İşlem Yap\n");

  const engine = new TradingAutomationEngine();

  // Otomasyonu başlat
  console.log("🚀 Otomasyon başlatılıyor...");
  const started = engine.startAutomation();

  if (!started) {
    console.log("⏱️ Trading session dışında - demo modunda devam ediyoruz\n");
  } else {
    console.log("✅ Otomasyon başlatıldı\n");
  }

  // Simulasyon: Meme coin sinyalleri
  const signals = [
    {
      symbol: "DOGE",
      action: "BUY" as const,
      strength: 65,
      reason: "Aşırı satım: -4.5%, Volatilite: 3.2%",
      confidence: 72,
    },
    {
      symbol: "SHIB",
      action: "BUY" as const,
      strength: 45,
      reason: "Zayıf sinyal",
      confidence: 35,
    },
  ];

  console.log("📊 Bulunan Sinyaller:");
  for (const signal of signals) {
    console.log(`\n  ${signal.symbol} - ${signal.action}`);
    console.log(`    Güven: ${signal.confidence.toFixed(1)}%`);
    console.log(`    Gücü: ${signal.strength.toFixed(1)}%`);

    // İşlemi işle
    const result = await engine.processTradeSignal(signal, 50, 0.1);

    if (result.status === "PENDING") {
      console.log(`    ✅ İşlem oluşturuldu: ${result.id}`);
      console.log(`    💰 Komisyon: $${result.commission.toFixed(2)}`);
    } else if (result.status === "REJECTED") {
      console.log(`    ❌ İşlem reddedildi`);
      console.log(`    Sebep: ${result.reason}`);
    }
  }

  // Sistem durumunu göster
  console.log("\n📈 Sistem Durumu:");
  const status = engine.getStatus();
  console.log(`  Çalışıyor: ${status.isRunning ? "✅" : "❌"}`);
  console.log(`  Aktif İşlemler: ${status.activeTrades}`);
  console.log(`  Toplam Kar: $${status.totalProfit.toFixed(2)}`);

  // İstatistikleri göster
  console.log("\n📊 İstatistikler:");
  const stats = engine.getStatistics();
  console.log(`  Toplam İşlem: ${stats.totalTrades}`);
  console.log(`  Başarılı: ${stats.successfulTrades}`);
  console.log(`  Başarısız: ${stats.failedTrades}`);
  console.log(`  Kazanç Oranı: ${stats.winRate.toFixed(1)}%`);
  console.log(`  Ortalama Kar: $${stats.averageProfitPerTrade.toFixed(2)}`);

  console.log("");
}

/**
 * Örnek 6: İşlem Kapanışı
 */
export async function example6_closePosition() {
  console.log("📚 Örnek 6: İşlem Kapanışı\n");

  const engine = new TradingAutomationEngine();

  // Simulasyon: İşlem oluştur
  const signal = {
    symbol: "PEPE",
    action: "BUY" as const,
    strength: 70,
    reason: "Aşırı satım sinyali",
    confidence: 75,
  };

  const result = await engine.processTradeSignal(signal, 50, 0.1);

  if (result.status === "PENDING") {
    console.log(`✅ İşlem oluşturuldu: ${result.id}`);
    console.log(`  Entry: $${result.entryPrice}`);
    console.log(`  Quantity: ${result.quantity}`);

    // İşlemi kapat (simüle)
    console.log("\n📌 İşlemi kapatıyoruz...");
    const closed = engine.closePosition(result.id, result.entryPrice * 1.05); // %5 kar

    if (closed) {
      console.log(`✅ İşlem kapatıldı!`);
      console.log(`  Kar: $${closed.profit?.toFixed(2)}`);
      console.log(`  Kar %: ${closed.profitPercent?.toFixed(2)}%`);
      console.log(`  Komisyon: $${closed.commission.toFixed(2)}`);
    }
  }

  console.log("");
}

/**
 * Örnek 7: İstatistikleri Görüntüle
 */
export async function example7_viewStatistics() {
  console.log("📚 Örnek 7: İstatistikleri Görüntüle\n");

  const engine = new TradingAutomationEngine();

  // Birkaç işlem simulasyonu
  const mockTrades = [
    { symbol: "DOGE", entryPrice: 0.08, exitPrice: 0.084, quantity: 100 },
    { symbol: "SHIB", entryPrice: 0.00002, exitPrice: 0.000019, quantity: 500000 },
    { symbol: "PEPE", entryPrice: 0.00001, exitPrice: 0.000011, quantity: 1000000 },
  ];

  console.log("📊 Detaylı İstatistikler:\n");

  const stats = engine.getStatistics();

  const statsDisplay = [
    { label: "Toplam İşlem", value: stats.totalTrades },
    { label: "Başarılı İşlem", value: stats.successfulTrades },
    { label: "Başarısız İşlem", value: stats.failedTrades },
    { label: "Toplam Kar/Zarar", value: `$${stats.totalProfit.toFixed(2)}` },
    {
      label: "Ortalama Kar Per İşlem",
      value: `$${stats.averageProfitPerTrade.toFixed(2)}`,
    },
    { label: "Kazanç Oranı", value: `${stats.winRate.toFixed(1)}%` },
  ];

  statsDisplay.forEach((stat) => {
    console.log(`  📌 ${stat.label}: ${stat.value}`);
  });

  console.log("");
}

/**
 * Tüm Örnekleri Çalıştır
 */
export async function runAllExamples() {
  console.log("══════════════════════════════════════════════════��════════");
  console.log("🚀 TRADING OTOMASYONU SISTEM ÖRNEKLERİ");
  console.log("═══════════════════════════════════════════════════════════\n");

  try {
    await example1_basicInitialization();
    await example2_tradingScheduler();
    await example3_memeCoinsStrategy();
    await example4_limitOrderCommission();
    await example5_automationExecution();
    await example6_closePosition();
    await example7_viewStatistics();

    console.log("═══════════════════════════════════════════════════════════");
    console.log("✅ TÜM ÖRNEKLER BAŞARIYLA TAMAMLANDI");
    console.log("═══════════════════════════════════════════════════════════");
  } catch (error) {
    console.error("❌ Hata:", error);
  }
}

// Eğer direkt olarak çalıştırılırsa
if (require.main === module) {
  runAllExamples();
}
