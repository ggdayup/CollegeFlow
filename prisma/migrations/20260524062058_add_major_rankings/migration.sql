-- CreateTable
CREATE TABLE "MajorRanking" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "standardMajorId" TEXT NOT NULL,
    "rankInteger" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "verificationId" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MajorRanking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MajorRanking_universityId_standardMajorId_year_source_key" ON "MajorRanking"("universityId", "standardMajorId", "year", "source");

-- AddForeignKey
ALTER TABLE "MajorRanking" ADD CONSTRAINT "MajorRanking_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MajorRanking" ADD CONSTRAINT "MajorRanking_standardMajorId_fkey" FOREIGN KEY ("standardMajorId") REFERENCES "Major"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
