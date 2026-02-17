import { Type } from "class-transformer";
import {
  IsISO8601,
  IsNumber,
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
}
