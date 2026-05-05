<template>
  <div class="page-container">
    <div class="header-section">
      <h1 class="title-main">智能先知</h1>
      <div class="help-icon">
        <HelpCircle :size="20" color="#2C2C2C" />
      </div>
    </div>

    <div class="strategy-tabs">
      <div 
        v-for="s in strategies" 
        :key="s.id"
        :class="['tab-node', { active: activeStrategy === s.id }]"
        @click="activeStrategy = s.id"
      >
        <div class="node-icon">
          <component :is="s.icon" :size="18" />
        </div>
        <span>{{ s.name }}</span>
      </div>
    </div>

    <div class="q-card result-card">
      <div class="yield-header">
        <h3>预期年化收益</h3>
        <span class="tag" :class="currentStrategy.riskLevel">{{ currentStrategy.risk }}风险</span>
      </div>
      
      <div class="yield-main" :key="activeStrategy">
        <span class="yield-value">{{ currentStrategy.return }}%</span>
        <div class="yield-comparison">
          <span class="label">比当前提升</span>
          <span class="value">+{{ (currentStrategy.return - 4.2).toFixed(1) }}%</span>
        </div>
      </div>

      <div class="metrics-row">
        <div class="metric">
          <span class="m-label">波动程度</span>
          <span class="m-value">{{ currentStrategy.volatility }}</span>
        </div>
        <div class="metric">
          <span class="m-label">建议周期</span>
          <span class="m-value">3-5年</span>
        </div>
      </div>
    </div>

    <div class="q-card allocation-card">
      <div class="section-title">
        <h3>推荐配置比例</h3>
      </div>
      <div class="allocation-bars">
        <div v-for="item in currentStrategy.allocation" :key="item.label" class="bar-item">
          <div class="bar-labels">
            <span class="b-name">{{ item.label }}</span>
            <span class="b-percent">{{ item.percent }}%</span>
          </div>
          <div class="bar-track">
            <div class="bar-thumb" :style="{ width: item.percent + '%', background: item.color }"></div>
          </div>
        </div>
      </div>
    </div>

    <button class="q-button apply-btn" @click="handleApply">
      一键应用此策略
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Shield, ShieldAlert, Zap, HelpCircle } from 'lucide-vue-next'

const activeStrategy = ref('balanced')

const strategies = [
  { id: 'conservative', name: '保守型', icon: Shield, return: 3.5, risk: '低', riskLevel: 'low', volatility: '平稳', allocation: [
    { label: '储蓄', percent: 70, color: '#C5A059' },
    { label: '债券', percent: 20, color: '#E5D1B0' },
    { label: '基金', percent: 10, color: '#D4AF37' }
  ]},
  { id: 'balanced', name: '稳健型', icon: ShieldAlert, return: 6.5, risk: '中', riskLevel: 'mid', volatility: '适中', allocation: [
    { label: '储蓄', percent: 40, color: '#C5A059' },
    { label: '债券', percent: 30, color: '#E5D1B0' },
    { label: '基金', percent: 30, color: '#D4AF37' }
  ]},
  { id: 'aggressive', name: '进取型', icon: Zap, return: 12.0, risk: '高', riskLevel: 'high', volatility: '较高', allocation: [
    { label: '储蓄', percent: 20, color: '#C5A059' },
    { label: '债券', percent: 10, color: '#E5D1B0' },
    { label: '基金', percent: 70, color: '#D4AF37' }
  ]}
]

const currentStrategy = computed(() => 
  strategies.find(s => s.id === activeStrategy.value)
)

const handleApply = () => {
  alert('策略应用请求已提交，正在为您生成调仓指令。')
}
</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title-main {
  margin-bottom: 0;
}

.strategy-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding: 4px;
  scrollbar-width: none;
}

.strategy-tabs::-webkit-scrollbar {
  display: none;
}

.tab-node {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #FFF;
  border-radius: 20px;
  border: 1px solid #EEE;
  transition: all 0.3s;
  cursor: pointer;
}

.tab-node span {
  font-size: 13px;
  font-weight: 600;
  color: #999;
}

.tab-node.active {
  background: #FDF9F0;
  border-color: var(--primary-color);
}

.tab-node.active span {
  color: var(--primary-color);
}

.node-icon {
  color: #AAA;
}

.tab-node.active .node-icon {
  color: var(--primary-color);
}

.result-card {
  padding: 24px;
}

.yield-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.yield-header h3 {
  font-size: 14px;
  color: #999;
}

.tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

.tag.low { background: #E8F5E9; color: #2E7D32; }
.tag.mid { background: #FFF3E0; color: #EF6C00; }
.tag.high { background: #FFEBEE; color: #C62828; }

.yield-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.yield-value {
  font-size: 48px;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.yield-comparison {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.yield-comparison .label {
  color: #999;
}

.yield-comparison .value {
  color: #27AE60;
  font-weight: 700;
}

.metrics-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding-top: 20px;
  border-top: 1px solid #F5F5F5;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.m-label {
  font-size: 11px;
  color: #AAA;
}

.m-value {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.allocation-card {
  padding: 24px;
}

.section-title h3 {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 20px;
}

.allocation-bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
}

.b-name {
  color: #666;
}

.b-percent {
  color: var(--primary-color);
}

.bar-track {
  height: 6px;
  background: #F5F5F5;
  border-radius: 3px;
  overflow: hidden;
}

.bar-thumb {
  height: 100%;
  border-radius: 3px;
  transition: width 1s cubic-bezier(0.23, 1, 0.32, 1);
}

.apply-btn {
  width: 100%;
  margin-top: 32px;
}
</style>
