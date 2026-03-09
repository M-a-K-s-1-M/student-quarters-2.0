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
    photoGroups?: unknown;
    externalLinks: string[];
    updatedAt?: string;
};

type DormitoryPhotoGroups = {
    dormitory?: string[];
    dormitoryLife?: string[];
    dromitoryLife?: string[];
};

type PatternDefinition = {
    label: string;
    patterns: RegExp[];
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error('Переменная окружения DATABASE_URL не задана.');
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter } as any);

const normalizeWhitespace = (value: string): string =>
    value.replace(/\s+/g, ' ').replace(/\u00A0/g, ' ').trim();

const dedupe = (items: string[]): string[] => Array.from(new Set(items));

const normalizePhotoUrlForCompare = (url: string): string => {
    const trimmed = url.trim();

    try {
        const parsed = new URL(trimmed);
        parsed.hash = '';

        // Keep query-free key to avoid duplicates like image.jpg?width=400 and image.jpg?width=800.
        const pathname = parsed.pathname.replace(/\/+$/, '');
        return `${parsed.origin.toLowerCase()}${pathname.toLowerCase()}`;
    } catch {
        return trimmed
            .replace(/#.*$/, '')
            .replace(/\?.*$/, '')
            .replace(/\/+$/, '')
            .toLowerCase();
    }
};

const uniquePhotoUrls = (urls: string[]): string[] => {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const rawUrl of urls) {
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

const extractAllSourcePhotos = (record: DormitoryRecord): string[] => {
    const groups = (record.photoGroups as DormitoryPhotoGroups | null) ?? null;

    const groupedUrls = uniquePhotoUrls([
        ...(groups?.dormitory ?? []),
        ...(groups?.dormitoryLife ?? []),
        ...(groups?.dromitoryLife ?? []),
    ]);

    return groupedUrls.length ? groupedUrls : uniquePhotoUrls(record.imageUrls);
};

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

const AMENITY_PATTERNS: PatternDefinition[] = [
    { label: 'Wi-Fi', patterns: [/wi[-\s]?fi/i, /беспроводн\w*\s+интернет/i, /интернет/i] },
    { label: 'Общая кухня', patterns: [/кухн/i] },
    { label: 'Прачечная', patterns: [/прачечн/i, /стирал\w*\s+машин/i] },
    { label: 'Парковка', patterns: [/парковк/i, /паркинг/i] },
    { label: 'Кондиционер', patterns: [/кондиционер/i, /сплит[-\s]?систем/i] },
    { label: 'Охрана 24/7', patterns: [/круглосуточн\w*\s+охра/i, /охран[аы]/i, /видеонаблюдени/i] },
    { label: 'Душ', patterns: [/\bдуш\b/i, /душев/i] },
    { label: 'Учебная комната', patterns: [/учебн\w*\s+комнат/i, /комнат\w*\s+для\s+заняти/i] },
    { label: 'Спорт/фитнес', patterns: [/тренажер/i, /спортзал/i, /фитнес/i, /теннис/i, /дартс/i] },
    { label: 'Коворкинг/досуг', patterns: [/коворк/i, /досу[гк]/i, /квест/i, /мероприяти/i] },
];

const TAG_PATTERNS: PatternDefinition[] = [
    { label: 'После капремонта', patterns: [/капитальн\w*\s+ремонт/i, /после\s+ремонт/i] },
    { label: 'Коридорный тип', patterns: [/коридорн\w*\s+тип/i] },
    { label: 'Блочный тип', patterns: [/блочн\w*\s+тип/i] },
    { label: 'Центр', patterns: [/проспект\s+ленина/i, /ул\.\s+коминтерна/i, /центр/i] },
    { label: 'Рядом с кампусом', patterns: [/кампус/i, /студгород/i] },
    { label: '2-3 человека в комнате', patterns: [/2\s*[-–]\s*3\s+человек/i, /по\s*2\s*[-–]\s*3\s+человека/i] },
];

const hasAnyPattern = (text: string, patterns: RegExp[]): boolean =>
    patterns.some((pattern) => pattern.test(text));

const extractAmenities = (sections: DormitorySection[]): string[] => {
    const fullText = sections
        .map((section) => normalizeWhitespace(section.content))
        .join(' ');

    const amenities = AMENITY_PATTERNS
        .filter((entry) => hasAnyPattern(fullText, entry.patterns))
        .map((entry) => entry.label);

    return dedupe(amenities);
};

const extractTags = (record: DormitoryRecord, amenities: string[]): string[] => {
    const fullText = [record.title, ...record.sections.map((section) => section.content)]
        .map((value) => normalizeWhitespace(value))
        .join(' ');

    const tagsFromPatterns = TAG_PATTERNS
        .filter((entry) => hasAnyPattern(fullText, entry.patterns))
        .map((entry) => entry.label);

    const tagsFromAmenities = amenities
        .filter((amenity) => ['Wi-Fi', 'Общая кухня', 'Прачечная', 'Парковка', 'Кондиционер', 'Охрана 24/7'].includes(amenity));

    return dedupe([...tagsFromPatterns, ...tagsFromAmenities]);
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
        const sourceAllPhotoUrls = extractAllSourcePhotos(record);
        const amenities = extractAmenities(record.sections);
        const tags = extractTags(record, amenities);

        const existing =
            (await prisma.dormitory.findFirst({ where: { sourceId: record.id } })) ||
            (await prisma.dormitory.findFirst({ where: { website } })) ||
            (await prisma.dormitory.findFirst({ where: { name } }));

        const dormitoryData = {
            sourceId: record.id,
            sourceUrl: record.url,
            sourceTitle: record.title,
            sourceSections: record.sections,
            sourceImageUrls: record.imageUrls,
            sourcePhotoGroups: record.photoGroups ?? null,
            sourceAllPhotoUrls,
            sourceExternalLinks: record.externalLinks,
            sourceUpdatedAt: record.updatedAt ?? null,
            name,
            description,
            address,
            phone,
            website,
            amenities,
            tags,
        } as any;

        const dormitory = existing
            ? await prisma.dormitory.update({
                where: { id: existing.id },
                data: dormitoryData,
            })
            : await prisma.dormitory.create({
                data: dormitoryData,
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
