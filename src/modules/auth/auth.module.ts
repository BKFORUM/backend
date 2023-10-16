import { Module } from '@nestjs/common';
import { UserModule } from '../user';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy, RefreshTokenStrategy } from 'src/strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '@db';
import { MailModule } from '@modules/mail/mail.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({}),
    DatabaseModule,
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
  exports: [AuthService],
})
export class AuthModule {}
