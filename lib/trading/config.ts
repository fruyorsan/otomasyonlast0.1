/**
 * Trading Configuration
 * Tüm trading sisteminin konfigürasyonu
 */

export const tradingConfig = {
  // Sistem ayarları
  system: {
    enabled: true,
    autoMode: true,
    logLevel: "info", // 'debug' | 'info' | 'warn' | 'error'
  },

  // İşlem saatleri
  schedule: {
    timezone: "UTC",
    enableWeekends: true,
    sessions: [
      {
        name: "Morning Session (1 saat)",
        startHour: 8,
        startMinute: 0,
        endHour: 9,
        endMinute: 0,
      },
      {
        name: "Afternoon Session (2 saat)",
        startHour: 14,
        startMinute: 0,
        endHour: 16,
        endMinute: 0,
      },
    ],
    excludeDays: [], // 0: Sunday, 6: Saturday
  },

  // Meme coin stratejisi
  memeCoins: {
    targetCoins: ["DOGE", "SHIB", "PEPE", "FLOKI", "BONK"],
    
    // Sermaye yönetimi
    capital: {
      minPerTrade: 10, // $10
      maxPerTrade: 100, // $100
      totalDaily: 500, // Günlük toplam
    },

    // Risk yönetimi
    risk: {
      riskPercentage: 2, // Toplam sermayenin %2'si risk
      leverage: 1, // Başlangıçta 1x
      maxDrawdown: 10, // %10 maksimum drawdown
    },

    // Kar/Zarar hedefleri
    targets: {
      profitTarget: 5, // %5 kar hedefi
      stopLossPercent: 3, // %3 stop loss
      breakEvenPercent: 0.5, // %0.5 break even seviyesi
    },

    // Volatilite analizi
    volatility: {
      minVolatility: 2, // Minimum %2 volatilite
      maxVolatility: 50, // Maksimum %50 volatilite
      analysisWindow: 20, // Son 20 fiyat için analiz
    },

    // İşlem sinyalleri
    signals: {
      minSignalStrength: 30, // Minimum %30 sinyal gücü
      minConfidence: 50, // Minimum %50 güven
      overboughtThreshold: 5, // %5 üzerinde aşırı alım
      oversoldThreshold: -5, // -%5 altında aşırı satım
    },
  },

  // Limit order ayarları
  limitOrder: {
    commission: {
      percentage: 0.1, // %0.1 komisyon
      maxImpactPercent: 10, // Komisyon kar/zarar'ın %10'unu geçemez
    },
    
    // Order ayarları
    orders: {
      timeout: 300, // 5 dakika timeout
      retryCount: 3,
      retryDelay: 1000, // 1 saniye
    },
  },

  // Bildirim ayarları
  notifications: {
    enabled: true,
    channels: {
      console: true,
      webhook: false,
      email: false,
    },
    
    events: {
      tradeOpened: true,
      tradeClosed: true,
      stopLossHit: true,
      takeProfitHit: true,
      sessionStart: true,
      sessionEnd: true,
      error: true,
    },
  },

  // Veri saklama
  storage: {
    keepTradeHistory: 90, // 90 gün
    maxStoredTrades: 1000,
    autoBackup: true,
    backupInterval: 3600000, // 1 saat
  },

  // API ayarları
  api: {
    baseUrl: "http://localhost:3000",
    timeout: 10000,
    retryAttempts: 3,
    rateLimit: {
      enabled: true,
      requestsPerMinute: 60,
    },
  },

  // Loglar ve debug
  logging: {
    enabled: true,
    level: "info",
    format: "json",
    maxFileSize: 10485760, // 10MB
    maxFiles: 5,
    directory: "./logs",
  },

  // Uyarılar
  alerts: {
    highCommission: {
      enabled: true,
      threshold: 8, // %8 üzerinde uyar
    },
    lowBalance: {
      enabled: true,
      threshold: 50, // $50 altında uyar
    },
    consecutiveLosses: {
      enabled: true,
      threshold: 3, // 3 ardışık zarar
    },
    highDrawdown: {
      enabled: true,
      threshold: 8, // %8 drawdown
    },
  },
};

export type TradingConfigType = typeof tradingConfig;

/**
 * Konfigürasyonı doğrula
 */
export function validateConfig(): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Sermaye doğrulama
  if (tradingConfig.memeCoins.capital.minPerTrade > tradingConfig.memeCoins.capital.maxPerTrade) {
    errors.push("Min sermaye max sermayeden büyük olamaz");
  }

  // Risk doğrulama
  if (tradingConfig.memeCoins.risk.riskPercentage > 100) {
    errors.push("Risk yüzdesi 100'ü geçemez");
  }

  // Volatilite doğrulama
  if (tradingConfig.memeCoins.volatility.minVolatility > tradingConfig.memeCoins.volatility.maxVolatility) {
    errors.push("Min volatilite max volatiliteden büyük olamaz");
  }

  // Target doğrulama
  if (tradingConfig.memeCoins.targets.profitTarget <= 0) {
    errors.push("Kar hedefi 0'dan büyük olmalı");
  }

  if (tradingConfig.memeCoins.targets.stopLossPercent <= 0) {
    errors.push("Stop loss 0'dan büyük olmalı");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Belirli config değerini güncelle
 */
export function updateConfig(path: string, value: any): void {
  const keys = path.split(".");
  let current = tradingConfig as any;

  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) {
      throw new Error(`Config path not found: ${path}`);
    }
    current = current[keys[i]];
  }

  current[keys[keys.length - 1]] = value;
}

/**
 * Config'i sıfırla
 */
export function resetConfig(): void {
  // TODO: Default config'i yükle
  console.log("Config sıfırlandı");
}
