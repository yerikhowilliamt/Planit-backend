import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from '../../common/prisma.service';
import { ValidationService } from '../../common/validation.service';
import { Logger } from 'winston';
import { Task, User } from '@prisma/client';
import {
  CreateTaskRequest,
  TaskResponse,
  UpdateTaskRequest,
} from '../../model/task.model';
import { ZodError } from 'zod';
import { TaskValidation } from './task.validation';
import WebResponse from '../../model/web.model';

@Injectable()
export class TaskService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  private toTaskResponse(task: Task): TaskResponse {
    return {
      id: task.id,
      userId: task.userId,
      task: task.task,
      status: task.status,
      isDeleted: task.isDeleted,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    };
  }

  private async checkExistingTask(id: number, userId: number): Promise<Task> {
    const task = await this.prismaService.task.findFirst({
      where: { id, userId, isDeleted: false },
    });

    if (!task) {
      throw new NotFoundException(`Tugas tidak ditemukan.`);
    }

    return task;
  }

  private handleError(error: Error): never {
    if (error instanceof ZodError) {
      throw new BadRequestException(error.message);
    } else if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    ) {
      throw error;
    } else {
      this.logger.error(`Internal Server Error: ${error.message}`, error.stack);
      throw new InternalServerErrorException(
        'Terjadi kesalahan yang tidak terduga. Silakan coba lagi nanti.',
      );
    }
  }

  async create(user: User, request: CreateTaskRequest): Promise<TaskResponse> {
    try {
      this.logger.info(
        `TASK SERVICE | CREATE: user_email: ${user.email} create task: ${request.task} }`,
      );

      const createTaskValidated: CreateTaskRequest =
        await this.validationService.validate(TaskValidation.CREATE, request);

      const task = await this.prismaService.task.create({
        data: {
          userId: user.id,
          task: createTaskValidated.task,
        },
      });

      return this.toTaskResponse(task);
    } catch (error) {
      this.handleError(error);
    }
  }

  async list(
    user: User,
    limit: number = 10,
    page: number = 1,
  ): Promise<WebResponse<TaskResponse[]>> {
    try {
      this.logger.info(
        `TASK SERVICE | GET_LIST: user_email: ${user.email}, limit: ${limit}, page: ${page}`,
      );

      const skip = (page - 1) * limit;

      const [tasks, total] = await Promise.all([
        this.prismaService.task.findMany({
          where: {
            userId: user.id,
            isDeleted: false,
          },
          skip,
          take: limit,
        }),
        this.prismaService.task.count({
          where: {
            userId: user.id,
          },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: tasks.map(this.toTaskResponse),
        paging: {
          size: limit,
          current_page: page,
          total_page: totalPages,
        },
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async get(user: User, id: number): Promise<TaskResponse> {
    try {
      this.logger.info(
        `TASK SERVICE | GET: user_email: ${user.email} retrieve taskId: ${id} }`,
      );

      const task = await this.checkExistingTask(id, user.id);

      return this.toTaskResponse(task);
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(user: User, request: UpdateTaskRequest): Promise<TaskResponse> {
    try {
      this.logger.info(
        `TASK SERVICE | UPDATE: user_email: ${user.email} update task: { taskId: ${request.id}, task: ${request.task}, status: ${request.status} }`,
      );

      const updateRequestValidated: UpdateTaskRequest =
        await this.validationService.validate(TaskValidation.UPDATE, request);

      let task = await this.checkExistingTask(
        updateRequestValidated.id,
        user.id,
      );

      task = await this.prismaService.task.update({
        where: {
          id: task.id,
          userId: user.id,
        },
        data: {
          task: updateRequestValidated.task,
          status: updateRequestValidated.status,
          isDeleted: updateRequestValidated.isDeleted,
        },
      });

      return this.toTaskResponse(task);
    } catch (error) {
      this.handleError(error);
    }
  }

  async delete(
    user: User,
    id: number,
  ): Promise<{ message: string; success: boolean }> {
    try {
      this.logger.info(
        `TASK SERVICE | DELETE: user_email: ${user.email} delete taskId: ${id}`,
      );

      const task = await this.checkExistingTask(id, user.id);

      await this.prismaService.task.update({
        where: {
          id: task.id,
          userId: user.id,
        },
        data: {
          isDeleted: true,
        },
      });

      return {
        message: 'Tugas berhasil dihapus.',
        success: true,
      };
    } catch (error) {
      this.handleError(error);
    }
  }
}
