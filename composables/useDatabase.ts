import { supabase } from '~/utils/supabase'
import type { BattlePlayer } from '~/types/battle'

export const useDatabase = () => {
  // Save battle data to Supabase
  const saveBattleData = async (season: string, players: BattlePlayer[]) => {
    try {
      // Transform BattlePlayer data to match our schema
      const battleData = players.map(player => ({
        season,
        player_name: player.playerName,
        player_level: player.playerLevel,
        player_title: player.playerTitle,
        guild_rank: player.guildRank,
        red_velvet_damage: player.redVelvetDragon.damage,
        red_velvet_battles: player.redVelvetDragon.battles,
        red_velvet_avg_damage_per_ticket: player.redVelvetDragon.avgDamagePerTicket,
        avatar_damage: player.avatarOfDestiny.damage,
        avatar_battles: player.avatarOfDestiny.battles,
        avatar_avg_damage_per_ticket: player.avatarOfDestiny.avgDamagePerTicket,
        living_abyss_damage: player.livingAbyss.damage,
        living_abyss_battles: player.livingAbyss.battles,
        living_abyss_avg_damage_per_ticket: player.livingAbyss.avgDamagePerTicket
      }))

      // Delete existing data for this season first
      const { error: deleteError } = await supabase
        .from('battle_data')
        .delete()
        .eq('season', season)

      if (deleteError) {
        console.error('Error deleting existing data:', deleteError)
        return { error: deleteError }
      }

      // Insert new data
      const { data, error } = await supabase
        .from('battle_data')
        .insert(battleData)
        .select()

      return { data, error }
    } catch (error) {
      console.error('Error saving battle data:', error)
      return { error }
    }
  }

  // Get battle data for a specific season
  const getBattleData = async (season: string) => {
    try {
      const { data, error } = await supabase
        .from('battle_data')
        .select('*')
        .eq('season', season)
        .order('total_damage', { ascending: false })

      if (error) {
        console.error('Error fetching battle data:', error)
        return { data: null, error }
      }

      // Transform back to BattlePlayer format
      const players: BattlePlayer[] = data.map((row, index) => ({
        rank: index + 1,
        playerName: row.player_name,
        playerLevel: row.player_level,
        playerTitle: row.player_title,
        guildRank: row.guild_rank,
        redVelvetDragon: {
          damage: row.red_velvet_damage,
          battles: row.red_velvet_battles,
          avgDamagePerTicket: row.red_velvet_avg_damage_per_ticket
        },
        avatarOfDestiny: {
          damage: row.avatar_damage,
          battles: row.avatar_battles,
          avgDamagePerTicket: row.avatar_avg_damage_per_ticket
        },
        livingAbyss: {
          damage: row.living_abyss_damage,
          battles: row.living_abyss_battles,
          avgDamagePerTicket: row.living_abyss_avg_damage_per_ticket
        }
      }))

      return { data: players, error: null }
    } catch (error) {
      console.error('Error fetching battle data:', error)
      return { data: null, error }
    }
  }

  // Get user profile
  const getUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return { data: null, error }
    }
  }

  // Update user profile
  const updateUserProfile = async (userId: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      return { data, error }
    } catch (error) {
      console.error('Error updating user profile:', error)
      return { data: null, error }
    }
  }

  // Check if user is admin
  const isUserAdmin = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error checking admin status:', error)
        return false
      }

      return data?.role === 'admin'
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }

  return {
    saveBattleData,
    getBattleData,
    getUserProfile,
    updateUserProfile,
    isUserAdmin
  }
}
