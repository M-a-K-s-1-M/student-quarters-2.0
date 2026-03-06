import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DormitoriesService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.dormitory.findMany({
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

        return dormitory;
    }
}
