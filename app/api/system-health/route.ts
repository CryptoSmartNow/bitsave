import { NextResponse } from 'next/server';
import os from 'os';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cpus = os.cpus();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const loadAvg = os.loadavg(); // [1, 5, 15] min averages
    const uptime = os.uptime();

    // Calculate CPU usage (rough estimate based on load average vs core count)
    // In a real monitoring system, you'd compare ticks, but for a simple dashboard:
    const cpuCount = cpus.length;
    const loadPercentage = Math.min(100, Math.round((loadAvg[0] / cpuCount) * 100));

    const memoryUsage = Math.round(((totalMem - freeMem) / totalMem) * 100);

    let status = 'Operational';
    if (loadPercentage > 80 || memoryUsage > 90) {
      status = 'High Load';
    }
    if (loadPercentage > 95 || memoryUsage > 98) {
      status = 'Critical';
    }

    return NextResponse.json({
      status,
      cpu: {
        usage: loadPercentage,
        count: cpuCount,
        model: cpus[0]?.model || 'Unknown'
      },
      memory: {
        usage: memoryUsage,
        total: totalMem,
        free: freeMem
      },
      uptime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('System health check failed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system metrics' },
      { status: 500 }
    );
  }
}
