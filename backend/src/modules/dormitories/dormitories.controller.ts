import { Controller, Get, Param } from '@nestjs/common';
import { DormitoriesService } from './dormitories.service';

@Controller('dormitories')
export class DormitoriesController {
  constructor(private readonly dormitoriesService: DormitoriesService) { }

  @Get()
  findAll() {
    return this.dormitoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dormitoriesService.findOne(id);
  }
}
