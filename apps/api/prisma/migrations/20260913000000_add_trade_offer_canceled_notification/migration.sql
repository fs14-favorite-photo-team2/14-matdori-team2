-- Notify proposers whose pending offers are swept when a listing sells out.
ALTER TYPE "NotificationType" ADD VALUE 'TRADE_OFFER_CANCELED';
