import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateWorkspaceDto {
  @ApiProperty({ example: 'My workspace' })
  @IsString()
  @MinLength(3, { message: 'Name is too short (min 3 characters)' })
  @MaxLength(30, { message: 'Name is too long (max 30 characters)' })
  @Matches(/^[a-zA-Z0-9\sа-яА-Я]+$/, {
    message: 'Name can only contain letters, numbers and spaces',
  })
  name: string;
}
