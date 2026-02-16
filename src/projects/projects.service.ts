import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { DatabaseService } from 'src/database/database.service';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private db: DatabaseService) {}
  async create(userId: string, workspaceId: string, dto: CreateProjectDto) {
    const member = await this.db.member.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });

    if (!member) throw new ForbiddenException('Not a member of this workspace');
    const isExist = await this.db.project.findFirst({
      where: {
        name: dto.name,
        workspaceId: workspaceId,
      },
    });
    if (isExist) {
      throw new ConflictException(
        'Project with this name already exists in this workspace',
      );
    }
    return this.db.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        key: dto.key,
        workspaceId: workspaceId,
        creatorId: member.id,
        members: {
          connect: { id: member.id },
        },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async getAll(workspaceId: string) {
    if (!workspaceId) throw new BadRequestException('Workspace ID is required');
    return await this.db.project.findMany({
      where: {
        workspaceId: workspaceId,
      },
      include: {
        members: true,
        creator: true,
      },
    });
  }
  async get(projectId: string) {
    if (!projectId) throw new BadRequestException('Project ID is required');
    return await this.db.project.findUnique({
      where: {
        id: projectId,
      },
      include: {
        members: true,
        creator: true,
      },
    });
  }
  async delete(projectId: string) {
    const project = await this.db.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (!projectId) throw new BadRequestException('Project ID is required');
    return await this.db.project.delete({
      where: {
        id: projectId,
      },
    });
  }
  async update(projectId: string, dto: UpdateProjectDto) {
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }

    const project = await this.db.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return await this.db.project.update({
      where: {
        id: projectId,
      },
      data: {
        ...dto,
      },
    });
  }
}
