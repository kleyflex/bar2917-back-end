import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { hash, verify } from 'argon2';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { JwtPayload } from './auth.interface';
import { AuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private userService: UserService) {}

  async login(dto: AuthDto){
    const user = await this.validateUser(dto)

    const tokens = await this.issueTokens(user.id);

    return {
      user: this.returnUserFields(user),
      ...tokens
    };
  }

  async getNewTokens(refreshToken: string) {
    let result: JwtPayload;

    try {
      result = await this.jwt.verifyAsync<JwtPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Недействительный refresh-токен');
    }

    // Access-токен нельзя использовать для обновления пары токенов
    if (result.type !== 'refresh') throw new UnauthorizedException('Недействительный refresh-токен');

    const user = await this.userService.byId(result.id, {
      isAdmin: true
    })

    const tokens = await this.issueTokens(user.id);

    return {
      user: this.returnUserFields(user),
      ...tokens
    };
  }
  

  async register(dto: AuthDto) {
    const oldUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      }
    })

    if (oldUser) throw new BadRequestException('Пользователь уже существует')

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: '',
        password: await hash(dto.password)
      }
    })

    const tokens = await this.issueTokens(user.id);

    return {
      user: this.returnUserFields(user),
      ...tokens
    };
  }

  private async issueTokens(userId: number) {
    const accessToken = this.jwt.sign({ id: userId, type: 'access' }, {
      expiresIn: '1h',
    });

    const refreshToken = this.jwt.sign({ id: userId, type: 'refresh' }, {
      expiresIn: '30d',
    });

    return {accessToken, refreshToken}
  }

  private returnUserFields(user: Partial<User>) {
    return {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    }
  }
  
  private async validateUser(dto:AuthDto){
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      }
    })

    // Единый ответ для несуществующего email и неверного пароля — защита от перебора пользователей
    if (!user) throw new UnauthorizedException('Неверный email или пароль')

    const isValid = await verify(user.password, dto.password)

    if(!isValid) throw new UnauthorizedException('Неверный email или пароль')

    return user
  }

}
