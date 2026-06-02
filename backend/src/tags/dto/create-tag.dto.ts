import { IsString, IsNotEmpty, IsOptional, IsHexColor } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsHexColor()
  color?: string;
}
