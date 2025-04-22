import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdatePermissionDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
