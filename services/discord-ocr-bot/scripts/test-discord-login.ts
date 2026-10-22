import '../src/loadEnv.ts'
import { Client, GatewayIntentBits } from 'discord.js'

const token = process.env.DISCORD_BOT_TOKEN
if (!token) {
  console.error('DISCORD_BOT_TOKEN missing')
  process.exit(1)
}

const withContent = process.argv.includes('--full')
const intents = [GatewayIntentBits.Guilds]
if (withContent) {
  intents.push(GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent)
}

const client = new Client({ intents })

client.once('clientReady', () => {
  console.log(`✅ Logged in as ${client.user?.tag} (id ${client.user?.id})`)
  client.destroy()
  process.exit(0)
})

client.login(token).catch(err => {
  console.error('❌ Login failed:', err.message)
  process.exit(1)
})
