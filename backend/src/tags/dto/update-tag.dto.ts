import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsHexColor } from 'class-validator';

export class UpdateTagDto {
  @ApiProperty({ required: false, example: 'Design' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({ required: false, example: '#3B82F6' })
  @IsOptional()
  @IsHexColor()
  color?: string;
}
