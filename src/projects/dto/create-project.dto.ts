import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    example: 'Project',
    description: 'The display name of the project',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  name: string;

  @ApiProperty({
    example: 'DEV',
    description:
      'Short unique prefix for tasks (e.g., DEV-101). Uppercase letters and numbers only',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 10)
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Key must contain only uppercase letters and numbers',
  })
  key: string;
  @ApiProperty({
    example: 'This project is about...',
    description: 'Detailed information about the project',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
