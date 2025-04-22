import { IsString, IsNotEmpty } from 'class-validator';

export class ProxyDto {
  @IsString()
  @IsNotEmpty()
  service: string;

  @IsString()
  @IsNotEmpty()
  path: string;
}
