import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('quotes')
@UseGuards(JwtAuthGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) { }

  @Post()
  create(@Body() createQuoteDto: CreateQuoteDto) {
    return this.quotesService.create(createQuoteDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.quotesService.findAll(req.user.role, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotesService.findOne(id);
  }

  @Patch(':id/accept')
  accept(@Param('id') id: string, @Request() req: any) {
    return this.quotesService.accept(id, req.user.id);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Request() req: any) {
    return this.quotesService.reject(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuoteDto: UpdateQuoteDto) {
    // Basic update not implemented fully yet as per plan, focus on workflow
    return this.quotesService.update(+id, updateQuoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quotesService.remove(+id);
  }
}
