-- CreateEnum
CREATE TYPE "AttemptStageType" AS ENUM ('PRE_TEST', 'STORY', 'POST_TEST');

-- CreateEnum
CREATE TYPE "StageType" AS ENUM ('PRE_TEST', 'POST_TEST', 'INTERACTIVE');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'TRUE_FALSE', 'DRAG_DROP', 'ESSAY');

-- CreateEnum
CREATE TYPE "StoryType" AS ENUM ('STATIC', 'INTERACTIVE');

-- CreateEnum
CREATE TYPE "SlideType" AS ENUM ('IMAGE', 'GAME', 'ESSAY');

-- CreateTable
CREATE TABLE "story_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "totalTimeSeconds" INTEGER NOT NULL DEFAULT 0,
    "totalXpGained" INTEGER NOT NULL DEFAULT 0,
    "preTestScore" DECIMAL(5,2),
    "postTestScore" DECIMAL(5,2),
    "correctInteractiveCnt" INTEGER,
    "wrongInteractiveCnt" INTEGER,
    "essayAnswer" TEXT,

    CONSTRAINT "story_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stage_attempts" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "stageType" "AttemptStageType" NOT NULL,
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "xpGained" INTEGER NOT NULL DEFAULT 0,
    "score" DECIMAL(5,2),

    CONSTRAINT "stage_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "question_attempts_logs" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userAnswerText" TEXT,
    "isCorrect" BOOLEAN,
    "attemptCount" INTEGER NOT NULL DEFAULT 1,
    "answeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "question_attempts_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "username" TEXT,
    "displayUsername" TEXT,
    "grade" INTEGER NOT NULL,
    "guardianEmail" TEXT NOT NULL,
    "totalXp" INTEGER DEFAULT 0,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "islands" (
    "id" TEXT NOT NULL,
    "islandName" TEXT NOT NULL,
    "unlockOrder" INTEGER NOT NULL,
    "isLockedDefault" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "islands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "islandId" TEXT NOT NULL,
    "isUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "stageType" "StageType" NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "questionText" TEXT NOT NULL,
    "xpValue" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer_option" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionText" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "answer_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stories" (
    "id" TEXT NOT NULL,
    "islandId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "storyType" "StoryType" NOT NULL,

    CONSTRAINT "stories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "static_slide" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "slideNumber" INTEGER NOT NULL,
    "contentText" TEXT,
    "imageUrl" TEXT,

    CONSTRAINT "static_slide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interactive_slide" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "questionId" TEXT,
    "slideNumber" INTEGER NOT NULL,
    "slideType" "SlideType" NOT NULL,
    "imageUrl" TEXT,
    "contentText" TEXT,

    CONSTRAINT "interactive_slide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "story_attempts_userId_idx" ON "story_attempts"("userId");

-- CreateIndex
CREATE INDEX "story_attempts_storyId_idx" ON "story_attempts"("storyId");

-- CreateIndex
CREATE INDEX "stage_attempts_attemptId_idx" ON "stage_attempts"("attemptId");

-- CreateIndex
CREATE INDEX "question_attempts_logs_attemptId_idx" ON "question_attempts_logs"("attemptId");

-- CreateIndex
CREATE INDEX "question_attempts_logs_questionId_idx" ON "question_attempts_logs"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "user_progress_userId_idx" ON "user_progress"("userId");

-- CreateIndex
CREATE INDEX "user_progress_islandId_idx" ON "user_progress"("islandId");

-- CreateIndex
CREATE INDEX "questions_storyId_idx" ON "questions"("storyId");

-- CreateIndex
CREATE INDEX "answer_option_questionId_idx" ON "answer_option"("questionId");

-- CreateIndex
CREATE INDEX "stories_islandId_idx" ON "stories"("islandId");

-- CreateIndex
CREATE INDEX "static_slide_storyId_idx" ON "static_slide"("storyId");

-- CreateIndex
CREATE INDEX "interactive_slide_storyId_idx" ON "interactive_slide"("storyId");

-- CreateIndex
CREATE INDEX "interactive_slide_questionId_idx" ON "interactive_slide"("questionId");

-- AddForeignKey
ALTER TABLE "story_attempts" ADD CONSTRAINT "story_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "story_attempts" ADD CONSTRAINT "story_attempts_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_attempts" ADD CONSTRAINT "stage_attempts_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "story_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_attempts_logs" ADD CONSTRAINT "question_attempts_logs_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "story_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_attempts_logs" ADD CONSTRAINT "question_attempts_logs_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_islandId_fkey" FOREIGN KEY ("islandId") REFERENCES "islands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_option" ADD CONSTRAINT "answer_option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stories" ADD CONSTRAINT "stories_islandId_fkey" FOREIGN KEY ("islandId") REFERENCES "islands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "static_slide" ADD CONSTRAINT "static_slide_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactive_slide" ADD CONSTRAINT "interactive_slide_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactive_slide" ADD CONSTRAINT "interactive_slide_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
