import { JwtPayloadDto } from './jwt-payload.dto';

export class RefreshTokenPayloadDto extends JwtPayloadDto {
  refreshToken: string;
}
