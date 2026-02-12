import { ApiProperty } from '@nestjs/swagger';

export class WorkspaceEntity {
  @ApiProperty({
    example: '550e8400-e29b-411d-a716-446655440000',
    description: 'The unique identifier of the workspace',
  })
  id: string;

  @ApiProperty({
    example: 'Marketing Team',
    description: 'The display name of the workspace',
  })
  name: string;

  @ApiProperty({
    example: 'marketing-team',
    description: 'A URL-friendly version of the name (unique)',
  })
  slug: string;

  @ApiProperty({
    example: 'user-uuid-999',
    description: 'ID of the user who owns the workspace',
  })
  ownerId: string;

  @ApiProperty({
    example: '2026-02-12T14:00:00Z',
    description: 'Timestamp when the workspace was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-02-12T15:30:00Z',
    description: 'Timestamp of the last update',
  })
  updatedAt: Date;
}
