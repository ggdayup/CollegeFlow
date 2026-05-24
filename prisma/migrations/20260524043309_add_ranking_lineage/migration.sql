-- CreateTable
CREATE TABLE "UniversityRankingLineage" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "rankInteger" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "tieCount" INTEGER NOT NULL DEFAULT 0,
    "sourceUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UniversityRankingLineage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UniversityRankingLineage_universityId_year_source_isGlobal_key" ON "UniversityRankingLineage"("universityId", "year", "source", "isGlobal");

-- AddForeignKey
ALTER TABLE "UniversityRankingLineage" ADD CONSTRAINT "UniversityRankingLineage_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;
