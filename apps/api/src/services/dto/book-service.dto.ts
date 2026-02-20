import { IsDateString, IsOptional, IsString } from "class-validator";

export class BookServiceDto {
    @IsDateString()
    date!: string;

    @IsOptional()
    @IsString()
    message?: string;
}
