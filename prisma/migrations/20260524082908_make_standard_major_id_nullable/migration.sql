-- DropForeignKey
ALTER TABLE "UniversityMajorAssociation" DROP CONSTRAINT "UniversityMajorAssociation_standardMajorId_fkey";

-- AlterTable
ALTER TABLE "UniversityMajorAssociation" ALTER COLUMN "standardMajorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "UniversityMajorAssociation" ADD CONSTRAINT "UniversityMajorAssociation_standardMajorId_fkey" FOREIGN KEY ("standardMajorId") REFERENCES "Major"("id") ON DELETE SET NULL ON UPDATE CASCADE;
