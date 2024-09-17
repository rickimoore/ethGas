import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import {CacheModule} from "@nestjs/cache-manager/dist";

@Module({
  imports: [CacheModule.register()],
  providers: [TasksService]
})
export class TasksModule {}
