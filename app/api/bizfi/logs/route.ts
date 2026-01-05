import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        status: 'active',
        message: 'Log ingestion endpoint ready. Send POST requests with { level, message, context } to log to server console.'
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { level, message, context, user, stack } = body;

        const timestamp = new Date().toISOString();
        const logData = {
            timestamp,
            level: level || 'error',
            user: user || 'anonymous',
            context: context || 'unknown',
            message,
            stack
        };

        // Format for server console
        const prefix = `[Client Log - ${logData.level.toUpperCase()}]`;
        const consoleMsg = `${prefix} ${timestamp} | User: ${logData.user} | Context: ${logData.context}\nError: ${message}\nStack: ${stack || 'No stack trace'}\n----------------------------------------`;

        if (level === 'error') {
            console.error(consoleMsg);
        } else if (level === 'warn') {
            console.warn(consoleMsg);
        } else {
            console.log(consoleMsg);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        // Fallback if logging itself fails
        console.error("Failed to process client log:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
