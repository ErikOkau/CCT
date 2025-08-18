-- CreateEnum
CREATE TYPE "public"."GuildRank" AS ENUM ('MEMBER', 'OFFICER', 'LEADER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."BattleType" AS ENUM ('RED_VELVET_DRAGON', 'AVATAR_OF_DESTINY');

-- CreateTable
CREATE TABLE "public"."seasons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."guilds" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guilds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."players" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "title" TEXT,
    "guildRank" "public"."GuildRank" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "guildId" TEXT NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."guild_results" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "totalDamage" BIGINT NOT NULL,
    "totalBattles" INTEGER NOT NULL,
    "participantCount" INTEGER NOT NULL,
    "rank" INTEGER,
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guild_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."battle_results" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "battleType" "public"."BattleType" NOT NULL,
    "battles" INTEGER NOT NULL,
    "damage" BIGINT NOT NULL,
    "rank" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "battle_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."battle_analyses" (
    "id" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "analysisDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalPlayers" INTEGER NOT NULL,
    "highestDamage" BIGINT NOT NULL,
    "averageDamage" BIGINT NOT NULL,
    "totalBattlesDone" INTEGER NOT NULL,
    "guildScore" INTEGER NOT NULL,
    "redVelvetStats" JSONB,
    "avatarStats" JSONB,
    "livingAbyssStats" JSONB,
    "insights" TEXT[],
    "playerData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "battle_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seasons_name_key" ON "public"."seasons"("name");

-- CreateIndex
CREATE UNIQUE INDEX "guilds_name_key" ON "public"."guilds"("name");

-- CreateIndex
CREATE UNIQUE INDEX "players_name_guildId_key" ON "public"."players"("name", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "guild_results_seasonId_guildId_key" ON "public"."guild_results"("seasonId", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "battle_results_seasonId_playerId_battleType_key" ON "public"."battle_results"("seasonId", "playerId", "battleType");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "public"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "battle_analyses_seasonId_guildId_key" ON "public"."battle_analyses"("seasonId", "guildId");

-- AddForeignKey
ALTER TABLE "public"."players" ADD CONSTRAINT "players_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "public"."guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."guild_results" ADD CONSTRAINT "guild_results_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "public"."seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."guild_results" ADD CONSTRAINT "guild_results_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "public"."guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."battle_results" ADD CONSTRAINT "battle_results_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "public"."seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."battle_results" ADD CONSTRAINT "battle_results_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."battle_analyses" ADD CONSTRAINT "battle_analyses_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "public"."seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."battle_analyses" ADD CONSTRAINT "battle_analyses_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "public"."guilds"("id") ON DELETE CASCADE ON UPDATE CASCADE;
