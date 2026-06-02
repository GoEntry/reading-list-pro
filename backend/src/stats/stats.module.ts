import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark } from '../bookmarks/bookmark.entity';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Bookmark])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
