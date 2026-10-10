import { NextResponse } from 'next/server';
import { runViralityBacktest } from '@/lib/virality/backtest';

export async function GET() {
  const report = runViralityBacktest();
  return NextResponse.json(report);
}
