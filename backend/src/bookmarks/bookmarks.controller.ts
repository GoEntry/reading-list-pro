import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  findAll(
    @Req() req: Request & { user: { id: string } },
    @Query('search') search?: string,
    @Query('tagIds') tagIds?: string,
    @Query('isRead') isRead?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const parsedPage = parseInt(page ?? '1', 10);
    const parsedLimit = parseInt(limit ?? '20', 10);
    return this.bookmarksService.findAll(req.user.id, {
      search,
      tagIds: tagIds ? tagIds.split(',') : undefined,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      page: Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage,
      limit: Number.isNaN(parsedLimit) || parsedLimit < 1 ? 20 : Math.min(parsedLimit, 100),
    });
  }

  @Get(':id')
  findOne(@Req() req: Request & { user: { id: string } }, @Param('id') id: string) {
    return this.bookmarksService.findOne(req.user.id, id);
  }

  @Post()
  create(@Req() req: Request & { user: { id: string } }, @Body() dto: CreateBookmarkDto) {
    return this.bookmarksService.create(req.user.id, dto);
  }

  @Patch(':id')
  update(
    @Req() req: Request & { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateBookmarkDto,
  ) {
    return this.bookmarksService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request & { user: { id: string } }, @Param('id') id: string) {
    return this.bookmarksService.remove(req.user.id, id);
  }
}
