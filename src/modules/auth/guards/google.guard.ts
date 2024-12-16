import { ExecutionContext, Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext) {
    try {
      const activate = (await super.canActivate(context)) as boolean;

      return activate;
    } catch (error) {
      console.error('Error in GoogleAuthGuard:', error);
      throw new InternalServerErrorException(error);
    }
  }
}