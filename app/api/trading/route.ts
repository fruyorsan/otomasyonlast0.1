/**
 * Next.js API Routes for Trading System
 * app/api/trading/*
 */

import { getTradingStatus, startTrading, stopTrading, executeTrade, closePosition, getTradeHistory, getTradingStatistics, scanMemeCoinSignals, getStrategyConfig } from "@/lib/trading/api";

// GET /api/trading/status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  switch (action) {
    case "status":
      return Response.json(await getTradingStatus());
    case "history":
      const limit = parseInt(searchParams.get("limit") || "50");
      return Response.json(await getTradeHistory(limit));
    case "statistics":
      return Response.json(await getTradingStatistics());
    case "config":
      return Response.json(await getStrategyConfig());
    default:
      return Response.json(await getTradingStatus());
  }
}

// POST /api/trading
export async function POST(request: Request) {
  const body = await request.json();
  const { action, ...params } = body;

  switch (action) {
    case "start":
      return Response.json(await startTrading());
    
    case "stop":
      return Response.json(await stopTrading());
    
    case "execute":
      return Response.json(
        await executeTrade(
          params.symbol,
          params.action,
          params.confidence,
          params.capital,
          params.commissionPercentage
        )
      );
    
    case "close":
      return Response.json(
        await closePosition(params.tradeId, params.exitPrice)
      );
    
    case "scan":
      return Response.json(
        await scanMemeCoinSignals(params.priceData)
      );
    
    default:
      return Response.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
  }
}
