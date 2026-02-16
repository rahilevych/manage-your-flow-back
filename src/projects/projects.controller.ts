import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { Roles } from 'src/jwt-auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/jwt-auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/jwt-auth/guards/roles.guard';
import { ProjectsService } from './projects.service';
import { LoggedUser } from 'src/users/decorators/logged-user.decorator';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { MemberRole } from 'src/generated/prisma/enums';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @ApiOperation({ summary: 'Create a new project' })
  @ApiParam({ name: 'workspaceId', description: 'ID of the workspace' })
  @ApiResponse({ status: 201, description: 'Project created successfully' })
  async createProject(
    @Param('workspaceId') workspaceId: string,
    @LoggedUser('userId') userId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return await this.projectsService.create(userId, workspaceId, dto);
  }

  @Get()
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @ApiOperation({ summary: 'Get all projects in workspace' })
  @ApiParam({ name: 'workspaceId', description: 'ID of the workspace' })
  async getProjects(@Param('workspaceId') workspaceId: string) {
    return await this.projectsService.getAll(workspaceId);
  }

  @Get(':projectId')
  @Roles(MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER)
  @ApiOperation({ summary: 'Get a specific project by ID' })
  @ApiParam({ name: 'workspaceId', description: 'ID of the workspace' })
  @ApiParam({ name: 'projectId', description: 'ID of the project' })
  async getProject(@Param('projectId') projectId: string) {
    return await this.projectsService.get(projectId);
  }

  @Delete(':projectId')
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @ApiOperation({ summary: 'Delete project' })
  @ApiParam({ name: 'workspaceId', description: 'ID of the workspace' })
  @ApiParam({ name: 'projectId', description: 'ID of the project' })
  async deleteProject(@Param('projectId') projectId: string) {
    return await this.projectsService.delete(projectId);
  }

  @Patch(':projectId')
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @ApiOperation({ summary: 'Update project settings' })
  @ApiParam({ name: 'workspaceId', description: 'ID of the workspace' })
  @ApiParam({ name: 'projectId', description: 'ID of the project' })
  async updateProject(
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return await this.projectsService.update(projectId, dto);
  }
}
