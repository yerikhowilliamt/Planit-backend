import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UserService } from './user.service';
import WebResponse, { Paging } from '../../model/web.model';
import { UpdateUserRequest, UserResponse } from '../../model/user.model';
import { Auth } from '../../common/auth/auth.decorator';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UserController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private userService: UserService,
  ) {}

  private toUserResponse<T>(
    data: T,
    statusCode: number,
    paging?: Paging,
  ): WebResponse<T> {
    return {
      data,
      statusCode,
      timestamp: new Date().toString(),
      ...(paging ? { paging } : {}),
    };
  }

  @Get('current')
  @UseGuards(JwtAuthGuard)
  async get(@Auth() user: User): Promise<WebResponse<UserResponse>> {
    try {
      this.logger.info(
        `USER CONTROLLER | GET user: ${JSON.stringify(user.email)}`,
      );

      const result = await this.userService.get(user);

      return this.toUserResponse(result, 200);
    } catch (error) {
      throw error;
    }
  }

  @Patch('current')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Auth() user: User,
    @Body() request: UpdateUserRequest,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<WebResponse<UserResponse>> {
    try {
      this.logger.info(
        `USER CONTROLLER | UPDATE user: ${JSON.stringify(user.email)}, request: ${JSON.stringify(request)}, file: ${JSON.stringify(file.originalname)}`,
      );

      if (!request) {
        throw new NotFoundException('No request data provided');
      }

      const result = await this.userService.update(user, request, file);

      return this.toUserResponse(result, 200);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  @Delete('current')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Auth() user: User,
  ): Promise<WebResponse<{ message: string; success: boolean }>> {
    try {
      this.logger.info(
        `USER CONTROLLER | LOGOUT user: ${JSON.stringify(user.email)}`,
      );

      const result = await this.userService.logout(user);

      return this.toUserResponse(
        {
          message: result.message,
          success: result.success,
        },
        200,
      );
    } catch (error) {
      throw error;
    }
  }
}