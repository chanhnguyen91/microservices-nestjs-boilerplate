import { IsString, IsNotEmpty, IsInt, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsInt()
  roleId: number;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsInt()
  roleId: number;

  @IsEnum(['active', 'locked'])
  status: string;
}
