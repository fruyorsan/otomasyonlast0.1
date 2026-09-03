/**
 * Limit Order Manager
 * Kripto ticaret için limit order sistemi
 */

export interface TradeConfig {
  symbol: string;
  entryPrice: number;
  quantity: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  commissionPercentage: number;
}

export interface TradeAnalysis {
  isValid: boolean;
  reason?: string;
  maxCommission: number;
  profitTarget: number;
  lossTarget: number;
  commissionImpactPercent: number;
  shouldTrade: boolean;
}

export class LimitOrderManager {
  /**
   * Komisyon tutarını hesapla
   */
  private calculateCommission(
    quantity: number,
    price: number,
    commissionPercentage: number
  ): number {
    return (quantity * price * commissionPercentage) / 100;
  }

  /**
   * Kar/zarar hesaplaması
   */
  private calculateProfitLoss(
    entryPrice: number,
    exitPrice: number,
    quantity: number,
    commission: number
  ): number {
    const grossProfit = (exitPrice - entryPrice) * quantity;
    return grossProfit - commission;
  }

  /**
   * Trade analizi ve validasyonu
   * Komisyon kar/zarar hedefinin %10'unu geçerse işlemi almaz
   */
  public analyzeTrade(config: TradeConfig): TradeAnalysis {
    try {
      // Giriş komisyonu
      const entryCommission = this.calculateCommission(
        config.quantity,
        config.entryPrice,
        config.commissionPercentage
      );

      // Çıkış komisyonları
      const tpCommission = this.calculateCommission(
        config.quantity,
        config.takeProfitPrice,
        config.commissionPercentage
      );

      const slCommission = this.calculateCommission(
        config.quantity,
        config.stopLossPrice,
        config.commissionPercentage
      );

      // Toplam komisyon (giriş + çıkış)
      const totalTPCommission = entryCommission + tpCommission;
      const totalSLCommission = entryCommission + slCommission;

      // Kar/zarar hesaplaması
      const tpProfit = this.calculateProfitLoss(
        config.entryPrice,
        config.takeProfitPrice,
        config.quantity,
        totalTPCommission
      );

      const slLoss = this.calculateProfitLoss(
        config.entryPrice,
        config.stopLossPrice,
        config.quantity,
        totalSLCommission
      );

      // Komisyon kontrol
      const tpCommissionRatio = (totalTPCommission / Math.abs(tpProfit)) * 100;
      const slCommissionRatio = (totalSLCommission / Math.abs(slLoss)) * 100;

      const maxCommissionRatio = Math.max(tpCommissionRatio, slCommissionRatio);

      // Eğer komisyon kar/zarar hedefinin %10'unu geçerse işlemi alma
      const shouldTrade = maxCommissionRatio <= 10;

      return {
        isValid: true,
        maxCommission: Math.max(totalTPCommission, totalSLCommission),
        profitTarget: tpProfit,
        lossTarget: slLoss,
        commissionImpactPercent: maxCommissionRatio,
        shouldTrade,
        reason: !shouldTrade
          ? `Komisyon oranı çok yüksek: %${maxCommissionRatio.toFixed(2)}`
          : undefined,
      };
    } catch (error) {
      return {
        isValid: false,
        reason: `Trade analizi hatası: ${error}`,
        maxCommission: 0,
        profitTarget: 0,
        lossTarget: 0,
        commissionImpactPercent: 0,
        shouldTrade: false,
      };
    }
  }

  /**
   * Limit order yerleştir
   */
  public async placeLimitOrder(config: TradeConfig): Promise<{
    success: boolean;
    orderId?: string;
    analysis: TradeAnalysis;
    message: string;
  }> {
    const analysis = this.analyzeTrade(config);

    if (!analysis.isValid || !analysis.shouldTrade) {
      return {
        success: false,
        analysis,
        message:
          analysis.reason || "Trade şartları sağlanmıyor, işlem yapılmadı",
      };
    }

    try {
      // TODO: Exchange API'sine bağlantı
      // const orderId = await exchange.placeLimitOrder({...});

      return {
        success: true,
        orderId: `ORDER_${Date.now()}`,
        analysis,
        message: `Limit order başarıyla yerleştirildi. Komisyon Etkisi: %${analysis.commissionImpactPercent.toFixed(2)}`,
      };
    } catch (error) {
      return {
        success: false,
        analysis,
        message: `Order yerleştirme hatası: ${error}`,
      };
    }
  }
}
