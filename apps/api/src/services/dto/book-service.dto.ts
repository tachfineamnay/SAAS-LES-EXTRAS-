import { Type } from "class-transformer";
import { IsDateString, IsInt, IsOptional, IsString, Min } from "class-validator";

export class BookServiceDto {
  @IsDateString()
  date!: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  nbParticipants?: number;
}
