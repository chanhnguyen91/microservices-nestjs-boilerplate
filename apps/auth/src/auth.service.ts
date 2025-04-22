import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'libs/common/src/prisma/prisma.service';
import { RabbitMQService } from 'libs/common/src/rabbit-mq/rabbit-mq.service';
import { RedisService } from 'libs/common/src/redis/redis.service';
import { LoggingService } from 'libs/common/src/logging/logging.service';
import { JwtService } from '@nestjs/jwt';
import { compareSync, hashSync } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from './dto/auth.dto';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { from, Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private rabbitMQService: RabbitMQService,
    private redisService: RedisService,
    private loggingService: LoggingService,
    private jwtService: JwtService,
  ) {}

  login(loginDto: LoginDto): Observable<any> {
    return from(
      this.prisma.auth_users.findUnique({
        where: { username: loginDto.username },
        include: { role: true },
      }),
    ).pipe(
      mergeMap((user) => {
        if (!user || !compareSync(loginDto.password, user.password)) {
          this.loggingService.error('Invalid credentials', { username: loginDto.username });
          throw new UnauthorizedException('Invalid credentials');
        }
        if (user.status === 'locked') {
          this.loggingService.error('Account locked', { username: loginDto.username });
          throw new ForbiddenException('Account is locked');
        }

        const payload = { sub: user.id, username: user.username, role: user.roleId };
        const jti = uuidv4();
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(
          { sub: user.id, jti },
          { secret: process.env.REFRESH_TOKEN_SECRET, expiresIn: '7d' },
        );

        return from(
          this.prisma.auth_sessions.create({
            data: {
              userId: user.id,
              jti,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          }),
        ).pipe(
          map(() => {
            this.loggingService.info('Login successful', { username: loginDto.username });
            return {
              access_token: accessToken,
              refresh_token: refreshToken,
            };
          }),
        );
      }),
    );
  }

  refreshToken(refreshToken: string): Observable<any> {
    return from(
      this.jwtService.verifyAsync(refreshToken, { secret: process.env.REFRESH_TOKEN_SECRET }),
    ).pipe(
      mergeMap((payload) =>
        this.prisma.auth_sessions.findUnique({ where: { jti: payload.jti } }).then((session) => {
          if (!session || session.expiresAt < new Date()) {
            this.loggingService.error('Invalid refresh token', { jti: payload.jti });
            throw new UnauthorizedException('Invalid refresh token');
          }
          return this.prisma.auth_users.findUnique({
            where: { id: payload.sub },
            include: { role: true },
          });
        }),
      ),
      mergeMap((user) => {
        if (!user) {
          this.loggingService.error('User not found', { userId: user.id });
          throw new UnauthorizedException('User not found');
        }
        if (user.status === 'locked') {
          this.loggingService.error('Account locked', { username: user.username });
          throw new ForbiddenException('Account is locked');
        }

        const payload = { sub: user.id, username: user.username, role: user.roleId };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
        this.loggingService.info('Token refreshed', { username: user.username });
        return from([{
          access_token: accessToken,
          refresh_token: refreshToken,
        }]);
      }),
    );
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_SECRET });
      const user = await this.prisma.auth_users.findUnique({
        where: { id: payload.sub },
        include: { role: { include: { permissions: true } } },
      });

      if (!user || user.status === 'locked') {
        this.loggingService.error('User not found or locked', { userId: payload.sub });
        throw new ForbiddenException('User not found or locked');
      }

      this.loggingService.info('Token validated', { username: user.username });
      return {
        userId: user.id,
        username: user.username,
        roleId: user.roleId,
        permissions: user.role.permissions.map((p) => p.name),
      };
    } catch (error) {
      this.loggingService.error('Invalid token', { error: error.message });
      throw new UnauthorizedException('Invalid token');
    }
  }

  createRole(createRoleDto: CreateRoleDto): Observable<any> {
    return from(
      this.prisma.auth_roles.create({
        data: createRoleDto,
      }),
    ).pipe(
      map((role) => {
        this.loggingService.info('Role created', { roleName: role.name });
        return role;
      }),
    );
  }

  getRoles(): Observable<any> {
    return from(this.prisma.auth_roles.findMany({ include: { permissions: true } }));
  }

  updateRole(id: number, updateRoleDto: UpdateRoleDto): Observable<any> {
    return from(
      this.prisma.auth_roles.update({
        where: { id },
        data: updateRoleDto,
      }),
    ).pipe(
      map((role) => {
        this.loggingService.info('Role updated', { roleId: id });
        return role;
      }),
    );
  }

  deleteRole(id: number): Observable<any> {
    return from(this.prisma.auth_roles.delete({ where: { id } })).pipe(
      map(() => {
        this.loggingService.info('Role deleted', { roleId: id });
        return { message: 'Role deleted' };
      }),
    );
  }

  createPermission(createPermissionDto: CreatePermissionDto): Observable<any> {
    return from(
      this.prisma.auth_permissions.create({
        data: createPermissionDto,
      }),
    ).pipe(
      map((permission) => {
        this.loggingService.info('Permission created', { permissionName: permission.name });
        return permission;
      }),
    );
  }

  getPermissions(): Observable<any> {
    return from(this.prisma.auth_permissions.findMany());
  }

  updatePermission(id: number, updatePermissionDto: UpdatePermissionDto): Observable<any> {
    return from(
      this.prisma.auth_permissions.update({
        where: { id },
        data: updatePermissionDto,
      }),
    ).pipe(
      map((permission) => {
        this.loggingService.info('Permission updated', { permissionId: id });
        return permission;
      }),
    );
  }

  deletePermission(id: number): Observable<any> {
    return from(this.prisma.auth_permissions.delete({ where: { id } })).pipe(
      map(() => {
        this.loggingService.info('Permission deleted', { permissionId: id });
        return { message: 'Permission deleted' };
      }),
    );
  }

  createUser(createUserDto: CreateUserDto): Observable<any> {
    return from(
      this.prisma.auth_users.create({
        data: {
          ...createUserDto,
          password: hashSync(createUserDto.password, 10),
        },
      }),
    ).pipe(
      mergeMap((user) => {
        this.rabbitMQService.emit('authMicroserviceQueue', 'auth.created', { userId: user.id, username: user.username });
        this.loggingService.info('User created', { username: user.username });
        return from([user]);
      }),
    );
  }

  getUsers(): Observable<any> {
    return from(this.prisma.auth_users.findMany({ include: { role: true } }));
  }

  updateUser(id: number, updateUserDto: UpdateUserDto): Observable<any> {
    return from(
      this.prisma.auth_users.update({
        where: { id },
        data: updateUserDto,
      }),
    ).pipe(
      map((user) => {
        this.loggingService.info('User updated', { userId: id });
        return user;
      }),
    );
  }

  deleteUser(id: number): Observable<any> {
    return from(this.prisma.auth_users.delete({ where: { id } })).pipe(
      map(() => {
        this.loggingService.info('User deleted', { userId: id });
        return { message: 'User deleted' };
      }),
    );
  }
}
