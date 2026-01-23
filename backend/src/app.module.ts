import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { DormitoriesModule } from './dormitories/dormitories.module';
import { ReviewsModule } from './reviews/reviews.module';

@Module({
  imports: [UsersModule, DormitoriesModule, ReviewsModule],
})
export class AppModule { }
