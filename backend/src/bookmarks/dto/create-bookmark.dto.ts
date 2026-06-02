import { IsUrl, IsString, IsNotEmpty, IsOptional, IsArray, IsUUID } from 'class-validator';

export class CreateBookmarkDto {
  @IsUrl({ require_protocol: true })
  url: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  favicon?: string;

  @IsOptional()
  @IsString()
  previewImage?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}
