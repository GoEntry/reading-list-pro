import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Req,
} from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiQuery, ApiParam,
} from '@nestjs/swagger';
import { Request } from 'express';
import { BookmarksService } from './bookmarks.service';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('bookmarks')
@ApiBearerAuth()
@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  @ApiOperation({ summary: 'List bookmarks with optional search, tag filter, and pagination' })
  @ApiQuery({ name: 'search', required: false, description: 'Full-text search on title and URL' })
  @ApiQuery({ name: 'tagIds', required: false, description: 'Comma-separated tag UUIDs' })
  @ApiQuery({ name: 'isRead', required: false, description: 'Filter by read status (true/false)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20, max: 100)' })
  @ApiResponse({ status: 200, description: 'Paginated bookmark list' })
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
  @ApiOperation({ summary: 'Get a single bookmark by ID' })
  @ApiParam({ name: 'id', description: 'Bookmark UUID' })
  @ApiResponse({ status: 200, description: 'Bookmark found' })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  findOne(@Req() req: Request & { user: { id: string } }, @Param('id') id: string) {
    return this.bookmarksService.findOne(req.user.id, id);
  }

  @Post()
  @ApiOperation({ summary: 'Save a new bookmark (OG fields populated by the extension)' })
  @ApiResponse({ status: 201, description: 'Bookmark created' })
  create(@Req() req: Request & { user: { id: string } }, @Body() dto: CreateBookmarkDto) {
    return this.bookmarksService.create(req.user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notes, tags, or read status' })
  @ApiParam({ name: 'id', description: 'Bookmark UUID' })
  @ApiResponse({ status: 200, description: 'Bookmark updated' })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  update(
    @Req() req: Request & { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateBookmarkDto,
  ) {
    return this.bookmarksService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bookmark' })
  @ApiParam({ name: 'id', description: 'Bookmark UUID' })
  @ApiResponse({ status: 200, description: 'Bookmark deleted' })
  @ApiResponse({ status: 404, description: 'Bookmark not found' })
  remove(@Req() req: Request & { user: { id: string } }, @Param('id') id: string) {
    return this.bookmarksService.remove(req.user.id, id);
  }
}
