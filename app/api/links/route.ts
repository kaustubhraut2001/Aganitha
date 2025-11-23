import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isValidUrl, isValidCode, generateRandomCode } from '@/lib/validation';

// POST /api/links - Create a new short link
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { targetUrl, customCode } = body;

        // Validate target URL
        if (!targetUrl || !isValidUrl(targetUrl)) {
            return NextResponse.json(
                { error: 'Invalid URL. Must be a valid HTTP or HTTPS URL.' },
                { status: 400 }
            );
        }

        // Generate or validate custom code
        let code = customCode;
        if (code) {
            // Validate custom code format
            if (!isValidCode(code)) {
                return NextResponse.json(
                    { error: 'Invalid code format. Must be 6-8 alphanumeric characters.' },
                    { status: 400 }
                );
            }
        } else {
            // Generate random code
            code = generateRandomCode();

            // Ensure uniqueness (retry up to 5 times)
            let attempts = 0;
            while (attempts < 5) {
                const existing = await prisma.link.findUnique({ where: { code } });
                if (!existing) break;
                code = generateRandomCode();
                attempts++;
            }
        }

        // Try to create the link
        try {
            const link = await prisma.link.create({
                data: {
                    code,
                    targetUrl,
                },
            });

            return NextResponse.json(link, { status: 201 });
        } catch (error: any) {
            // Check for unique constraint violation
            if (error.code === 'P2002') {
                return NextResponse.json(
                    { error: 'Code already exists. Please choose a different code.' },
                    { status: 409 }
                );
            }
            throw error;
        }
    } catch (error) {
        console.error('Error creating link:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET /api/links - List all links
export async function GET() {
    try {
        const links = await prisma.link.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(links);
    } catch (error) {
        console.error('Error fetching links:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
