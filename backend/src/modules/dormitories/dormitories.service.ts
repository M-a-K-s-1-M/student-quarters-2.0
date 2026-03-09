import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DormitoriesService {
    constructor(private readonly prisma: PrismaService) { }

    private normalizePhotoUrlForCompare(url: string): string {
        const trimmed = url.trim();

        try {
            const parsed = new URL(trimmed);
            parsed.hash = '';
            const pathname = parsed.pathname.replace(/\/+$/, '');
            return `${parsed.origin.toLowerCase()}${pathname.toLowerCase()}`;
        } catch {
            return trimmed
                .replace(/#.*$/, '')
                .replace(/\?.*$/, '')
                .replace(/\/+$/, '')
                .toLowerCase();
        }
    }

    private uniquePhotoUrls(urls: string[] | null | undefined): string[] {
        const seen = new Set<string>();
        const result: string[] = [];

        for (const rawUrl of urls ?? []) {
            const original = rawUrl?.trim();
            if (!original) {
                continue;
            }

            const key = this.normalizePhotoUrlForCompare(original);
            if (seen.has(key)) {
                continue;
            }

            seen.add(key);
            result.push(original);
        }

        return result;
    }

    private mapDormitoryPhotos<T extends { sourceAllPhotoUrls?: string[] | null }>(dormitory: T): T {
        return {
            ...dormitory,
            sourceAllPhotoUrls: this.uniquePhotoUrls(dormitory.sourceAllPhotoUrls),
        };
    }

    async findAll() {
        const dormitories = await this.prisma.dormitory.findMany({
            orderBy: {
                name: 'asc',
            },
            include: {
                images: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });

        return dormitories.map((dormitory) => this.mapDormitoryPhotos(dormitory));
    }

    async findOne(id: string) {
        const dormitory = await this.prisma.dormitory.findUnique({
            where: { id },
            include: {
                images: {
                    orderBy: {
                        createdAt: 'asc',
                    },
                },
            },
        });

        if (!dormitory) {
            throw new NotFoundException('Общежитие не найдено');
        }

        return this.mapDormitoryPhotos(dormitory);
    }
}
