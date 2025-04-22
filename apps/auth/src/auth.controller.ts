import { Controller, Post, Body, Get, Put, Delete, Param, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { CreatePermissionDto, UpdatePermissionDto } from './dto/permission.dto';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { Permissions } from './decorators/permissions.decorator';
import { ResponseInterceptor } from './interceptors/response.interceptor';

@Controller('auth')
@UseInterceptors(ResponseInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  @Post('validate')
  async validateToken(@Body() body: { token: string }) {
    return this.authService.validateToken(body.token);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage:roles')
  @Post('roles')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.authService.createRole(createRoleDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage:roles')
  @Get('roles')
  async getRoles() {
    return this.authService.getRoles();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage:roles')
  @Put('roles/:id')
  async updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.authService.updateRole(+id, updateRoleDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage:roles')
  @Delete('roles/:id')
  async deleteRole(@Param('id') id: string) {
    return this.authService.deleteRole(+id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage:permissions')
  @Post('permissions')
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.authService.createPermission(createPermissionDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage:permissions')
  @Get('permissions')
  async getPermissions() {
    return this.authService.getPermissions();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage:permissions')
  @Put('permissions/:id')
  async updatePermission(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.authService.updatePermission(+id, updatePermissionDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage:permissions')
  @Delete('permissions/:id')
  async deletePermission(@Param('id') id: string) {
    return this.authService.deletePermission(+id);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage:users')
  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage:users')
  @Get('users')
  async getUsers() {
    return this.authService.getUsers();
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage:users')
  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.updateUser(+id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('manage:users')
  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(+id);
  }
}
