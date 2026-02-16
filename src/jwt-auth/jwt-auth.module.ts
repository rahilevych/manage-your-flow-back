import { Module } from '@nestjs/common';
import { JwtAuthService } from './jwt-auth.service';
import { JwtAuthController } from './jwt-auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { TokensModule } from 'src/tokens/tokens.module';

import { MembersModule } from 'src/members/members.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({}),
    TokensModule,
    MembersModule,
  ],
  providers: [JwtAuthService, JwtStrategy],
  controllers: [JwtAuthController],
})
export class JwtAuthModule {}
