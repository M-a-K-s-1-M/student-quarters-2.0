import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

type DormitorySection = {
    heading: string;
    content: string;
};

type DormitoryRecord = {
    id: string;
    url: string;
    title: string;
    sections: DormitorySection[];
    imageUrls: string[];
    externalLinks: string[];
    updatedAt?: string;
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('Переменная окружения DATABASE_URL не задана.');
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter } as any);

const normalizeWhitespace = (value: string): string =>
    value.replace(/\s+/g, ' ').replace(/\u00A0/g, ' ').trim();

const buildDescription = (record: DormitoryRecord): string | null => {
    const sectionText = record.sections
        .map((section) => `${section.heading}: ${normalizeWhitespace(section.content)}`)
        .join('\n\n');

    const meta: string[] = [];
    if (record.updatedAt) {
        meta.push(`Обновлено на источнике: ${record.updatedAt}`);
    }

    if (record.externalLinks.length) {
        meta.push(`Внешние ссылки: ${record.externalLinks.join(', ')}`);
    }

    const combined = [sectionText, ...meta].filter(Boolean).join('\n\n');
    return combined || null;
};

const extractAddress = (sections: DormitorySection[]): string | null => {
    const fullText = sections.map((section) => section.content).join(' ');
    const match = fullText.match(/адрес(?:у|е)?\s*[:\-]?\s*([^.;]+)/i);
    if (!match) {
        return null;
    }

    return normalizeWhitespace(match[1]);
};

const extractPhone = (sections: DormitorySection[]): string | null => {
    const fullText = sections.map((section) => section.content).join(' ');
    const match = fullText.match(/(?:\+7|8)\s*\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}/);
    if (!match) {
        return null;
    }

    return normalizeWhitespace(match[0]);
};

const filterDormitoryImages = (urls: string[]): string[] => {
    const unique = new Set<string>();

    for (const url of urls) {
        const isImage = /\.(jpg|jpeg|png|webp)(\?|$)/i.test(url);
        const isDormImage = /\/fileadmin\//i.test(url);
        const isUseful = isImage && isDormImage;

        if (isUseful) {
            unique.add(url);
        }
    }

    return Array.from(unique);
};

const importDormitories = async (): Promise<void> => {
    const jsonPath = resolve(process.cwd(), 'data', 'dormitories.json');
    const raw = await readFile(jsonPath, 'utf-8');
    const records = JSON.parse(raw) as DormitoryRecord[];

    if (!Array.isArray(records) || records.length === 0) {
        throw new Error('Файл dormitories.json пустой или имеет неверный формат.');
    }

    let created = 0;
    let updated = 0;

    for (const record of records) {
        const name = normalizeWhitespace(record.title);
        const description = buildDescription(record);
        const address = extractAddress(record.sections);
        const phone = extractPhone(record.sections);
        const website = record.url;
        const images = filterDormitoryImages(record.imageUrls);

        const existing =
            (await prisma.dormitory.findFirst({ where: { website } })) ||
            (await prisma.dormitory.findFirst({ where: { name } }));

        const dormitory = existing
            ? await prisma.dormitory.update({
                where: { id: existing.id },
                data: {
                    name,
                    description,
                    address,
                    phone,
                    website,
                },
            })
            : await prisma.dormitory.create({
                data: {
                    name,
                    description,
                    address,
                    phone,
                    website,
                },
            });

        if (existing) {
            updated += 1;
        } else {
            created += 1;
        }

        await prisma.dormitoryImage.deleteMany({
            where: { dormitoryId: dormitory.id },
        });

        if (images.length) {
            await prisma.dormitoryImage.createMany({
                data: images.map((imageUrl) => ({
                    dormitoryId: dormitory.id,
                    imageUrl,
                })),
            });
        }

        console.log(`Импортировано: ${name} (фото: ${images.length})`);
    }

    console.log(`Готово. Создано: ${created}, обновлено: ${updated}`);
};

const main = async (): Promise<void> => {
    await prisma.$connect();
    try {
        await importDormitories();
    } finally {
        await prisma.$disconnect();
    }
};

main().catch((error: unknown) => {
    console.error('Ошибка импорта:', error);
    process.exitCode = 1;
});
