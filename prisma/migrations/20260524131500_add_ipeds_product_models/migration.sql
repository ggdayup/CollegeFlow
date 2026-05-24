-- ADR-005 product-domain models. Raw/meta IPEDS tables remain SQL-managed outside Prisma.
CREATE TABLE "UniversityExternalIdentifier" (
    "id" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "identifierType" TEXT NOT NULL,
    "identifierValue" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "verificationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UniversityExternalIdentifier_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MetricDefinition" (
    "metricKey" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "labelZh" TEXT,
    "descriptionEn" TEXT,
    "descriptionZh" TEXT,
    "valueType" TEXT NOT NULL,
    "unit" TEXT,
    "displayFormat" TEXT NOT NULL,
    "higherIsBetter" BOOLEAN,
    "sourceSystem" TEXT NOT NULL,
    "sourceTable" TEXT,
    "sourceVariable" TEXT,
    "requiredDimensions" JSONB,
    "missingValuePolicy" TEXT NOT NULL,
    "isPublicVisible" BOOLEAN NOT NULL DEFAULT false,
    "version" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MetricDefinition_pkey" PRIMARY KEY ("metricKey")
);

CREATE TABLE "InstitutionMetric" (
    "id" TEXT NOT NULL,
    "metricKey" TEXT NOT NULL,
    "universityId" TEXT,
    "unitId" TEXT NOT NULL,
    "valueNumeric" DOUBLE PRECISION,
    "valueText" TEXT,
    "valueStatus" TEXT NOT NULL,
    "missingReason" TEXT,
    "rawValue" TEXT,
    "denominator" DOUBLE PRECISION,
    "cohort" TEXT,
    "academicYear" TEXT NOT NULL,
    "sourceSystem" TEXT NOT NULL,
    "sourceTable" TEXT NOT NULL,
    "sourceVariable" TEXT NOT NULL,
    "releaseKey" TEXT NOT NULL,
    "verificationId" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InstitutionMetric_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CipCode" (
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT 'CIP2020',
    "level" TEXT NOT NULL,
    "parentCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CipCode_pkey" PRIMARY KEY ("code")
);

CREATE TABLE "MajorCipMapping" (
    "id" TEXT NOT NULL,
    "majorId" TEXT NOT NULL,
    "cipCode" TEXT NOT NULL,
    "mappingScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mappingMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REVIEW_REQUIRED',
    "sourceSystem" TEXT NOT NULL DEFAULT 'IPEDS',
    "verificationId" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MajorCipMapping_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InstitutionCandidate" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "universityId" TEXT,
    "nameEn" TEXT NOT NULL,
    "state" TEXT,
    "control" TEXT,
    "sector" TEXT,
    "level" TEXT,
    "eligibilityScore" DOUBLE PRECISION,
    "recommendation" TEXT,
    "reasons" JSONB,
    "warnings" JSONB,
    "blockingReasons" JSONB,
    "policyVersion" TEXT,
    "releaseKey" TEXT NOT NULL,
    "computedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InstitutionCandidate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InstitutionPublishDecision" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "universityId" TEXT,
    "status" TEXT NOT NULL,
    "decidedBy" TEXT,
    "decidedAt" TIMESTAMP(3),
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InstitutionPublishDecision_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UniversityExternalIdentifier_identifierType_identifierValue_key" ON "UniversityExternalIdentifier"("identifierType", "identifierValue");
CREATE INDEX "UniversityExternalIdentifier_universityId_identifierType_idx" ON "UniversityExternalIdentifier"("universityId", "identifierType");

CREATE UNIQUE INDEX "InstitutionMetric_verificationId_key" ON "InstitutionMetric"("verificationId");
CREATE INDEX "InstitutionMetric_unitId_metricKey_idx" ON "InstitutionMetric"("unitId", "metricKey");
CREATE INDEX "InstitutionMetric_universityId_metricKey_idx" ON "InstitutionMetric"("universityId", "metricKey");
CREATE INDEX "InstitutionMetric_releaseKey_sourceTable_sourceVariable_idx" ON "InstitutionMetric"("releaseKey", "sourceTable", "sourceVariable");

CREATE UNIQUE INDEX "MajorCipMapping_majorId_cipCode_key" ON "MajorCipMapping"("majorId", "cipCode");
CREATE INDEX "MajorCipMapping_cipCode_status_idx" ON "MajorCipMapping"("cipCode", "status");

CREATE UNIQUE INDEX "InstitutionCandidate_unitId_key" ON "InstitutionCandidate"("unitId");
CREATE INDEX "InstitutionCandidate_recommendation_idx" ON "InstitutionCandidate"("recommendation");
CREATE INDEX "InstitutionCandidate_universityId_idx" ON "InstitutionCandidate"("universityId");

CREATE INDEX "InstitutionPublishDecision_candidateId_status_idx" ON "InstitutionPublishDecision"("candidateId", "status");
CREATE INDEX "InstitutionPublishDecision_universityId_status_idx" ON "InstitutionPublishDecision"("universityId", "status");

ALTER TABLE "UniversityExternalIdentifier" ADD CONSTRAINT "UniversityExternalIdentifier_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InstitutionMetric" ADD CONSTRAINT "InstitutionMetric_metricKey_fkey" FOREIGN KEY ("metricKey") REFERENCES "MetricDefinition"("metricKey") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InstitutionMetric" ADD CONSTRAINT "InstitutionMetric_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MajorCipMapping" ADD CONSTRAINT "MajorCipMapping_majorId_fkey" FOREIGN KEY ("majorId") REFERENCES "Major"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MajorCipMapping" ADD CONSTRAINT "MajorCipMapping_cipCode_fkey" FOREIGN KEY ("cipCode") REFERENCES "CipCode"("code") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InstitutionCandidate" ADD CONSTRAINT "InstitutionCandidate_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InstitutionPublishDecision" ADD CONSTRAINT "InstitutionPublishDecision_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "InstitutionCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InstitutionPublishDecision" ADD CONSTRAINT "InstitutionPublishDecision_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;
