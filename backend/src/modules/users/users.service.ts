import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async getAllUsers() {
        return await this.prisma.user.findMany();
    }

    async getUserById(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async getUserByEmail(email: string) {
        return await this.prisma.user.findUnique({
            where: { email },
        });
    }

    async deleteUser(id: string) {
        return await this.prisma.user.delete({
            where: { id },
        });
    }
}
