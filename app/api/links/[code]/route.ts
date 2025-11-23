import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/links/:code - Get stats for a single link
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        const link = await prisma.link.findUnique({
            where: { code },
        });

        if (!link) {
            return NextResponse.json(
                { error: 'Link not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(link);
    } catch (error) {
        console.error('Error fetching link:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/links/:code - Delete a link
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        try {
            await prisma.link.delete({
                where: { code },
            });

            return new NextResponse(null, { status: 204 });
        } catch (error: any) {
            if (error.code === 'P2025') {
                return NextResponse.json(
                    { error: 'Link not found' },
                    { status: 404 }
                );
            }
            throw error;
        }
    } catch (error) {
        console.error('Error deleting link:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
