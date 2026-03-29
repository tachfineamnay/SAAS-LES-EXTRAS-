-- CreateEnum: QuoteStatus
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'REVISED');

-- CreateEnum: MessageType
CREATE TYPE "MessageType" AS ENUM ('USER', 'SYSTEM');

-- AlterEnum: BookingStatus — add new values
ALTER TYPE "BookingStatus" ADD VALUE 'QUOTE_SENT';
ALTER TYPE "BookingStatus" ADD VALUE 'QUOTE_ACCEPTED';
ALTER TYPE "BookingStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "BookingStatus" ADD VALUE 'AWAITING_PAYMENT';
ALTER TYPE "BookingStatus" ADD VALUE 'PAID';

-- AlterTable: Message — add type and metadata
ALTER TABLE "Message" ADD COLUMN "type" "MessageType" NOT NULL DEFAULT 'USER';
ALTER TABLE "Message" ADD COLUMN "metadata" JSONB;

-- AlterTable: Conversation — add bookingId
ALTER TABLE "Conversation" ADD COLUMN "bookingId" TEXT;
CREATE UNIQUE INDEX "Conversation_bookingId_key" ON "Conversation"("bookingId");
CREATE INDEX "Conversation_bookingId_idx" ON "Conversation"("bookingId");
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: Quote
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "issuedBy" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotalHT" DOUBLE PRECISION NOT NULL,
    "vatRate" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "vatAmount" DOUBLE PRECISION NOT NULL,
    "totalTTC" DOUBLE PRECISION NOT NULL,
    "validUntil" TIMESTAMP(3),
    "conditions" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable: QuoteLine
CREATE TABLE "QuoteLine" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'heure',
    "totalHT" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "QuoteLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Quote_bookingId_idx" ON "Quote"("bookingId");
CREATE INDEX "Quote_issuedBy_idx" ON "Quote"("issuedBy");
CREATE INDEX "QuoteLine_quoteId_idx" ON "QuoteLine"("quoteId");

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_issuedBy_fkey" FOREIGN KEY ("issuedBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuoteLine" ADD CONSTRAINT "QuoteLine_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
