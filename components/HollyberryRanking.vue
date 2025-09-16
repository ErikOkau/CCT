<template>
  <div class="hollyberry-ranking">
    <div class="ranking-header">
      <div class="server-info">
        <div class="server-icon">🍓</div>
        <h2>Hollyberry Server Rankings</h2>
        <div class="season-info">Destiny's Flight 21-3</div>
      </div>
    </div>
    
    <div class="ranking-table">
      <div class="table-header">
        <div class="header-cell rank">Ranking</div>
        <div class="header-cell guild">Guild Name</div>
        <div class="header-cell trophy">Weekly Trophy</div>
      </div>
      
      <div class="table-body">
        <div 
          v-for="(guild, index) in rankings" 
          :key="guild.rank"
          class="table-row"
          :class="{ 'top-three': guild.rank <= 3 }"
        >
          <div class="rank-cell">
            <span class="rank-number">#{{ guild.rank }}</span>
            <span v-if="guild.change" class="rank-change" :class="guild.change.type">
              <span v-if="guild.change.type === 'up'">▲</span>
              <span v-else-if="guild.change.type === 'down'">▼</span>
              {{ guild.change.value }}
            </span>
          </div>
          
          <div class="guild-cell">
            <span class="guild-name">{{ guild.name }}</span>
          </div>
          
          <div class="trophy-cell">
            <span class="trophy-value">{{ formatNumber(guild.trophy) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface RankChange {
  type: 'up' | 'down'
  value: number
}

interface GuildRanking {
  rank: number
  name: string
  trophy: number
  change?: RankChange
}

const rankings: GuildRanking[] = [
  { rank: 1, name: 'KAMAZON', trophy: 58338540, change: { type: 'up', value: 1 } },
  { rank: 2, name: 'Creamery', trophy: 57879275, change: { type: 'down', value: 1 } },
  { rank: 3, name: 'LAMAZON', trophy: 57575130, change: { type: 'up', value: 2 } },
  { rank: 4, name: 'MintChoco', trophy: 57450000, change: { type: 'up', value: 1 } },
  { rank: 5, name: 'DarkChoco', trophy: 57200000, change: { type: 'down', value: 2 } },
  { rank: 6, name: 'Strawberry', trophy: 57000000, change: { type: 'up', value: 1 } },
  { rank: 7, name: 'Vanilla', trophy: 56800000, change: { type: 'down', value: 1 } },
  { rank: 8, name: 'Cocoa', trophy: 56600000, change: { type: 'up', value: 2 } },
  { rank: 9, name: 'Espresso', trophy: 56400000, change: { type: 'down', value: 1 } },
  { rank: 10, name: 'Latte', trophy: 56200000, change: { type: 'up', value: 1 } },
  { rank: 11, name: 'Mocha', trophy: 56000000, change: { type: 'down', value: 1 } },
  { rank: 12, name: 'Caramel', trophy: 55800000, change: { type: 'up', value: 2 } },
  { rank: 13, name: 'Honey', trophy: 55600000, change: { type: 'down', value: 1 } },
  { rank: 14, name: 'Sugar', trophy: 55400000, change: { type: 'up', value: 1 } },
  { rank: 15, name: '강천', trophy: 55200000, change: { type: 'down', value: 1 } },
  { rank: 16, name: 'Sweet', trophy: 55000000, change: { type: 'up', value: 1 } },
  { rank: 17, name: 'Cream', trophy: 54800000, change: { type: 'down', value: 1 } },
  { rank: 18, name: 'Milk', trophy: 54600000, change: { type: 'up', value: 2 } },
  { rank: 19, name: 'Butter', trophy: 54400000, change: { type: 'down', value: 1 } },
  { rank: 20, name: 'Flour', trophy: 54200000, change: { type: 'up', value: 1 } },
  { rank: 21, name: 'Egg', trophy: 54000000, change: { type: 'down', value: 1 } },
  { rank: 22, name: 'Salt', trophy: 53800000, change: { type: 'up', value: 1 } },
  { rank: 23, name: 'Pepper', trophy: 53600000, change: { type: 'down', value: 1 } },
  { rank: 24, name: 'Spice', trophy: 53400000, change: { type: 'up', value: 2 } },
  { rank: 25, name: 'Herb', trophy: 53200000, change: { type: 'down', value: 1 } },
  { rank: 26, name: 'Ginger', trophy: 53000000, change: { type: 'up', value: 1 } },
  { rank: 27, name: 'Garlic', trophy: 52800000, change: { type: 'down', value: 1 } },
  { rank: 28, name: 'Onion', trophy: 52600000, change: { type: 'up', value: 1 } },
  { rank: 29, name: 'PeachTea', trophy: 52400000, change: { type: 'down', value: 1 } },
  { rank: 30, name: 'GreenTea', trophy: 52200000, change: { type: 'up', value: 1 } }
]

const formatNumber = (num: number): string => {
  return num.toLocaleString()
}
</script>

<style scoped>
.hollyberry-ranking {
  background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
  border-radius: 20px;
  padding: 30px;
  margin: 40px 0;
  box-shadow: 0 20px 40px rgba(255, 107, 107, 0.3);
  position: relative;
  overflow: hidden;
}

.hollyberry-ranking::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="10" cy="60" r="0.5" fill="rgba(255,255,255,0.05)"/><circle cx="90" cy="40" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none;
}

.ranking-header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.server-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.server-icon {
  font-size: 3rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.server-info h2 {
  color: white;
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.02em;
}

.season-info {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 20px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.ranking-table {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
}

.table-header {
  display: grid;
  grid-template-columns: 100px 1fr 150px;
  background: linear-gradient(135deg, #d63031 0%, #e17055 100%);
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
}

.header-cell {
  padding: 20px 15px;
  text-align: center;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.header-cell:last-child {
  border-right: none;
}

.header-cell.rank {
  text-align: left;
}

.header-cell.trophy {
  text-align: right;
}

.table-body {
  max-height: 600px;
  overflow-y: auto;
}

.table-row {
  display: grid;
  grid-template-columns: 100px 1fr 150px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
}

.table-row:hover {
  background: rgba(255, 107, 107, 0.05);
  transform: translateX(5px);
}

.table-row.top-three {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%);
  border-left: 4px solid #ffd700;
}

.table-row.top-three:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 193, 7, 0.2) 100%);
}

.rank-cell {
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

.rank-number {
  font-weight: 700;
  font-size: 1.2rem;
  color: #2d3436;
  margin-bottom: 4px;
}

.rank-change {
  font-size: 0.9rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.rank-change.up {
  background: rgba(0, 184, 148, 0.2);
  color: #00b894;
}

.rank-change.down {
  background: rgba(214, 48, 49, 0.2);
  color: #d63031;
}

.guild-cell {
  padding: 15px;
  display: flex;
  align-items: center;
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

.guild-name {
  font-weight: 600;
  color: #2d3436;
  font-size: 1.1rem;
}

.trophy-cell {
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.trophy-value {
  font-weight: 700;
  color: #2d3436;
  font-size: 1.1rem;
  font-family: 'Courier New', monospace;
}

/* Scrollbar styling */
.table-body::-webkit-scrollbar {
  width: 8px;
}

.table-body::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}

.table-body::-webkit-scrollbar-thumb {
  background: rgba(255, 107, 107, 0.5);
  border-radius: 4px;
}

.table-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 107, 107, 0.7);
}

/* Responsive design */
@media (max-width: 768px) {
  .hollyberry-ranking {
    padding: 20px;
    margin: 20px 0;
  }
  
  .server-info h2 {
    font-size: 2rem;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 80px 1fr 120px;
  }
  
  .header-cell,
  .rank-cell,
  .guild-cell,
  .trophy-cell {
    padding: 12px 10px;
  }
  
  .trophy-value {
    font-size: 1rem;
  }
}
</style>
