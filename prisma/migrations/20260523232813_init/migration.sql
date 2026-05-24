-- CreateTable
CREATE TABLE "BroadField" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameZh" TEXT NOT NULL,
    "recentMedianEarningsEn" TEXT NOT NULL,
    "recentMedianEarningsVal" INTEGER NOT NULL,
    "primeMedianEarningsEn" TEXT NOT NULL,
    "primeMedianEarningsVal" INTEGER NOT NULL,
    "gradPremiumPercent" DOUBLE PRECISION NOT NULL,
    "gradDegreePercent" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "BroadField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailedField" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameZh" TEXT NOT NULL,
    "broadFieldId" TEXT NOT NULL,
    "primeMedianEarningsVal" INTEGER NOT NULL,
    "unemploymentRecentPercent" DOUBLE PRECISION NOT NULL,
    "unemploymentPrimePercent" DOUBLE PRECISION NOT NULL,
    "degreeProductionChangePercent" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DetailedField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Major" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameZh" TEXT NOT NULL,
    "broadFieldId" TEXT NOT NULL,
    "detailedFieldId" TEXT NOT NULL,
    "specialTag" TEXT,
    "earningsValue" INTEGER,
    "mathDemand" TEXT,
    "physicsDemand" TEXT,
    "chemistryDemand" TEXT,
    "humanitiesDemand" TEXT,

    CONSTRAINT "Major_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameZh" TEXT,
    "countryEn" TEXT NOT NULL,
    "countryZh" TEXT,
    "logoUrl" TEXT,
    "rankingQs" INTEGER,
    "rankingUsNews" INTEGER,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "wikidataId" TEXT,
    "scorecardUnitId" TEXT,
    "averageCost" INTEGER,
    "gradRate" DOUBLE PRECISION,
    "medianSalary" INTEGER,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "School" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameZh" TEXT,
    "universityId" TEXT NOT NULL,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UniversityMajorAssociation" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "schoolId" TEXT,
    "customName" TEXT NOT NULL,
    "customCode" TEXT,
    "standardMajorId" TEXT NOT NULL,
    "mappingScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "isValidated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UniversityMajorAssociation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "University_nameEn_key" ON "University"("nameEn");

-- CreateIndex
CREATE UNIQUE INDEX "University_wikidataId_key" ON "University"("wikidataId");

-- CreateIndex
CREATE UNIQUE INDEX "University_scorecardUnitId_key" ON "University"("scorecardUnitId");

-- AddForeignKey
ALTER TABLE "Major" ADD CONSTRAINT "Major_broadFieldId_fkey" FOREIGN KEY ("broadFieldId") REFERENCES "BroadField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Major" ADD CONSTRAINT "Major_detailedFieldId_fkey" FOREIGN KEY ("detailedFieldId") REFERENCES "DetailedField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityMajorAssociation" ADD CONSTRAINT "UniversityMajorAssociation_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityMajorAssociation" ADD CONSTRAINT "UniversityMajorAssociation_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UniversityMajorAssociation" ADD CONSTRAINT "UniversityMajorAssociation_standardMajorId_fkey" FOREIGN KEY ("standardMajorId") REFERENCES "Major"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
