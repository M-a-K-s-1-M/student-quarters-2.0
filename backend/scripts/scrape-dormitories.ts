import axios from 'axios';
import * as cheerio from 'cheerio';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const BASE_URL = 'https://campus.urfu.ru';
const INDEX_URL =
    'https://campus.urfu.ru/ru/studencheskii-gorodok/obshchezhitija/obshchezhitija/';

type DormitorySection = {
    heading: string;
    content: string;
    imageUrls: string[];
};

type DormitoryAdminPhotoGroup = {
    fullName: string;
    role: string;
    description: string;
    photoUrls: string[];
};

type DormitoryPhotoGroups = {
    dormitory: string[];
    administration: DormitoryAdminPhotoGroup[];
    dormitoryLife: string[];
};

type DormitoryRecord = {
    id: string;
    url: string;
    title: string;
    sections: DormitorySection[];
    imageUrls: string[];
    photoGroups: DormitoryPhotoGroups;
    externalLinks: string[];
    updatedAt?: string;
};

const normalizeWhitespace = (value: string): string =>
    value.replace(/\s+/g, ' ').replace(/\u00A0/g, ' ').trim();

const absoluteUrl = (href: string): string => {
    try {
        return new URL(href, BASE_URL).toString();
    } catch {
        return href;
    }
};

const sleep = (ms: number): Promise<void> =>
    new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

const dedupe = (items: string[]): string[] => Array.from(new Set(items));

const isImageUrl = (url: string): boolean => /\.(jpg|jpeg|png|webp)(\?|$)/i.test(url);

const isUsefulImageUrl = (url: string): boolean => {
    if (!isImageUrl(url)) {
        return false;
    }

    if (!/\/fileadmin\//i.test(url)) {
        return false;
    }

    return !/(blank\.gif|main_logo_ru|lang-ru|sitemap|blind-logo|layer_close)/i.test(url);
};

const collectImageUrlsFromNodes = (
    $: cheerio.CheerioAPI,
    nodes: cheerio.Cheerio<any>,
): string[] => {
    const imgSrcs = nodes
        .find('img[src]')
        .map((_, element) => absoluteUrl($(element).attr('src') || ''))
        .get();

    const imageLinks = nodes
        .find('a[href]')
        .map((_, element) => absoluteUrl($(element).attr('href') || ''))
        .get()
        .filter((href) => isImageUrl(href));

    return dedupe([...imgSrcs, ...imageLinks].filter((url) => isUsefulImageUrl(url)));
};

const transliterateRuToLat = (value: string): string => {
    const map: Record<string, string> = {
        а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
        и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
        с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
        ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
    };

    return value
        .toLowerCase()
        .split('')
        .map((char) => map[char] ?? char)
        .join('');
};

const extractAdministrators = (administrationText: string): DormitoryAdminPhotoGroup[] => {
    const admins: DormitoryAdminPhotoGroup[] = [];
    const roleRegex = /(Заведующ[а-яё\s]+|Комендант[а-яё\s]*|Воспитател[ья][а-яё\s]*)\s*-\s*([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ][а-яё]+){1,2})/gi;
    const matches = Array.from(administrationText.matchAll(roleRegex));

    for (let index = 0; index < matches.length; index += 1) {
        const match = matches[index];
        const start = match.index ?? 0;
        const nextStart = matches[index + 1]?.index ?? administrationText.length;
        const snippet = administrationText.slice(start, nextStart);

        const role = normalizeWhitespace(match[1]);
        const fullName = normalizeWhitespace(match[2]);
        let description = normalizeWhitespace(snippet.replace(match[0], ''));

        if (!description) {
            description = 'Описание не найдено';
        }

        admins.push({
            fullName,
            role,
            description,
            photoUrls: [],
        });
    }

    return admins;
};

const assignAdminPhotos = (
    admins: DormitoryAdminPhotoGroup[],
    adminImages: string[],
): DormitoryAdminPhotoGroup[] => {
    if (!admins.length) {
        return [];
    }

    const usedImages = new Set<string>();

    for (const admin of admins) {
        const surname = admin.fullName.split(' ')[0] ?? '';
        const surnameLat = transliterateRuToLat(surname);

        const matched = adminImages.filter((imageUrl) => {
            const normalized = imageUrl.toLowerCase();
            return surnameLat.length > 2 && normalized.includes(surnameLat);
        });

        if (matched.length) {
            admin.photoUrls = dedupe(matched);
            matched.forEach((url) => usedImages.add(url));
        }
    }

    const remaining = adminImages.filter((url) => !usedImages.has(url));

    if (remaining.length) {
        for (let index = 0; index < remaining.length; index += 1) {
            admins[index % admins.length].photoUrls.push(remaining[index]);
        }
    }

    return admins.map((admin) => ({
        ...admin,
        photoUrls: dedupe(admin.photoUrls),
    }));
};

