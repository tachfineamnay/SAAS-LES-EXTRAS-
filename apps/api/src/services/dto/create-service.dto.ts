import { ServiceType } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from "class-validator";

export class CreateServiceDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  price!: number;

  @IsEnum(ServiceType)
  type!: ServiceType;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity!: number;
}
