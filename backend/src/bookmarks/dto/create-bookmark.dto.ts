import { ApiProperty } from '@nestjs/swagger';
import { IsUrl, IsString, IsNotEmpty, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateBookmarkDto {
  @ApiProperty({ example: 'https://example.com/article' })
  @IsUrl({ require_protocol: true })
  url: string;

  @ApiProperty({ example: 'My Article Title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false, example: 'A short description from OG tags' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, example: 'https://example.com/favicon.ico' })
  @IsOptional()
  @IsString()
  favicon?: string;

  @ApiProperty({ required: false, example: 'https://example.com/og-image.jpg' })
  @IsOptional()
  @IsString()
  previewImage?: string;

  @ApiProperty({ required: false, example: 'My personal notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ required: false, type: [String], example: ['uuid-1', 'uuid-2'] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}
