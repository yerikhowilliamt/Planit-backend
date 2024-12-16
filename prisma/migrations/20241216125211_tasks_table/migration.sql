-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('SELESAI', 'BELUM_SELESAI');

-- CreateTable
CREATE TABLE "tasks" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "task" VARCHAR(255) NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'BELUM_SELESAI',
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tasks_user_id_idx" ON "tasks"("user_id");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
