import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

/**
 * Обертка над PrismaClient с авто-сокрытием полей и управлением подключением.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {

    constructor() {
        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl) {
            throw new Error('DATABASE_URL is not set');
        }

        const adapter = new PrismaPg({ connectionString: databaseUrl });

        super({
            adapter,
            omit: {
                user: {
                    password: true,
                }
            }
        });
    }

    /** Устанавливает соединение с БД при старте модуля. */
    async onModuleInit() {
        await this.$connect();
    }

    /** Корректно закрывает соединение при остановке приложения. */
    async onModuleDestroy() {
        await this.$disconnect();
    }
}