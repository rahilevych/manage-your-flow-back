import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';

import { DatabaseModule } from 'src/database/database.module';
import { MembersModule } from 'src/members/members.module';

@Module({
  imports: [DatabaseModule, MembersModule],
  providers: [ProjectsService],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
