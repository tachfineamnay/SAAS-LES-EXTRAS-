import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserRole, UserStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { JwtPayload } from "./types/jwt-payload.type";

type AuthResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException("Email already in use");
    }

    const password = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password,
        role: dto.role,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return {
      accessToken: await this.signToken(user.id, user.email, user.role),
      user,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        password: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (user.status === UserStatus.BANNED) {
      throw new ForbiddenException("Account is banned");
    }

    return {
      accessToken: await this.signToken(user.id, user.email, user.role),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  private async signToken(
    id: string,
    email: string,
    role: UserRole,
  ): Promise<string> {
    const payload: JwtPayload = {
      sub: id,
      email,
      role,
    };
    return this.jwtService.signAsync(payload);
  }
}
