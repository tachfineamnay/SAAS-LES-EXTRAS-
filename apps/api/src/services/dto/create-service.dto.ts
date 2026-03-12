import { ServiceType } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
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
  @Min(0)
  price!: number;

  @IsEnum(ServiceType)
  type!: ServiceType;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity!: number;

  // Extended atelier fields
  @IsOptional()
  @IsString()
  pricingType?: string; // "SESSION" | "PER_PARTICIPANT" | "QUOTE"

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePerParticipant?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(30)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  publicCible?: string[];

  @IsOptional()
  @IsString()
  materials?: string;

  @IsOptional()
  @IsString()
  objectives?: string;

  @IsOptional()
  @IsString()
  methodology?: string;

  @IsOptional()
  @IsString()
  evaluation?: string;

  @IsOptional()
  slots?: Array<{ date: string; heureDebut: string; heureFin: string }>;
}
