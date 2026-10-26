# CCT Discord OCR bot

Imports Cookie Run Kingdom **Participants** screenshots into the guild Google Sheet.

## Command

In your admin channel:

```text
?submit_result 35-1
```

Attach up to **6** images (~5 members visible each ≈ **30** players). Optional flags:

- `--dry-run` — OCR preview only, no sheet write
- `--overwrite` — replace data if tab `35-1` already exists (default is warn + skip)

In Discord: `?sonic_info` (help), `?sonic_status` (health & policy).

## Env vars

| Variable | Description |
|----------|-------------|
| `DISCORD_BOT_TOKEN` | Bot token from Discord Developer Portal |
| `GOOGLE_SHEETS_CREDENTIALS` | Path to `.json` key file **(recommended)**, or **one-line** minified JSON |
| `GOOGLE_SHEETS_CREDENTIALS_FILE` | Optional alias — path to the same `.json` file |

**Do not** put pretty-printed JSON in double quotes like `"{\n  "type": ..."` — inner `"` breaks `.env`. Locally, use a `.json` file path; on Railway, use **one-line minified JSON** (see below).

| `DISCORD_COMMAND_PREFIX` | Default `?` |
| `CHATGPT_API` | OpenAI key — when set, screenshots use **GPT-4o vision** instead of Tesseract |
| `OCR_PROVIDER` | `openai` (default if `CHATGPT_API` set) or `tesseract` |
| `OPENAI_VISION_MODEL` | Default `gpt-4o` |
| `REQUIRE_DRY_RUN_FIRST` | Default **on** — must `--dry-run` once per season per server before writing (`0` to disable) |
| `DISCORD_ALLOWED_ROLE_NAMES` | Optional override; default allows **CCT Guild Officer**, **CCT Guild Leader**, **Website Manager** (+ server owner & Administrator) |
| `DISCORD_ALLOWED_ROLE_IDS` | Extra allowed role IDs (comma-separated) |
| `DISCORD_REMINDER_CHANNEL_ID` | Optional — weekly nudge to dry-run the current season |
| `OPENAI_VISION_MODEL` | Default `gpt-4o`; try `gpt-4o-mini` for cost savings if quality holds |

### Discord Developer Portal

1. **Bot → Privileged Gateway Intents**
   - **Message Content Intent**: **ON** (required for `?submit_result` text commands)
   - Server Members Intent: off (not needed)

2. **OAuth2 → URL Generator**
   - Scopes: `bot`
   - Bot permissions (minimum):
     - View Channels
     - Send Messages
     - Read Message History
     - Attach Files (optional; previews are text-only today)
   - Or use permission integer **`116736`** with your application id:
     `https://discord.com/api/oauth2/authorize?client_id=YOUR_APP_ID&permissions=116736&scope=bot`

3. **Application → General**
   - **Public key** is only needed if you add **HTTP Interactions** (slash commands via webhook). The current gateway bot uses **`DISCORD_BOT_TOKEN`** only.

4. Put the bot in your **admin channel**; restrict who can post screenshots there.

### Google Cloud / Sheets

The bot does **not** use a generic **API key** (`AIzaSy…`). It needs **`GOOGLE_SHEETS_CREDENTIALS`**: the full **service account JSON** with access to the spreadsheet (Editor). Enable the **Google Sheets API** for that project.

Share the spreadsheet with the service account email (Editor).

## Run locally

```bash
cd services/discord-ocr-bot
npm install
npm run test:unit
npm run test:ocr -- 33-2
npm start
```

Env vars can live in the **repo root** `.env` or `services/discord-ocr-bot/.env` (bot-local wins).

## Deploy on Railway

The bot needs the **whole GitHub repo** (it imports `utils/` and `types/` from the parent folder). Do **not** set Railway root directory to `services/discord-ocr-bot` only.

1. [Railway](https://railway.app) → **New Project** → **Deploy from GitHub** → select **CCT** repo.
2. Add a **second service** for the bot (keep Vercel for the website; this service is separate).
3. **Settings → Build**
   - **Root Directory**: leave **empty** (repo root).
   - **Config file path**: `railway.discord-bot.toml`  
     Or set manually:
     - **Build command**: `cd services/discord-ocr-bot && npm ci && npm rebuild sharp`
     - **Start command**: `cd services/discord-ocr-bot && npm start`
4. **Settings → Variables** (same as local, but no `.env` file):

   | Variable | Railway value |
   |----------|----------------|
   | `DISCORD_BOT_TOKEN` | Bot token (mark **Sensitive**) |
   | `DISCORD_COMMAND_PREFIX` | `?` |
   | `GOOGLE_SHEETS_CREDENTIALS` | **Entire service account JSON on one line** — copy from Vercel’s `GOOGLE_SHEETS_CREDENTIALS` or minify your `google-sheets-service-account.json` (no line breaks). |

   To minify locally:  
   `node -e "console.log(JSON.stringify(require('./google-sheets-service-account.json')))"`

5. **Deploy**. In **Logs** you should see: `Discord bot ready as … (prefix "?")`.
6. Stop local `npm start` if both run at once (two processes = duplicate replies).

**Optional:** Settings → Builder → **Dockerfile** → path `services/discord-ocr-bot/Dockerfile` (build context = repo root) if `sharp` fails on Nixpacks.

**Cost:** Railway free tier / hobby is usually enough for one small always-on bot.

## Accuracy

With **`CHATGPT_API`** in repo root `.env`, the bot uses **OpenAI vision** (much more accurate on CRK fonts). Set `OCR_PROVIDER=tesseract` to force local OCR. Always review the Discord preview (or use `--dry-run`) before writing.

## In-game column order (DF 34+)

When Machine God and Avatar of Destiny are both active, headers appear **Machine God** then **Avatar of Destiny** (Living Abyss third when present). Pre-34 screenshots use Red Velvet / Living Abyss / Machine God layouts; OCR reads boss names from the header row when possible.
