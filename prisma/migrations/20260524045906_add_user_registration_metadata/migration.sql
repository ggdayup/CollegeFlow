-- AlterTable
ALTER TABLE "User" ADD COLUMN     "counselorSpecialty" TEXT,
ADD COLUMN     "customNote" TEXT,
ADD COLUMN     "gradYear" INTEGER,
ADD COLUMN     "schoolName" TEXT,
ADD COLUMN     "teacherSubject" TEXT,
ADD COLUMN     "userType" TEXT NOT NULL DEFAULT 'STUDENT';
