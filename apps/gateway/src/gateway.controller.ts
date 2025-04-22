import { Controller, Get, Post, Put, Delete, Param, Body, Request, UseGuards, UseInterceptors } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CacheInterceptor } from './cache/cache.interceptor';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { MetricsInterceptor } from './interceptors/metrics.interceptor';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller()
@UseGuards(ThrottlerGuard)
@UseInterceptors(ResponseInterceptor, MetricsInterceptor)
export class GatewayController {
  constructor(private gatewayService: GatewayService) {}

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(CacheInterceptor)
  @Get('products')
  proxyGetProducts(@Request() req: any) {
    return this.gatewayService.proxyRequest('product', req.method, '/products', null, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('products/:id')
  proxyGetProduct(@Param('id') id: string, @Request() req: any) {
    return this.gatewayService.proxyRequest('product', req.method, , null, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('products')
  proxyCreateProduct(@Body() body: any, @Request() req: any) {
    return this.gatewayService.proxyRequest('product', req.method, '/products', body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Put('products/:id')
  proxyUpdateProduct(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.gatewayService.proxyRequest('product', req.method, , body, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('products/:id')
  proxyDeleteProduct(@Param('id') id: string, @Request() req: any) {
    return this.gatewayService.proxyRequest('product', req.method, , null, req.user);
  }

  @Post('auth/login')
  proxyLogin(@Body() body: any) {
    return this.gatewayService.proxyRequest('auth', 'POST', '/auth/login', body, null);
  }

  @Post('auth/refresh')
  proxyRefresh(@Body() body: any) {
    return this.gatewayService.proxyRequest('auth', 'POST', '/auth/refresh', body, null);
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/users')
  proxyGetUsers(@Request() req: any) {
    return this.gatewayService.proxyRequest('auth', req.method, '/auth/users', null, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/roles')
  proxyGetRoles(@Request() req: any) {
    return this.gatewayService.proxyRequest('auth', req.method, '/auth/roles', null, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/permissions')
  proxyGetPermissions(@Request() req: any) {
    return this.gatewayService.proxyRequest('auth', req.method, '/auth/permissions', null, req.user);
  }

  @Get('metrics')
  async getMetrics() {
    return this.gatewayService.getMetrics();
  }
}
