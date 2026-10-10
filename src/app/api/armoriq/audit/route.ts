import { NextResponse } from 'next/server';
import { armorIQ } from '@/lib/armoriq/client';
import { ARMORIQ_POLICIES } from '@/lib/armoriq/policies';

export async function GET() {
  const auditLogs = armorIQ.getAuditLogs();
  return NextResponse.json({
    status: 'online',
    platformConnected: Boolean(process.env.ARMORIQ_API_KEY),
    activePolicies: ARMORIQ_POLICIES,
    auditLogsCount: auditLogs.length,
    auditLogs
  });
}
