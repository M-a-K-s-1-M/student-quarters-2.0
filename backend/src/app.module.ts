import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { DormitoriesModule } from './modules/dormitories/dormitories.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, UsersModule, DormitoriesModule, ReviewsModule],
})
export class AppModule { }
