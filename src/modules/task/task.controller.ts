import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
  CreateTaskRequest,
  TaskResponse,
  UpdateTaskRequest,
} from '../../model/task.model';
import WebResponse, { Paging } from '../../model/web.model';
import { Logger } from 'winston';
import { TaskService } from './task.service';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Auth } from '../../common/auth/auth.decorator';

@Controller('users/:userId/tasks')
export class TaskController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private taskService: TaskService,
  ) {}

  private toTaskResponse<T>(
    data: T,
    statusCode: number,
    paging?: Paging,
  ): WebResponse<T> {
    return {
      data,
      ...(paging ? { paging } : {}),
      statusCode,
      timestamp: new Date().toString(),
    };
  }

  private handleError(error: Error): never {
    if (error instanceof UnauthorizedException) {
      throw error;
    }
    this.logger.error(error.message, error.stack);
    throw error;
  }

  private checkAuthorization(userId: number, user: User): void {
    if (user.id !== userId) {
      this.logger.info(`Unauthorized access attempt: user_id ${userId}`);
      throw new UnauthorizedException(
        'Anda tidak diizinkan untuk mengakses endpoint tugas.',
      );
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Auth() user: User,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() request: CreateTaskRequest,
  ): Promise<WebResponse<TaskResponse>> {
    try {
      request.userId = userId;
      this.checkAuthorization(userId, user);

      const result = await this.taskService.create(user, request);
      return this.toTaskResponse(result, 201);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(
    @Auth() user: User,
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<WebResponse<TaskResponse[]>> {
    try {
      user.id = userId;
      this.checkAuthorization(userId, user);

      const result = await this.taskService.list(user, limit, page);

      return this.toTaskResponse(result.data, 200, result.paging);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get(':taskId')
  @UseGuards(JwtAuthGuard)
  async get(
    @Auth() user: User,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ): Promise<WebResponse<TaskResponse>> {
    try {
      user.id = userId;
      this.checkAuthorization(userId, user);

      const result = await this.taskService.get(user, taskId);

      return this.toTaskResponse(result, 200);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Put(':taskId')
  @UseGuards(JwtAuthGuard)
  async update(
    @Auth() user: User,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() request: UpdateTaskRequest,
  ): Promise<WebResponse<TaskResponse>> {
    try {
      request.id = taskId;
      this.checkAuthorization(userId, user);

      const result = await this.taskService.update(user, request);

      return this.toTaskResponse(result, 200);
    } catch (error) {
      this.handleError(error);
    }
  }

  @Delete(':taskId')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Auth() user: User,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('taskId', ParseIntPipe) taskId: number,
  ): Promise<WebResponse<{ message: string; success: boolean }>> {
    try {
      user.id = userId;
      this.checkAuthorization(userId, user);

      const result = await this.taskService.delete(user, taskId);

      return this.toTaskResponse(
        {
          message: result.message,
          success: result.success,
        },
        200,
      );
    } catch (error) {
      this.handleError(error);
    }
  }
}
