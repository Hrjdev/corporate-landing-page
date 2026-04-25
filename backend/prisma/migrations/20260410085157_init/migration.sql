-- AlterTable
ALTER TABLE "ContactMessage" ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "readBy" TEXT,
ADD COLUMN     "repliedAt" TIMESTAMP(3),
ADD COLUMN     "repliedBy" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'UNREAD',
ALTER COLUMN "subject" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Yönetici',
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'SUPER_ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteContent" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "heroTitle" TEXT NOT NULL DEFAULT 'Kurumsal Vizyonunuzu Dijitale Taşıyın',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Modern teknolojiler ve yenilikçi çözümlerle işletmenizin dijital dönüşüm yolculuğunda güvenilir teknolojı ortağınız.',
    "contactEmail" TEXT NOT NULL DEFAULT 'hello@nexustech.corp',
    "contactPhone" TEXT NOT NULL DEFAULT '+90 (212) 555 01 23',
    "contactAddress" TEXT NOT NULL DEFAULT 'Teknoloji Vadisi, İnovasyon Cd. No:42 Kadıköy, İstanbul',

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER,
    "adminName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");
