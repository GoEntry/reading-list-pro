import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findAll(@Req() req: Request & { user: { id: string } }) {
    return this.tagsService.findAll(req.user.id);
  }

  @Post()
  create(@Req() req: Request & { user: { id: string } }, @Body() dto: CreateTagDto) {
    return this.tagsService.create(req.user.id, dto);
  }

  @Patch(':id')
  update(
    @Req() req: Request & { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateTagDto,
  ) {
    return this.tagsService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request & { user: { id: string } }, @Param('id') id: string) {
    return this.tagsService.remove(req.user.id, id);
  }
}
