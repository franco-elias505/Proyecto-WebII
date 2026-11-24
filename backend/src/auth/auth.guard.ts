import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  SetMetadata,
  createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { AuthRepository } from './auth.repository';

export type SessionUser = { id: number; rol: 'instructor' | 'estudiante' };
type AuthRequest = Request & { user: SessionUser };

export const Roles = (...roles: SessionUser['rol'][]) =>
  SetMetadata('roles', roles);
export type ResourceKind = 'curso' | 'leccion' | 'pregunta';
export const ResourceAccess = (
  kind: ResourceKind,
  access: 'owner' | 'enrolled',
) => SetMetadata('resourceAccess', { kind, access });
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): SessionUser =>
    context.switchToHttp().getRequest<AuthRequest>().user,
);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly repository: AuthRepository,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const parts = request.headers.authorization?.split(' ');
    if (parts?.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
      throw new UnauthorizedException('Se requiere un token Bearer.');
    }
    let id: number;
    try {
      const payload = await this.jwt.verifyAsync<{ sub: number }>(parts[1], {
        algorithms: ['HS256'],
      });
      id = payload.sub;
      if (!Number.isSafeInteger(id) || id <= 0)
        throw new Error('Invalid subject');
    } catch {
      throw new UnauthorizedException('Token inválido o vencido.');
    }
    const user = await this.repository.findSessionUser(id);
    if (!user) throw new UnauthorizedException('Usuario no disponible.');
    request.user = user;
    const roles = this.reflector.getAllAndOverride<SessionUser['rol'][]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );
    if (roles && !roles.includes(user.rol)) {
      throw new ForbiddenException('Tu rol no tiene acceso a este recurso.');
    }
    const resource = this.reflector.getAllAndOverride<{
      kind: ResourceKind;
      access: 'owner' | 'enrolled';
    }>('resourceAccess', [context.getHandler(), context.getClass()]);
    if (resource) {
      const rawId = request.params.id;
      if (
        typeof rawId !== 'string' ||
        !/^[1-9]\d*$/.test(rawId) ||
        Number(rawId) > 2147483647
      ) {
        throw new BadRequestException('ID de recurso inválido.');
      }
      const course = await this.repository.resourceCourse(
        resource.kind,
        Number(rawId),
      );
      if (!course) throw new NotFoundException('Recurso no encontrado.');
      const allowed =
        resource.access === 'owner'
          ? course.instructor_id === user.id
          : await this.repository.isEnrolled(course.id, user.id);
      if (!allowed)
        throw new ForbiddenException('No tienes acceso a este recurso.');
    }
    return true;
  }
}
