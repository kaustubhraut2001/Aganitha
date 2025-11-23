import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';

export default async function RedirectPage({
    params,
}: {
    params: Promise<{ code: string }>;
}) {
    const { code } = await params;

    // Find the link
    const link = await prisma.link.findUnique({
        where: { code },
    });

    // If not found, show 404
    if (!link) {
        notFound();
    }

    // Update click count and last clicked time
    await prisma.link.update({
        where: { code },
        data: {
            clicks: link.clicks + 1,
            lastClickedAt: new Date(),
        },
    });

    // Perform 302 redirect
    redirect(link.targetUrl);
}
