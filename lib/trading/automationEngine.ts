/**
 * Trading Automation Engine
 * Tüm trading sistemlerini koordine eden ana motor
 */

import { LimitOrderManager, TradeConfig } from "./limitOrderManager";
import { TradingScheduler, TradingSession } from "./tradingScheduler";
import { MemeCoinsStrategy, TradeSignal } from "./memeCoinsStrategy";

export interface AutomationStatus {
  isRunning: boolean;
  currentSession: TradingSession | null;
  timeUntilNextSession: number;
  activeTrades: number;
  totalProfit: number;
  successRate: number;
}

export interface TradeResult {
  id: string;
  symbol: string;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  status: "PENDING" | "FILLED" | "CLOSED" | "REJECTED";
  profit?: number;
  profitPercent?: number;
  commission: number;
  timestamp: Date;
  reason?: string;
}

export class TradingAutomationEngine {
  private limitOrderManager: LimitOrderManager;
  private tradingScheduler: TradingScheduler;
  private memeCoinsStrategy: MemeCoinsStrategy;
  private tradeHistory: TradeResult[] = [];
  private isRunning: boolean = false;

  constructor() {
    this.limitOrderManager = new LimitOrderManager();
    this.tradingScheduler = new TradingScheduler({
      sessions: [
        {
          name: "Morning Session (1 saat)",
          startHour: 8,
          startMinute: 0,
          endHour: 9,
          endMinute: 0,
          durationMinutes: 60,
          isActive: true,
        },
        {
          name: "Afternoon Session (2 saat)",
          startHour: 14,
          startMinute: 0,
          endHour: 16,
          endMinute: 0,
          durationMinutes: 120,
          isActive: true,
        },
      ],
    });
    this.memeCoinsStrategy = new MemeCoinsStrategy({
      minCapital: 10,
      maxCapital: 100,
      riskPercentage: 2,
      profitTarget: 5,
      stopLossPercent: 3,
    });
  }

  /**
   * Otomasyon başlat
   */
  public startAutomation(): boolean {
    if (this.tradingScheduler.isInTradingSession()) {
      this.isRunning = true;
      console.log("✅ Otomasyon başlatıldı");
      return true;
    } else {
      console.log(
        `⏱️ Trading session dışında. Sonraki session'a ${this.tradingScheduler.getTimeUntilNextSession()} dakika kaldı`
      );
      return false;
    }
  }

  /**
   * Otomasyon durdur
   */
  public stopAutomation(): void {
    this.isRunning = false;
    console.log("⛔ Otomasyon durduruldu");
  }

  /**
   * Sistem durumunu kontrol et
   */
  public getStatus(): AutomationStatus {
    const activeTrades = this.tradeHistory.filter(
      (t) => t.status === "PENDING" || t.status === "FILLED"
    ).length;

    const closedTrades = this.tradeHistory.filter((t) => t.status === "CLOSED");
    const successfulTrades = closedTrades.filter(
      (t) => (t.profit || 0) > 0
    ).length;
    const successRate =
      closedTrades.length > 0
        ? (successfulTrades / closedTrades.length) * 100
        : 0;

    const totalProfit = this.tradeHistory.reduce((sum, trade) => {
      return sum + (trade.profit || 0);
    }, 0);

    return {
      isRunning: this.isRunning,
      currentSession: this.tradingScheduler.getCurrentSession(),
      timeUntilNextSession: this.tradingScheduler.getTimeUntilNextSession(),
      activeTrades,
      totalProfit,
      successRate,
    };
  }

