import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { OgScraperService } from './og-scraper.service';
import { Bookmark } from './bookmark.entity';
import { Tag } from '../tags/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bookmark, Tag])],
  controllers: [BookmarksController],
  providers: [BookmarksService, OgScraperService],
})
export class BookmarksModule {}
