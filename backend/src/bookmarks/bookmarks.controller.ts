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
    return this.bookmarksService.findAll(req.user.id, {
      search,
      tagIds: tagIds ? tagIds.split(',') : undefined,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Math.min(Number(limit), 100) : 20,
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
