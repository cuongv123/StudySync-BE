import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { Task } from './entities/task.entity';
import { StudyGroup } from '../group/entities/group.entity';
import { GroupMember } from '../group/entities/group-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, StudyGroup, GroupMember]),
  ],
  controllers: [TaskController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
