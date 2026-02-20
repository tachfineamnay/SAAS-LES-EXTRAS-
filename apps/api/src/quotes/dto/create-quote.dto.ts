import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateQuoteDto {
    @IsString()
    @IsNotEmpty()
    establishmentId!: string;

    @IsString()
    @IsNotEmpty()
    freelanceId!: string;

    @IsString()
    @IsOptional()
    reliefMissionId?: string;

    @IsNumber()
    @IsNotEmpty()
    amount!: number;

    @IsString()
    @IsNotEmpty()
    description!: string;

    @IsDateString()
    @IsNotEmpty()
    startDate!: string;

    @IsDateString()
    @IsNotEmpty()
    endDate!: string;
}
