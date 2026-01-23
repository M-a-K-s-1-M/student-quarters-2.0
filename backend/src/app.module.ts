import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { DormitoriesModule } from './modules/dormitories/dormitories.module';
import { ReviewsModule } from './modules/reviews/reviews.module';

@Module({
  imports: [UsersModule, DormitoriesModule, ReviewsModule],
})
export class AppModule { }