const buildPhotoGroups = (sections: DormitorySection[], allImages: string[]): DormitoryPhotoGroups => {
    const generalSection = sections.find((section) => /общая\s+характеристика/i.test(section.heading));
    const adminSection = sections.find((section) => /администрац/i.test(section.heading));
    const lifeSection = sections.find((section) => /студенческое\s+самоуправление/i.test(section.heading));

    const dormitoryImages = dedupe(generalSection?.imageUrls ?? []);
    const adminImages = dedupe(adminSection?.imageUrls ?? []);
    const lifeImages = dedupe(lifeSection?.imageUrls ?? []);

    const assigned = new Set<string>([...dormitoryImages, ...adminImages, ...lifeImages]);
    const leftovers = allImages.filter((url) => !assigned.has(url));

    for (const imageUrl of leftovers) {
        const normalized = imageUrl.toLowerCase();
        if (/ssk|sovet|stud|meropriyat|event/i.test(normalized)) {
            lifeImages.push(imageUrl);
            continue;
        }

        if (/zaved|zavkhoz|komendant|khoz|arkhipov|morev|ivanov|nikitin/i.test(normalized)) {
            adminImages.push(imageUrl);
            continue;
        }

        dormitoryImages.push(imageUrl);
    }

    const administrators = assignAdminPhotos(
        extractAdministrators(adminSection?.content ?? ''),
        dedupe(adminImages),
    );

    return {
        dormitory: dedupe(dormitoryImages),
        administration: administrators,
        dormitoryLife: dedupe(lifeImages),
    };
};

const fetchHtml = async (url: string): Promise<string> => {
    const response = await axios.get<string>(url, {
        timeout: 30000,
        headers: {
            'User-Agent':
                'student-quarters-2.0 bot/1.0 (+https://github.com/; educational parser)',
            Accept: 'text/html,application/xhtml+xml',
        },
    });

    return response.data;
};

const collectDormitoryLinks = async (): Promise<string[]> => {
    const html = await fetchHtml(INDEX_URL);
    const $ = cheerio.load(html);

    const links = new Set<string>();

    $('a[href]').each((_, element) => {
        const href = $(element).attr('href');
        if (!href) {
            return;
        }

        const full = absoluteUrl(href).replace(/#.*$/, '').replace(/\/$/, '/');

        if (/\/obshchezhitija\/obshchezhitija\/(no-\d+|nvk-no-\d+)\/?$/i.test(full)) {
            links.add(full);
        }
    });

    return Array.from(links).sort((a, b) => a.localeCompare(b, 'ru'));
};

const parseDormitoryPage = async (url: string): Promise<DormitoryRecord> => {
    const html = await fetchHtml(url);
    const $ = cheerio.load(html);

    const title =
        normalizeWhitespace($('h1').first().text()) ||
        normalizeWhitespace($('title').first().text()) ||
        'Без названия';

    const pageText = normalizeWhitespace($('body').text());
    const updatedAtMatch = pageText.match(/Создано\s*\/\s*Изменено:\s*([^©\n\r]+)/i);

    const sections: DormitorySection[] = [];

    $('h2, h3').each((_, headingNode) => {
        const heading = normalizeWhitespace($(headingNode).text());
        if (!heading) {
            return;
        }

        const blockNodes = $(headingNode).nextUntil('h2, h3');

        const content = normalizeWhitespace(
            blockNodes
                .map((__, el) => $(el).text())
                .get()
                .join(' '),
        );

        const sectionImageUrls = collectImageUrlsFromNodes($, blockNodes);

        sections.push({
            heading,
            content,
            imageUrls: sectionImageUrls,
        });
    });

    const imageUrls = collectImageUrlsFromNodes($, $('body'));
    const photoGroups = buildPhotoGroups(sections, imageUrls);

    const externalLinks = Array.from(
        new Set(
            $('a[href]')
                .map((_, element) => absoluteUrl($(element).attr('href') || ''))
                .get()
                .filter((href) => /^https?:\/\//i.test(href))
                .filter((href) => !href.startsWith(BASE_URL)),
        ),
    );

    const idMatch = url.match(/\/(no-\d+|nvk-no-\d+)\/?$/i);
    const id = idMatch?.[1] ?? url;

    return {
        id,
        url,
        title,
        sections,
        imageUrls: dedupe([
            ...photoGroups.dormitory,
            ...photoGroups.administration.flatMap((admin) => admin.photoUrls),
            ...photoGroups.dormitoryLife,
        ]),
        photoGroups,
        externalLinks,
        updatedAt: updatedAtMatch ? normalizeWhitespace(updatedAtMatch[1]) : undefined,
    };
};

const main = async (): Promise<void> => {
    console.log('Ищу ссылки на страницы общежитий...');
    const links = await collectDormitoryLinks();

    if (!links.length) {
        throw new Error('Не удалось найти ссылки на страницы общежитий.');
    }

    console.log(`Найдено страниц: ${links.length}`);

    const result: DormitoryRecord[] = [];

    for (const [index, link] of links.entries()) {
        console.log(`[${index + 1}/${links.length}] Парсинг: ${link}`);
        const parsed = await parseDormitoryPage(link);
        result.push(parsed);
        await sleep(500);
    }

    const outputDir = resolve(process.cwd(), 'data');
    await mkdir(outputDir, { recursive: true });

    const outputPath = resolve(outputDir, 'dormitories.json');
    await writeFile(outputPath, JSON.stringify(result, null, 2), 'utf-8');

    console.log(`Готово. Файл сохранен: ${outputPath}`);
};

main().catch((error: unknown) => {
    console.error('Ошибка парсинга:', error);
    process.exitCode = 1;
});
