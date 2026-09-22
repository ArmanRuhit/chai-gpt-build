-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "forkedAtMessageId" TEXT,
ADD COLUMN     "parentConversationId" TEXT;

-- CreateIndex
CREATE INDEX "Conversation_parentConversationId_idx" ON "Conversation"("parentConversationId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_parentConversationId_fkey" FOREIGN KEY ("parentConversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
