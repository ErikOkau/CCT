# Database Setup Guide

## Prerequisites
1. PostgreSQL installed and running
2. Node.js and npm installed

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
Create a `.env` file in the root directory with your database connection:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/cct_guild_db?schema=public"
```

Replace with your actual PostgreSQL credentials:
- `username`: Your PostgreSQL username
- `password`: Your PostgreSQL password
- `localhost:5432`: Your PostgreSQL host and port
- `cct_guild_db`: Your database name

### 3. Create Database
```bash
# Connect to PostgreSQL and create database
psql -U username -h localhost
CREATE DATABASE cct_guild_db;
\q
```

### 4. Generate Prisma Client
```bash
npx prisma generate
```

### 5. Run Database Migrations
```bash
npx prisma migrate dev --name init
```

### 6. Initialize Database (Optional)
```bash
node setup-database.js
```

## Database Schema Overview

The database includes the following models:

- **Season**: Stores season information (e.g., "20-2")
- **Guild**: Stores guild information
- **Player**: Stores player information with guild membership
- **GuildResult**: Stores overall guild performance per season
- **BattleResult**: Stores individual player battle results
- **BattleAnalysis**: Stores analysis results and insights

## Usage Examples

### Create a new season
```typescript
const season = await prisma.season.create({
  data: {
    name: "20-2",
    startDate: new Date("2024-01-01"),
    isActive: true
  }
})
```

### Store guild battle results
```typescript
const guildResult = await prisma.guildResult.create({
  data: {
    seasonId: seasonId,
    guildId: guildId,
    totalDamage: BigInt("1000000000000"),
    totalBattles: 100,
    participantCount: 25
  }
})
```

## Troubleshooting

### If you get "path argument must be of type string" error:
1. Make sure your `.env` file exists and has the correct DATABASE_URL
2. Try running `npx prisma format` to format the schema
3. Update Prisma to the latest version: `npm i --save-dev prisma@latest && npm i @prisma/client@latest`

### If you can't connect to PostgreSQL:
1. Make sure PostgreSQL is running
2. Check your connection credentials
3. Ensure the database exists
4. Try connecting with `psql` to verify your connection

## Application Integration

The application now includes:
- A database form in the results section
- Automatic storage of battle results
- Season and guild management
- Player performance tracking

To use the database features:
1. Analyze your battle screenshots as usual
2. Fill in the season name (e.g., "20-2") and guild name
3. Click "Save to Database" to store the results
