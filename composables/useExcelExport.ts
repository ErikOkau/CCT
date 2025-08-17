import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { BattlePlayer } from '~/types/battle'

export const useExcelExport = () => {
  const exportToExcel = (battleData: BattlePlayer[]) => {
    if (battleData.length === 0) return

    // Transform data for better Excel formatting
    const excelData = battleData.map(player => ({
      'Rank': player.rank,
      'Player Name': player.playerName,
      'Level': player.playerLevel || 'N/A',
      'Title': player.playerTitle || 'N/A',
      'Guild Rank': player.guildRank || 'Member',
      'Red Velvet Dragon - Battles': player.redVelvetDragon.battles,
      'Red Velvet Dragon - Damage': player.redVelvetDragon.damage,
      'Red Velvet Dragon - Damage (Formatted)': formatDamage(player.redVelvetDragon.damage),
      'Red Velvet Dragon - Avg DMG/Ticket': player.redVelvetDragon.avgDamagePerTicket || 'N/A',
      'Avatar of Destiny - Battles': player.avatarOfDestiny.battles,
      'Avatar of Destiny - Damage': player.avatarOfDestiny.damage,
      'Avatar of Destiny - Damage (Formatted)': formatDamage(player.avatarOfDestiny.damage),
      'Avatar of Destiny - Avg DMG/Ticket': player.avatarOfDestiny.avgDamagePerTicket || 'N/A',
      'Living Abyss - Battles': player.livingAbyss.battles,
      'Living Abyss - Damage': player.livingAbyss.damage,
      'Living Abyss - Damage (Formatted)': formatDamage(player.livingAbyss.damage),
      'Living Abyss - Avg DMG/Ticket': player.livingAbyss.avgDamagePerTicket || 'N/A',
      'Total Damage': player.redVelvetDragon.damage + player.avatarOfDestiny.damage + player.livingAbyss.damage,
      'Total Damage (Formatted)': formatDamage(player.redVelvetDragon.damage + player.avatarOfDestiny.damage + player.livingAbyss.damage),
      'Total Battles': player.redVelvetDragon.battles + player.avatarOfDestiny.battles + player.livingAbyss.battles
    }))

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    const colWidths = [
      { wch: 8 },   // Rank
      { wch: 20 },  // Player Name
      { wch: 8 },   // Level
      { wch: 25 },  // Title
      { wch: 12 },  // Guild Rank
      { wch: 15 },  // RV Battles
      { wch: 20 },  // RV Damage
      { wch: 15 },  // RV Damage Formatted
      { wch: 15 },  // RV Avg DMG/Ticket
      { wch: 15 },  // Avatar Battles
      { wch: 20 },  // Avatar Damage
      { wch: 15 },  // Avatar Damage Formatted
      { wch: 15 },  // Avatar Avg DMG/Ticket
      { wch: 15 },  // Living Abyss Battles
      { wch: 20 },  // Living Abyss Damage
      { wch: 15 },  // Living Abyss Damage Formatted
      { wch: 15 },  // Living Abyss Avg DMG/Ticket
      { wch: 20 },  // Total Damage
      { wch: 15 },  // Total Damage Formatted
      { wch: 15 }   // Total Battles
    ]
    ws['!cols'] = colWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Guild Battle Results')

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

    // Download file
    saveAs(data, `cct-guild-battle-results-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const formatDamage = (damage: number): string => {
    if (damage >= 1000000000000) {
      return `${(damage / 1000000000000).toFixed(1)}T`
    } else if (damage >= 1000000000) {
      return `${(damage / 1000000000).toFixed(1)}B`
    } else if (damage >= 1000000) {
      return `${(damage / 1000000).toFixed(1)}M`
    } else if (damage >= 1000) {
      return `${(damage / 1000).toFixed(1)}K`
    }
    return damage.toString()
  }

  return {
    exportToExcel
  }
}
