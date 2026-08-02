import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class LocationDto {
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
