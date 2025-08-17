// Test script for OCR functionality
// This script demonstrates how the OCR system works with sample data

const sampleOCRText = `
Participants

Player Red Velvet Dragon Avatar of Destiny Season Total Rank
Jammifyvx Lv.61 Diverged x9 97,795,386,178 x3 15,260,416,401 x12 113,055,802,579 Member
Bestoutuber Lv.74 World of Stillness x9 98,664,625,297 x3 13,368,099,652 x12 112,032,724,949 Leader
woonbabie Lv.58 Agar Slime Suppressor x9 105,258,650,139 N/A x9 105,258,650,139 Member
ZephyrCat Lv.60 Full of Sweetness! x9 102,303,172,189 N/A x9 102,303,172,189 Member
gever Lv.66 Winner x9 82,150,885,882 x3 16,358,384,806 x12 98,509,270,688 Member
`;

// Mock BattleAnalyzer class for testing
class MockBattleAnalyzer {
  static parseExtractedText(text) {
    const players = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    console.log('Parsing extracted text for player data...');
    console.log('Raw text preview:', text.substring(0, 500) + '...');
    
    // Simplified pattern matching for the actual screenshot format
    const patterns = [
      // Pattern 1: Full format with battle counts and damage
      /([A-Za-z0-9_]+)\s+Lv\.(\d+)\s+(.+?)\s+x(\d+)\s+(\d{1,3}(?:,\d{3})*)\s+x(\d+)\s+(\d{1,3}(?:,\d{3})*)\s+x(\d+)\s+(\d{1,3}(?:,\d{3})*)/g,
      
      // Pattern 2: Handle N/A values (Red Velvet N/A)
      /([A-Za-z0-9_]+)\s+Lv\.(\d+)\s+(.+?)\s+N\/A\s+x(\d+)\s+(\d{1,3}(?:,\d{3})*)\s+x(\d+)\s+(\d{1,3}(?:,\d{3})*)/g,
      
      // Pattern 3: Handle N/A values (Avatar N/A)
      /([A-Za-z0-9_]+)\s+Lv\.(\d+)\s+(.+?)\s+x(\d+)\s+(\d{1,3}(?:,\d{3})*)\s+N\/A\s+x(\d+)\s+(\d{1,3}(?:,\d{3})*)/g,
      
      // Pattern 4: Simple format with just damage numbers
      /([A-Za-z0-9_]+)\s+(\d{1,3}(?:,\d{3})*)\s+(\d{1,3}(?:,\d{3})*)\s+(\d{1,3}(?:,\d{3})*)/g
    ];
    
    let playerIndex = 0;
    let foundPlayers = false;
    
    // First, try to find table headers to understand the structure
    const hasTableHeaders = text.includes('Player') || text.includes('Red Velvet Dragon') || text.includes('Avatar of Destiny') || text.includes('Season Total');
    console.log('Table headers detected:', hasTableHeaders);
    
         for (let i = 0; i < patterns.length; i++) {
       const pattern = patterns[i];
       if (foundPlayers) break;
       
       console.log(`Testing pattern ${i + 1}:`, pattern.source);
       let match;
       while ((match = pattern.exec(text)) !== null && playerIndex < 10) {
        let playerName, level, title, redVelvetBattles, redVelvetDamage, avatarBattles, avatarDamage, seasonBattles, seasonDamage;
        
                 console.log(`Match found with ${match.length} groups:`, match);
         
         if (match.length === 11) {
           // Pattern 1: Full format with battle counts and damage
           [, playerName, level, title, redVelvetBattles, redVelvetDamage, avatarBattles, avatarDamage, seasonBattles, seasonDamage] = match;
         } else if (match.length === 10) {
           // Pattern 1: Full format with battle counts and damage (10 groups)
           [, playerName, level, title, redVelvetBattles, redVelvetDamage, avatarBattles, avatarDamage, seasonBattles, seasonDamage] = match;
         } else if (match.length === 8) {
           // Pattern 2: Red Velvet N/A
           [, playerName, level, title, avatarBattles, avatarDamage, seasonBattles, seasonDamage] = match;
           redVelvetBattles = '0';
           redVelvetDamage = '0';
         } else if (match.length === 8) {
           // Pattern 3: Avatar N/A
           [, playerName, level, title, redVelvetBattles, redVelvetDamage, seasonBattles, seasonDamage] = match;
           avatarBattles = '0';
           avatarDamage = '0';
         } else if (match.length === 5) {
           // Pattern 4: Simple format with just damage numbers
           [, playerName, redVelvetDamage, avatarDamage, seasonDamage] = match;
           level = '50';
           title = 'Unknown Title';
           redVelvetBattles = '0';
           avatarBattles = '0';
           seasonBattles = '0';
         } else {
           console.log(`Skipping match with ${match.length} groups`);
           continue; // Skip if pattern doesn't match expected groups
         }
        
        // Validate player name (should be reasonable length and not contain only numbers)
        if (!playerName || 
            playerName.length < 2 || 
            playerName.length > 20 || 
            /^\d+$/.test(playerName)) {
          continue;
        }
        
        // Ensure title is defined
        if (!title) {
          title = 'Unknown Title';
        }
        
        // Convert strings to numbers
        const redVelvetDamageNum = this.parseDamageString(redVelvetDamage || '0');
        const avatarDamageNum = this.parseDamageString(avatarDamage || '0');
        const seasonDamageNum = this.parseDamageString(seasonDamage || '0');
        const redVelvetBattlesNum = parseInt(redVelvetBattles || '0') || 0;
        const avatarBattlesNum = parseInt(avatarBattles || '0') || 0;
        const seasonBattlesNum = parseInt(seasonBattles || '0') || 0;
        
        // Skip if no valid damage found and no battle counts
        if (redVelvetDamageNum < 1000000 && 
            avatarDamageNum < 1000000 && 
            redVelvetBattlesNum === 0 && avatarBattlesNum === 0) {
          continue;
        }
        
        // Use actual battle counts from screenshot, or calculate if not available
        const finalRedVelvetBattles = redVelvetBattlesNum > 0 ? redVelvetBattlesNum : this.calculateBattleCount(redVelvetDamageNum);
        const finalAvatarBattles = avatarBattlesNum > 0 ? avatarBattlesNum : this.calculateBattleCount(avatarDamageNum);
        const finalSeasonBattles = seasonBattlesNum > 0 ? seasonBattlesNum : (finalRedVelvetBattles + finalAvatarBattles);
        const finalSeasonDamage = seasonDamageNum > 0 ? seasonDamageNum : (redVelvetDamageNum + avatarDamageNum);
        
        // Determine guild rank based on position or other indicators
        let guildRank = 'Member';
        if (playerIndex === 0 && redVelvetDamageNum > 90000000000) {
          guildRank = 'Leader'; // High damage first player might be leader
        } else if (redVelvetDamageNum > 80000000000 || avatarDamageNum > 50000000000) {
          guildRank = 'Officer'; // High damage players might be officers
        }
        
        const player = {
          rank: playerIndex + 1,
          playerName: playerName?.trim() || 'Unknown Player',
          playerLevel: parseInt(level || '50') || 50,
          playerTitle: title.trim(),
          redVelvetDragon: { 
            battles: finalRedVelvetBattles, 
            damage: redVelvetDamageNum 
          },
          avatarOfDestiny: { 
            battles: finalAvatarBattles, 
            damage: avatarDamageNum 
          },
          seasonTotal: { 
            battles: finalSeasonBattles, 
            damage: finalSeasonDamage 
          },
          guildRank
        };
        
        players.push(player);
        playerIndex++;
        foundPlayers = true;
        console.log(`✅ Found player: ${player.playerName} (Lv.${player.playerLevel}) - RV: x${finalRedVelvetBattles} ${this.formatDamage(redVelvetDamageNum)}, Avatar: x${finalAvatarBattles} ${this.formatDamage(avatarDamageNum)}, Season: x${finalSeasonBattles} ${this.formatDamage(finalSeasonDamage)}`);
      }
    }
    
    // If AI parsing didn't find enough players, return empty array to trigger fallback
    if (players.length < 2) {
      console.log('⚠️ AI parsing found insufficient data, will use fallback');
      return [];
    }
    
    console.log(`🎉 AI parsing successful: found ${players.length} players`);
    return players;
  }

