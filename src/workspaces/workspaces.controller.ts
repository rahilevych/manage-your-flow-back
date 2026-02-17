import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { JwtAuthGuard } from 'src/jwt-auth/guards/jwt-auth.guard';
import { WorkspacesService } from './workspaces.service';
import { LoggedUser } from 'src/users/decorators/logged-user.decorator';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WorkspaceEntity } from './entities/workspace.entity';

@ApiTags('workspaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private workspaceService: WorkspacesService) {}

  @Post('')
  @ApiOperation({ summary: 'Create a new workspace' })
  @ApiResponse({
    status: 201,
    description: 'Workspace created',
    type: CreateWorkspaceDto,
  })
  async createWorkspace(
    @Body() dto: CreateWorkspaceDto,
    @LoggedUser('userId') userId: string,
  ) {
    const workspace = await this.workspaceService.create(userId, dto);
    return workspace;
  }
  @Get('')
  @ApiOperation({ summary: 'Get all user workspaces' })
  @ApiResponse({
    status: 200,
    type: WorkspaceEntity,
    isArray: true,
  })
  async getAll(@LoggedUser('userId') userId: string) {
    const workspaces = await this.workspaceService.getAll(userId);

    return workspaces;
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get workspace by ID' })
  @ApiResponse({ status: 200, type: WorkspaceEntity })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  async getById(@Param('id') id: string) {
    const workspace = await this.workspaceService.getById(id);

    return workspace;
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workspace' })
  @ApiParam({ name: 'id', description: 'The UUID of the workspace to delete' })
  @ApiResponse({
    status: 200,
    description: 'The workspace has been successfully deleted',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: You do not own this workspace',
  })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  async delete(
    @LoggedUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const deleted = await this.workspaceService.delete(id, userId);
    return deleted;
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update workspace details' })
  @ApiParam({ name: 'id', description: 'The UUID of the workspace to update' })
  @ApiResponse({
    status: 200,
    description: 'The workspace has been successfully updated',
    type: WorkspaceEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad Request: Validation failed' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: You do not own this workspace',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict: Name or slug already taken',
  })
  async update(
    @Body() dto: UpdateWorkspaceDto,
    @LoggedUser('userId') userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const update = await this.workspaceService.update(id, userId, dto);
    return update;
  }
  @Get(':id/stats')
  async getWorkspaceStats(@Param('id') id: string) {
    return this.workspaceService.getStats(id);
  }
}
