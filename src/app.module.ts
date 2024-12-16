import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { TaskModule } from './modules/task/task.module';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    PassportModule.register({ session: true }),
    TaskModule,
    UserModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
