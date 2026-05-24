CREATE TABLE "InstitutionProgramField" (
    "id" TEXT NOT NULL,
    "universityId" TEXT,
    "unitId" TEXT NOT NULL,
    "cipCode" TEXT NOT NULL,
    "displayTitle" TEXT NOT NULL,
    "standardMajorId" TEXT,
    "degreeLevel" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "programOffered" INTEGER,
    "completionsTotal" INTEGER,
    "activityStatus" TEXT NOT NULL,
    "valueStatus" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "sourceTable" TEXT NOT NULL,
    "sourceVariable" TEXT NOT NULL,
    "releaseKey" TEXT NOT NULL,
    "verificationId" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InstitutionProgramField_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "InstitutionProgramField_verificationId_key" ON "InstitutionProgramField"("verificationId");
CREATE UNIQUE INDEX "InstitutionProgramField_unitId_cipCode_degreeLevel_releaseKey_sourceType_key"
    ON "InstitutionProgramField"("unitId", "cipCode", "degreeLevel", "releaseKey", "sourceType");
CREATE INDEX "InstitutionProgramField_unitId_degreeLevel_idx" ON "InstitutionProgramField"("unitId", "degreeLevel");
CREATE INDEX "InstitutionProgramField_universityId_degreeLevel_idx" ON "InstitutionProgramField"("universityId", "degreeLevel");
CREATE INDEX "InstitutionProgramField_cipCode_idx" ON "InstitutionProgramField"("cipCode");
CREATE INDEX "InstitutionProgramField_standardMajorId_idx" ON "InstitutionProgramField"("standardMajorId");

ALTER TABLE "InstitutionProgramField" ADD CONSTRAINT "InstitutionProgramField_universityId_fkey"
    FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InstitutionProgramField" ADD CONSTRAINT "InstitutionProgramField_cipCode_fkey"
    FOREIGN KEY ("cipCode") REFERENCES "CipCode"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InstitutionProgramField" ADD CONSTRAINT "InstitutionProgramField_standardMajorId_fkey"
    FOREIGN KEY ("standardMajorId") REFERENCES "Major"("id") ON DELETE SET NULL ON UPDATE CASCADE;
