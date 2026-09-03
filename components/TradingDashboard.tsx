/**
 * Trading Dashboard Component
 * Otomasyon sisteminin kontrol paneli
 */

"use client";

import { useState, useEffect } from "react";
import { Activity, Play, Square, TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";

interface TradingStatus {
  isRunning: boolean;
  currentSession: any;
  timeUntilNextSession: number;
  activeTrades: number;
  totalProfit: number;
  successRate: number;
}

interface TradeStats {
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  totalProfit: number;
  averageProfitPerTrade: number;
  winRate: number;
}

export function TradingDashboard() {
  const [status, setStatus] = useState<TradingStatus | null>(null);
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Her 5 saniyede güncelle
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const [statusRes, statsRes] = await Promise.all([
        fetch("/api/trading?action=status"),
        fetch("/api/trading?action=statistics"),
      ]);

      const statusData = await statusRes.json();
      const statsData = await statsRes.json();

      if (statusData.success) setStatus(statusData.data);
      if (statsData.success) setStats(statsData.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  };

  const handleStartStop = async () => {
    try {
      const action = isRunning ? "stop" : "start";
      const res = await fetch("/api/trading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (data.success) {
        setIsRunning(!isRunning);
        fetchStatus();
      }
    } catch (error) {
      console.error("Failed to toggle trading:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Trading Otomasyonu</h1>
        </div>
        <button
          onClick={handleStartStop}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition ${
            isRunning
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isRunning ? (
            <div className="flex items-center gap-2">
              <Square className="w-5 h-5" />
              Durdur
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Başlat
            </div>
          )}
        </button>
      </div>

      {/* Status Alert */}
      <div
        className={`p-4 rounded-lg flex items-center gap-3 ${
          status?.isRunning
            ? "bg-green-50 border border-green-200"
            : "bg-yellow-50 border border-yellow-200"
        }`}
      >
        <AlertCircle
          className={`w-6 h-6 ${
            status?.isRunning ? "text-green-600" : "text-yellow-600"
          }`}
        />
        <div>
          <p className="font-semibold">
            {status?.isRunning ? "✅ Otomasyon Aktif" : "⏱️ Otomasyon Bekleme Modunda"}
          </p>
          {status?.currentSession ? (
            <p className="text-sm text-gray-600">
              Aktif Session: {status.currentSession.name}
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Sonraki session'a {status?.timeUntilNextSession} dakika kaldı
            </p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Trades */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aktif İşlemler</p>
              <p className="text-3xl font-bold text-blue-600">
                {status?.activeTrades || 0}
              </p>
            </div>
            <Activity className="w-12 h-12 text-blue-100" />
          </div>
        </div>

        {/* Total Profit */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Kar</p>
              <p
                className={`text-3xl font-bold ${
                  (status?.totalProfit || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ${(status?.totalProfit || 0).toFixed(2)}
              </p>
            </div>
            {(status?.totalProfit || 0) >= 0 ? (
              <TrendingUp className="w-12 h-12 text-green-100" />
            ) : (
              <TrendingDown className="w-12 h-12 text-red-100" />
            )}
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Başarı Oranı</p>
              <p className="text-3xl font-bold text-purple-600">
                {(status?.successRate || 0).toFixed(1)}%
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-purple-100" />
          </div>
        </div>

        {/* Win Rate */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kazanç Oranı</p>
              <p className="text-3xl font-bold text-indigo-600">
                {(stats?.winRate || 0).toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-indigo-100" />
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      {stats && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">📊 Detaylı İstatistikler</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Toplam İşlem</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTrades}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Başarılı</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.successfulTrades}
              </p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Başarısız</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.failedTrades}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Ortalama Kar</p>
              <p className="text-2xl font-bold text-blue-600">
                ${stats.averageProfitPerTrade.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-sm">
          <h3 className="font-semibold text-blue-900 mb-3">⚙️ Sistem Ayarları</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>💰 Minimum işlem: <span className="font-semibold">$10</span></li>
            <li>💰 Maksimum işlem: <span className="font-semibold">$100</span></li>
            <li>📈 Risk oranı: <span className="font-semibold">%2</span></li>
            <li>🎯 Kar hedefi: <span className="font-semibold">%5</span></li>
            <li>🛑 Stop loss: <span className="font-semibold">%3</span></li>
            <li>⏰ İşlem saatleri: <span className="font-semibold">08:00-09:00 & 14:00-16:00</span></li>
          </ul>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 shadow-sm">
          <h3 className="font-semibold text-purple-900 mb-3">🎯 Hedef Meme Coinler</h3>
          <div className="flex flex-wrap gap-2">
            {["DOGE", "SHIB", "PEPE", "FLOKI", "BONK"].map((coin) => (
              <span
                key={coin}
                className="px-4 py-2 bg-purple-200 text-purple-900 rounded-full text-sm font-semibold hover:bg-purple-300 transition"
              >
                {coin}
              </span>
            ))}
          </div>
          <p className="text-sm text-purple-800 mt-4">
            💡 Düşük volatilitede işlem yapmaz. Volatilite %2'nin üzerinde olmalı.
          </p>
        </div>
      </div>

      {/* Commission Alert */}
      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
        <p className="text-sm text-orange-900">
          <span className="font-semibold">⚠️ Komisyon Kontrolü:</span> İşleme girmeden önce komisyon hesaplanır. Eğer komisyon kar/zarar hedefinin %10'unu geçerse işlem otomatik olarak yapılmaz.
        </p>
      </div>
    </div>
  );
}
