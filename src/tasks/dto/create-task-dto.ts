import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsDateString,
  MinLength,
} from 'class-validator';
import { Priority, TaskStatus } from 'src/generated/prisma/enums';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Implement Auth System',
    description: 'Task name',
  })
  @IsString()
  @MinLength(3)
  title: string;

  @ApiPropertyOptional({
    example: 'Use JWT for authentication',
    description: 'Task description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: TaskStatus, default: TaskStatus.BACKLOG })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({ enum: Priority, default: Priority.MEDIUM })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiProperty({ example: 'uuid-project-123' })
  @IsUUID()
  projectId: string;

  @ApiPropertyOptional({ example: 'uuid-user-456', nullable: true })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({
    example: '2024-12-31T23:59:59Z',
    description: 'Deadline date',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
