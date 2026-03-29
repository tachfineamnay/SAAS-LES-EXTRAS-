import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class QuoteLineDto {
  @IsString()
  description!: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @IsString()
  @IsOptional()
  unit?: string; // defaults to "heure"
}

export class CreateQuoteDto {
  @IsString()
  bookingId!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuoteLineDto)
  lines!: QuoteLineDto[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  vatRate?: number; // defaults to 0.20

  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @IsString()
  @IsOptional()
  conditions?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class RejectQuoteDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
