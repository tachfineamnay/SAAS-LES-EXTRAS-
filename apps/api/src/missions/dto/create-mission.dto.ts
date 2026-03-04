import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from "class-validator";

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
}
