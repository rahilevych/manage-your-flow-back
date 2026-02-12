import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import slugify from 'slugify';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { DatabaseService } from 'src/database/database.service';
import { MemberRole } from '@prisma/client';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class WorkspacesService {
  private readonly logger = new Logger(WorkspacesService.name);
  constructor(private db: DatabaseService) {}

  async create(userId: string, dto: CreateWorkspaceDto) {
    const baseSlug = slugify(dto.name);
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    try {
      const result = await this.db.$transaction(async (tx) => {
        const workspace = await tx.workspace.create({
          data: {
            name: dto.name,
            slug: slug,
            ownerId: userId,
          },
        });
        await tx.member.create({
          data: {
            userId,
            workspaceId: workspace.id,
            role: MemberRole.OWNER,
          },
        });
        return workspace;
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to create workspace: ${error.message}`,
        error.stack,
      );
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `Workspace with name "${dto.name}" already exists`,
          );
        }
      }

      throw error;
    }
  }

  async getAll(userId: string) {
    if (!userId) throw new UnauthorizedException('Unauthorized');
    return await this.db.workspace.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        name: true,
      },
    });
  }
  async getById(id: string) {
    if (!id) throw new BadRequestException('Workspace not found');
    const workspace = await this.db.workspace.findUnique({
      where: { id },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    return workspace;
  }
  async delete(id: string, userId: string) {
    const workspace = await this.getById(id);
    if (workspace.ownerId !== userId)
      throw new ForbiddenException('Access denied');
    return await this.db.workspace.delete({
      where: {
        id,
      },
    });
  }
  async update(id: string, userId: string, dto: UpdateWorkspaceDto) {
    const [workspace, nameDublicate] = await Promise.all([
      this.db.workspace.findUnique({ where: { id } }),
      dto.name
        ? this.db.workspace.findFirst({
            where: { ownerId: userId, name: dto.name, NOT: { id } },
          })
        : null,
    ]);

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.ownerId !== userId) {
      throw new ForbiddenException('You do not own this workspace');
    }

    if (nameDublicate) {
      throw new BadRequestException('Workspace name already taken');
    }
    return await this.db.workspace.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
      },
    });
  }
}
