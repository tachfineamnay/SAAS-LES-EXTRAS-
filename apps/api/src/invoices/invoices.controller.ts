import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { InvoicesService } from './invoices.service';

@Controller('invoices')
export class InvoicesController {
    constructor(private readonly invoicesService: InvoicesService) { }

    @Get(':id/download')
    async downloadInvoice(@Param('id') id: string, @Res() res: Response) {
        const pdfBuffer = await this.invoicesService.generateInvoicePdf(id);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=invoice-${id}.pdf`,
            'Content-Length': pdfBuffer.length,
        });

        res.end(pdfBuffer);
    }
}
