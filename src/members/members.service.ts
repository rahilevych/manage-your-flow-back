import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class MembersService {
  constructor(private db: DatabaseService) {}
  async find(userId: string, workspaceId: string) {
    if (!userId || !workspaceId) throw new BadRequestException('');
    const member = await this.db.member.findUnique({
      where: {
        userId_workspaceId: {
          userId: userId,
          workspaceId: workspaceId,
        },
      },
    });
    return member;
  }
}
