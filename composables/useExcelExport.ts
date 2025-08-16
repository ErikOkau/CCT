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
      'Level': player.playerLevel,
      'Title': player.playerTitle,
      'Guild Rank': player.guildRank,
      'Red Velvet Dragon - Battles': player.redVelvetDragon.battles,
      'Red Velvet Dragon - Damage': player.redVelvetDragon.damage,
      'Red Velvet Dragon - Damage (Formatted)': formatDamage(player.redVelvetDragon.damage),
      'Avatar of Destiny - Battles': player.avatarOfDestiny.battles,
      'Avatar of Destiny - Damage': player.avatarOfDestiny.damage,
      'Avatar of Destiny - Damage (Formatted)': formatDamage(player.avatarOfDestiny.damage),
      'Season Total - Battles': player.seasonTotal.battles,
      'Season Total - Damage': player.seasonTotal.damage,
      'Season Total - Damage (Formatted)': formatDamage(player.seasonTotal.damage)
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
      { wch: 15 },  // Avatar Battles
      { wch: 20 },  // Avatar Damage
      { wch: 15 },  // Avatar Damage Formatted
      { wch: 15 },  // Season Battles
      { wch: 20 },  // Season Damage
      { wch: 15 }   // Season Damage Formatted
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
