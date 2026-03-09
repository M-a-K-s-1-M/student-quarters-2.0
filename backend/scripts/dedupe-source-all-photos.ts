import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('Переменная окружения DATABASE_URL не задана.');
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter } as any);

const normalizePhotoUrlForCompare = (url: string): string => {
    const trimmed = url.trim();

    try {
        const parsed = new URL(trimmed);
        parsed.hash = '';

        const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
        const pathname = decodeURIComponent(parsed.pathname).replace(/\/+$/, '').toLowerCase();
        const identityKeys = new Set(['id', 'file', 'uid', 'image', 'img', 'src', 'path']);

        const identityEntries = Array.from(parsed.searchParams.entries())
            .filter(([key]) => identityKeys.has(key.toLowerCase()))
            .sort(([a], [b]) => a.localeCompare(b));

        const identityQuery = new URLSearchParams(identityEntries).toString();

        return identityQuery ? `${host}${pathname}?${identityQuery}` : `${host}${pathname}`;
    } catch {
        return trimmed
            .replace(/#.*$/, '')
            .replace(/^https?:\/\//i, '')
            .replace(/^www\./i, '')
            .replace(/\/+$/, '')
            .toLowerCase();
    }
};

const uniquePhotoUrls = (urls: string[] | null | undefined): string[] => {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const rawUrl of urls ?? []) {
        const original = rawUrl?.trim();
        if (!original) {
            continue;
        }

        const key = normalizePhotoUrlForCompare(original);
        if (seen.has(key)) {
            continue;
        }

        seen.add(key);
        result.push(original);
    }

    return result;
};

const isSameArray = (a: string[] | null | undefined, b: string[]): boolean => {
    const source = a ?? [];
    return source.length === b.length && source.every((value, index) => value === b[index]);
};

const main = async (): Promise<void> => {
    await prisma.$connect();

    try {
        const dormitories = await prisma.dormitory.findMany({
            select: {
                id: true,
                name: true,
                sourceAllPhotoUrls: true,
            },
        });

        let updatedCount = 0;

        for (const dormitory of dormitories) {
            const cleaned = uniquePhotoUrls(dormitory.sourceAllPhotoUrls);

            if (isSameArray(dormitory.sourceAllPhotoUrls, cleaned)) {
                continue;
            }

            await prisma.dormitory.update({
                where: { id: dormitory.id },
                data: {
                    sourceAllPhotoUrls: cleaned,
                },
            });

            updatedCount += 1;
            console.log(`Обновлено: ${dormitory.name} (${dormitory.id}), фото: ${cleaned.length}`);
        }

        console.log(`Готово. Проверено: ${dormitories.length}, обновлено: ${updatedCount}.`);
    } finally {
        await prisma.$disconnect();
    }
};

main().catch((error: unknown) => {
    console.error('Ошибка очистки дублей sourceAllPhotoUrls:', error);
    process.exitCode = 1;
});
