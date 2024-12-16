import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private prismaService: PrismaService) {}

  async use(req: any, res: any, next: (error?: any) => void) {
    try {
      const authorizationHeader = req.headers['authorization'];

      if (!authorizationHeader) {
        return next();
      }

      const [bearer, accessToken] = authorizationHeader.split(' ');

      if (bearer !== 'Bearer' || !accessToken) {
        throw new HttpException('Invalid token format', HttpStatus.FORBIDDEN);
      }

      const user = await this.prismaService.user.findFirst({
        where: {
          accessToken: accessToken,
        },
      });

      if (user) {
        req.user = user;
      }

      return next();
    } catch (error) {
      return next(new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED));
    }
  }
}