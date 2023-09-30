import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../user';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../user/dto';
import { compareHash, hashPassword } from 'src/common';
import { getUsersPayload } from './dto/getUserPayload.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  login = async (username: string, password: string) => {
    const user = await this.userService.findByUsername(username);

    if (!user) throw new BadRequestException('User does not exist');

    const passwordMatches = await compareHash(password, user.password);

    if (!passwordMatches)
      throw new BadRequestException('Password is incorrect');
    const tokens = await this.getTokens(user);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  };

  signUp = async (createUserDto: CreateUserDto) => {
    const userExists = await this.userService.findByUsername(
      createUserDto.username,
    );
    if (userExists) {
      throw new BadRequestException('User already exists');
    }

    const hash = await hashPassword(createUserDto.password);
    const newUser = await this.userService.createUser({
      ...createUserDto,
      password: hash,
    });

    const tokens = await this.getTokens(newUser);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);
    return tokens;
  };

  async logout(userId: string) {
    return this.userService.updateUser(userId, { refreshToken: null });
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await hashPassword(refreshToken);
    await this.userService.updateUser(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userService.findById(userId);

    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');

    const refreshTokenMatches = await compareHash(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user);

    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async getTokens(userData: getUsersPayload) {
    const user = {
      username: userData.username,
      name: userData.fullName,
      roles: userData.roles.map((role) => role.role.name),
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userData.id,
          ...user,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userData.id,
          ...user,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
