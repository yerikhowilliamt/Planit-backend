import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, string>
  implements OnModuleInit
{
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {
    super({
      log: [
        {
          emit: 'event',
          level: 'error',
        },
        {
          emit: 'event',
          level: 'warn',
        },
        {
          emit: 'event',
          level: 'query',
        },
      ],
    });
  }

  onModuleInit() {
    this.$on('info', (e) => {
      this.logger.info('Prisma Info: ', e);
    });
    this.$on('warn', (e) => {
      this.logger.warn('Prisma Warning: ', e);
    });
    this.$on('error', (e) => {
      this.logger.error('Prisma Error: ', e);
    });
    this.$on('query', (e) => {
      this.logger.debug('Prisma Query: ', e);
    });
  }
}