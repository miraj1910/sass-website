-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "expires_at" INTEGER,
ADD COLUMN     "refresh_token" TEXT,
ADD COLUMN     "session_state" TEXT;
