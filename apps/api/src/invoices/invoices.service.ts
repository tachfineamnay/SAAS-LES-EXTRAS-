import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class InvoicesService {
    constructor(private prisma: PrismaService) { }

    async generateInvoicePdf(invoiceId: string): Promise<Buffer> {
        const invoice = await this.prisma.invoice.findFirst({
            where: {
                // We might be passing bookingId or invoiceId. Let's assume URL structure is /invoices/:id/download.
                // It's safer to look up by id first, if likely to be passed directly.
                // Or if the URL stored in DB is /invoices/BOOKING_ID.pdf, maybe we pass bookingId?
                // Let's implement lookup by both just in case, or stick to bookingId if :id refers to booking.
                // Actually, the route is /invoices/:id/download. :id is likely the Invoice ID or Booking ID.
                // In BookingService we stored url as `/invoices/${booking.id}.pdf`.
                // So :id is likely booking.id.
                bookingId: invoiceId,
            },
            include: {
                booking: {
                    include: {
                        reliefMission: {
                            include: {
                                client: true,
                            },
                        },
                        service: {
                            include: {
                                owner: true,
                            },
                        },
                        talent: true,
                        client: true,
                    },
                },
            },
        });

        if (!invoice) {
            // Fallback: try finding by Invoice ID
            const byId = await this.prisma.invoice.findUnique({
                where: { id: invoiceId },
                include: { booking: { include: { reliefMission: { include: { client: true } }, service: { include: { owner: true } }, talent: true, client: true } } }
            });
            if (!byId) throw new NotFoundException('Invoice not found');
            return this.createPdf(byId);
        }

        return this.createPdf(invoice);
    }

    private createPdf(invoice: any): Promise<Buffer> {
        return new Promise((resolve) => {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            // Header
            doc.fontSize(20).text('FACTURE', { align: 'center' });
            doc.moveDown();

            doc.fontSize(12).text(`Référence: ${invoice.id.substring(0, 8).toUpperCase()}`);
            doc.text(`Date: ${invoice.createdAt.toLocaleDateString('fr-FR')}`);
            doc.moveDown();

            // Client / Provider
            const client = invoice.booking.client;
            const provider = invoice.booking.reliefMission
                ? invoice.booking.talent
                : invoice.booking.service?.owner;

            doc.text(`Client: ${client?.email ?? 'N/A'}`);
            doc.text(`Prestataire: ${provider?.email ?? 'N/A'}`);
            doc.moveDown();

            // Details
            doc.text(`Description: ${invoice.booking.reliefMission?.title ?? invoice.booking.service?.title ?? 'Prestation'}`);
            doc.text(`Montant: ${invoice.amount.toFixed(2)} €`);

            doc.end();
        });
    }
}
