import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto, RejectQuoteDto } from './dto/quotes.dto';

interface AuthRequest extends Request {
  user: { id: string; role: string };
}

@Controller('quotes')
@UseGuards(JwtAuthGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  async generate(@Req() req: AuthRequest, @Body() dto: CreateQuoteDto) {
    return this.quotesService.generateQuote(req.user.id, dto);
  }

  @Patch(':id/accept')
  async accept(@Req() req: AuthRequest, @Param('id') id: string) {
    return this.quotesService.acceptQuote(id, req.user.id);
  }

  @Patch(':id/reject')
  async reject(
    @Req() req: AuthRequest,
    @Param('id') id: string,
    @Body() dto: RejectQuoteDto,
  ) {
    return this.quotesService.rejectQuote(id, req.user.id, dto);
  }

  @Get('booking/:bookingId')
  async getByBooking(@Param('bookingId') bookingId: string) {
    return this.quotesService.getQuotesByBooking(bookingId);
  }

  @Get('booking/:bookingId/prefill')
  async getPrefill(
    @Req() req: AuthRequest,
    @Param('bookingId') bookingId: string,
  ) {
    return this.quotesService.getQuotePrefill(bookingId, req.user.id);
  }
}
