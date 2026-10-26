import { REST, Routes, SlashCommandBuilder } from 'discord.js'

export async function registerSlashCommands(clientId: string) {
  const token = process.env.DISCORD_BOT_TOKEN?.trim()
  if (!token) return

  const commands = [
    new SlashCommandBuilder()
      .setName('submit_result')
      .setDescription('Import guild battle Participants screenshots into the sheet')
      .addStringOption(opt =>
        opt.setName('season').setDescription('Season id e.g. 35-4').setRequired(true)
      )
      .addBooleanOption(opt => opt.setName('dry_run').setDescription('Preview only, no sheet write'))
      .addBooleanOption(opt => opt.setName('overwrite').setDescription('Replace existing tab'))
      .toJSON()
  ]

  const rest = new REST({ version: '10' }).setToken(token)
  await rest.put(Routes.applicationCommands(clientId), { body: commands })
  console.log('✅ Slash command /submit_result registered')
}