  /**
   * İşlem sinyalini işle ve limit order yerleştir
   */
  public async processTradeSignal(
    signal: TradeSignal,
    capital: number,
    commissionPercentage: number = 0.1
  ): Promise<TradeResult> {
    const tradeId = `TRADE_${Date.now()}`;

    try {
      // Trading session kontrolü
      if (!this.isRunning && !this.tradingScheduler.isInTradingSession()) {
        throw new Error("Trading session dışında işlem yapılamaz");
      }

      // İşlem sinyali güç kontrolü
      if (signal.strength < 30) {
        throw new Error(`Sinyal gücü yetersiz: ${signal.strength}%`);
      }

      // İşlem boyutunu hesapla
      const tradeSize = this.memeCoinsStrategy.calculateTradeSize(
        capital,
        signal.confidence
      );

      // Risk/Reward hesapla
      const riskReward = this.memeCoinsStrategy.calculateRiskReward(
        signal.confidence,
        tradeSize.quantity,
        tradeSize.riskAmount
      );

      // Limit order konfigürasyonu
      const orderConfig: TradeConfig = {
        symbol: signal.symbol,
        entryPrice: signal.confidence,
        quantity: tradeSize.quantity,
        stopLossPrice: riskReward.stopLossPrice,
        takeProfitPrice: riskReward.takeProfitPrice,
        commissionPercentage,
      };

      // Trade analiz ve validasyon
      const analysis = this.limitOrderManager.analyzeTrade(orderConfig);

      if (!analysis.shouldTrade) {
        throw new Error(
          analysis.reason ||
            "Trade şartları sağlanmıyor"
        );
      }

      // İşlemi kaydet
      const result: TradeResult = {
        id: tradeId,
        symbol: signal.symbol,
        entryPrice: signal.confidence,
        quantity: tradeSize.quantity,
        status: "PENDING",
        commission: analysis.maxCommission,
        timestamp: new Date(),
        reason: `Sinyal: ${signal.reason}, Güven: ${signal.confidence.toFixed(2)}%`,
      };

      this.tradeHistory.push(result);

      console.log(`✅ İşlem ${tradeId} oluşturuldu:`, {
        symbol: signal.symbol,
        quantity: tradeSize.quantity,
        entryPrice: signal.confidence,
        stopLoss: riskReward.stopLossPrice,
        takeProfit: riskReward.takeProfitPrice,
        riskReward: riskReward.riskRewardRatio.toFixed(2),
        commissionImpact: analysis.commissionImpactPercent.toFixed(2) + "%",
      });

      return result;
    } catch (error) {
      const result: TradeResult = {
        id: tradeId,
        symbol: signal.symbol,
        entryPrice: 0,
        quantity: 0,
        status: "REJECTED",
        commission: 0,
        timestamp: new Date(),
        reason: `Hata: ${error}`,
      };

      this.tradeHistory.push(result);
      console.error(`❌ İşlem reddedildi: ${error}`);

      return result;
    }
  }

  /**
   * İşlem kapanışını işle
   */
  public closePosition(
    tradeId: string,
    exitPrice: number
  ): TradeResult | null {
    const trade = this.tradeHistory.find((t) => t.id === tradeId);

    if (!trade) return null;

    const profit = (exitPrice - trade.entryPrice) * trade.quantity - trade.commission;
    const profitPercent = ((exitPrice - trade.entryPrice) / trade.entryPrice) * 100;

    trade.exitPrice = exitPrice;
    trade.profit = profit;
    trade.profitPercent = profitPercent;
    trade.status = "CLOSED";

    console.log(`📊 İşlem kapatıldı ${tradeId}:`, {
      profit: profit.toFixed(2),
      profitPercent: profitPercent.toFixed(2) + "%",
    });

    return trade;
  }

  /**
   * İşlem geçmişini al
   */
  public getTradeHistory(
    limit: number = 50
  ): TradeResult[] {
    return this.tradeHistory.slice(-limit);
  }

  /**
   * İstatistikleri al
   */
  public getStatistics(): {
    totalTrades: number;
    successfulTrades: number;
    failedTrades: number;
    totalProfit: number;
    averageProfitPerTrade: number;
    winRate: number;
  } {
    const totalTrades = this.tradeHistory.length;
    const closedTrades = this.tradeHistory.filter((t) => t.status === "CLOSED");
    const successfulTrades = closedTrades.filter((t) => (t.profit || 0) > 0).length;
    const failedTrades = closedTrades.filter((t) => (t.profit || 0) < 0).length;
    const totalProfit = this.tradeHistory.reduce(
      (sum, trade) => sum + (trade.profit || 0),
      0
    );
    const averageProfitPerTrade =
      closedTrades.length > 0 ? totalProfit / closedTrades.length : 0;
    const winRate =
      closedTrades.length > 0 ? (successfulTrades / closedTrades.length) * 100 : 0;

    return {
      totalTrades,
      successfulTrades,
      failedTrades,
      totalProfit,
      averageProfitPerTrade,
      winRate,
    };
  }

  /**
   * Stratejileri kontrol et ve sinyaller üret
   */
  public async scanForSignals(
    symbols: string[],
    priceData: Record<string, number[]>
  ): Promise<TradeSignal[]> {
    const signals: TradeSignal[] = [];

    for (const symbol of symbols) {
      const prices = priceData[symbol];
      if (!prices || prices.length === 0) continue;

      const currentPrice = prices[prices.length - 1];
      const signal = await this.memeCoinsStrategy.generateTradeSignal(
        symbol,
        currentPrice,
        prices
      );

      if (signal && signal.confidence > 50) {
        signals.push(signal);
      }
    }

    return signals;
  }
}
