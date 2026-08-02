import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma.service';
import { JwtPayload } from './auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(
        private configService: ConfigService,
        private prisma: PrismaService
      ) {
        super({
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          ignoreExpiration: false,
          secretOrKey: configService.get('JWT_SECRET')
        });
      }

      async validate(payload: JwtPayload) {
        // Refresh-токен нельзя использовать как Bearer для доступа к API
        if (payload.type !== 'access') throw new UnauthorizedException('Недействительный токен');

        return this.prisma.user.findUnique({ where: { id: +payload.id } });
      }

}
