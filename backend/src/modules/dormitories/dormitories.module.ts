import { Module } from '@nestjs/common';
import { DormitoriesService } from './dormitories.service';
import { DormitoriesController } from './dormitories.controller';

@Module({
  controllers: [DormitoriesController],
  providers: [DormitoriesService],
})
export class DormitoriesModule {}
