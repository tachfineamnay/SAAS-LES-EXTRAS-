import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import { AuthenticatedUser } from '../auth/types/jwt-payload.type';
import { UserRole } from '@prisma/client';

@Injectable()
export class InvoicesService {
    constructor(private prisma: PrismaService) { }

    async findAll(user: AuthenticatedUser) {
        const whereClause = user.role === UserRole.CLIENT
            ? { booking: { clientId: user.id } }
            : { booking: { talentId: user.id } }; // Or service owner

        // For freelance (TALENT), they might be the talent OR the service owner.
        // Simplified for now: Talent = Recipient of payment (Provider), Client = Payer.
        // Actually, Invoice is generated for the Client to pay? Or for the Freelance to receive?
        // Usually Invoice is from Provider to Client.
        // So Freelance "owns" the invoice (issuer), Client "receives" it.
        // Queries should reflect this.

        return this.prisma.invoice.findMany({
            where: {
                booking: {
                    OR: [
                        { clientId: user.id }, // As client
                        { talentId: user.id }, // As talent
                        { service: { ownerId: user.id } } // As service owner
                    ]
                }
            },
            include: {
                booking: {
                    select: {
                        id: true,
                        scheduledAt: true,
                        status: true,
                        reliefMission: {
                            select: { title: true, client: { select: { email: true, profile: { select: { lastName: true, firstName: true } } } } }
                        },
                        service: {
                            select: { title: true, owner: { select: { email: true, profile: { select: { lastName: true, firstName: true } } } } }
                        },
                        client: {
                            select: { email: true, profile: { select: { lastName: true, firstName: true } } }
                        },
                        talent: {
                            select: { email: true, profile: { select: { lastName: true, firstName: true } } }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async generateInvoicePdf(invoiceId: string): Promise<Buffer> {
        // ... (existing implementation with tweaks if needed)
        // For brevity preserving existing PDF logic but ensuring safety
        const invoice = await this.prisma.invoice.findFirst({
            where: {
                OR: [
                    { id: invoiceId },
                    { bookingId: invoiceId } // handling both just in case
                ]
            },
            include: {
                booking: {
                    include: {
                        reliefMission: { include: { client: true } },
                        service: { include: { owner: true } },
                        talent: true,
                        client: true,
                    },
                },
            },
        });

        if (!invoice) throw new NotFoundException('Invoice not found');
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

            doc.fontSize(12).text(`Référence: ${invoice.invoiceNumber || invoice.id.substring(0, 8).toUpperCase()}`);
            doc.text(`Date: ${invoice.createdAt.toLocaleDateString('fr-FR')}`);
            doc.text(`Statut: ${invoice.status === 'PAID' ? 'PAYÉE' : 'EN ATTENTE'}`);
            doc.moveDown();

            // Client / Provider
            const client = invoice.booking.client;
            const provider = invoice.booking.reliefMission
                ? invoice.booking.talent
                : (invoice.booking.service?.owner ?? invoice.booking.talent);

            doc.text(`Client: ${client?.email ?? 'N/A'}`);
            doc.text(`Prestataire: ${provider?.email ?? 'N/A'}`);
            doc.moveDown();

            // Details
            doc.text(`Description: ${invoice.booking.reliefMission?.title ?? invoice.booking.service?.title ?? 'Prestation'}`);
            doc.text(`Montant: ${invoice.amount.toFixed(2)} €`, { align: 'right' });

            doc.end();
        });
    }
}
