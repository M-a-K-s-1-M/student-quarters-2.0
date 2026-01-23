import { Controller } from '@nestjs/common';
import { DormitoriesService } from './dormitories.service';

@Controller('dormitories')
export class DormitoriesController {
  constructor(private readonly dormitoriesService: DormitoriesService) {}
}
