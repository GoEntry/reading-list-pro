import { IsString, IsNotEmpty, IsOptional, IsHexColor } from 'class-validator';

export class UpdateTagDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;
}
