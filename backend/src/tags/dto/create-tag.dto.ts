import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsHexColor } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ example: 'Design' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false, example: '#3B82F6' })
  @IsOptional()
  @IsHexColor()
  color?: string;
}
