import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsISO8601,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
  ValidateNested,
} from "class-validator";

export class MissionSlotDto {
  @IsString()
  date!: string;

  @IsString()
  heureDebut!: string;

  @IsString()
  heureFin!: string;
}

export class CreateMissionDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsISO8601()
  dateStart!: string;

  @IsISO8601()
  dateEnd!: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  hourlyRate!: number;

  @IsString()
  @MinLength(2)
  address!: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === "true")
  isRenfort?: boolean;

  // Extended SOS Renfort fields
  @IsOptional()
  @IsString()
  metier?: string;

  @IsOptional()
  @IsString()
  @IsIn(["JOUR", "NUIT"])
  shift?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MissionSlotDto)
  slots?: MissionSlotDto[];

  // SOS Renfort v2 — contexte clinique
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  establishmentType?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetPublic?: string[];

  @IsOptional()
  @IsString()
  unitSize?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === "true")
  diplomaRequired?: boolean;

  // SOS Renfort v2 — logistique
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === "true")
  hasTransmissions?: boolean;

  @IsOptional()
  @IsString()
  transmissionTime?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  perks?: string[];

  @IsOptional()
  @IsString()
  exactAddress?: string;

  @IsOptional()
  @IsString()
  accessInstructions?: string;
}
