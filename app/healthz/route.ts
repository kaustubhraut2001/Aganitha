import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
    try {
        // Test database connection
        await prisma.$queryRaw`SELECT 1`;

        return NextResponse.json({
            ok: true,
            version: '1.0',
            uptime: process.uptime(),
            database: 'connected'
        });
    } catch (error) {
        return NextResponse.json({
            ok: false,
            version: '1.0',
            uptime: process.uptime(),
            database: 'disconnected'
        }, { status: 500 });
    }
}
