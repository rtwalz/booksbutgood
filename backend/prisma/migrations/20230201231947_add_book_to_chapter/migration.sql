-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "bookId" INTEGER NOT NULL DEFAULT 2;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;