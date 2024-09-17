import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import {ScheduleModule} from "@nestjs/schedule/dist";
import {CacheModule} from "@nestjs/cache-manager/dist";
import {ConfigModule} from "@nestjs/config/dist";

@Module({
  imports: [
    TasksModule,
    ScheduleModule.forRoot(),
    CacheModule.register(),
    ConfigModule.forRoot({
    envFilePath: '../.env',
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