  static parseDamageString(damageStr) {
    if (!damageStr) return 0;
    
    // Remove commas and spaces
    const cleanStr = damageStr.replace(/[,.\s]/g, '');
    
    // Try to parse as integer
    const damage = parseInt(cleanStr);
    return isNaN(damage) ? 0 : damage;
  }

  static calculateBattleCount(damage) {
    if (damage === 0) return 0;
    
    // Calculate battle count based on typical damage per battle
    // Red Velvet Dragon: ~10-12B per battle
    // Avatar of Destiny: ~5-6B per battle
    const avgDamagePerBattle = damage > 50000000000 ? 11000000000 : 5500000000; // 11B for RV, 5.5B for Avatar
    const battleCount = Math.round(damage / avgDamagePerBattle);
    
    // Ensure battle count is within reasonable bounds (1-15)
    return Math.max(1, Math.min(15, battleCount));
  }

  static formatDamage(damage) {
    if (damage >= 1000000000000) {
      return `${(damage / 1000000000000).toFixed(1)}T`;
    } else if (damage >= 1000000000) {
      return `${(damage / 1000000000).toFixed(1)}B`;
    } else if (damage >= 1000000) {
      return `${(damage / 1000000).toFixed(1)}M`;
    } else if (damage >= 1000) {
      return `${(damage / 1000).toFixed(1)}K`;
    }
    return damage.toString();
  }
}

// Test the OCR functionality
console.log('🧪 Testing OCR functionality...\n');

console.log('📝 Sample OCR Text:');
console.log(sampleOCRText);

console.log('\n🔍 Parsing results:');
const players = MockBattleAnalyzer.parseExtractedText(sampleOCRText);

console.log('\n📊 Parsed Players:');
players.forEach(player => {
  console.log(`${player.rank}. ${player.playerName} (Lv.${player.playerLevel}) - ${player.playerTitle}`);
  console.log(`   Red Velvet: x${player.redVelvetDragon.battles} ${MockBattleAnalyzer.formatDamage(player.redVelvetDragon.damage)}`);
  console.log(`   Avatar: x${player.avatarOfDestiny.battles} ${MockBattleAnalyzer.formatDamage(player.avatarOfDestiny.damage)}`);
  console.log(`   Season: x${player.seasonTotal.battles} ${MockBattleAnalyzer.formatDamage(player.seasonTotal.damage)}`);
  console.log(`   Rank: ${player.guildRank}\n`);
});

console.log(`✅ Test completed! Found ${players.length} players.`);
