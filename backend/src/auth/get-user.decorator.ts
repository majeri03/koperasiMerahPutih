import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadDto } from './dto/jwt-payload.dto';

// Definisikan tipe untuk request agar kita bisa mengakses req.user dengan aman
interface RequestWithUser extends Request {
  user: JwtPayloadDto;
}

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayloadDto => {
    // Gunakan tipe RequestWithUser yang sudah kita definisikan
    const request: RequestWithUser = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
