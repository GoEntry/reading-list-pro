import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { Bookmark } from './bookmark.entity';
import { Tag } from '../tags/tag.entity';

@Module({
  // Tag repository is needed because BookmarksService assigns tags by userId-scoped lookup
  imports: [TypeOrmModule.forFeature([Bookmark, Tag])],
  controllers: [BookmarksController],
  providers: [BookmarksService],
})
export class BookmarksModule {}
