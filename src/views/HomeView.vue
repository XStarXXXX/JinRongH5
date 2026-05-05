<template>
  <div class="page-container">
    <div class="header-section">
      <h1 class="title-main">财务看板</h1>
      <div class="user-profile">
        <User :size="20" color="#2C2C2C" />
      </div>
    </div>
    
    <!-- Overall Summary -->
    <div class="summary-section">
      <div class="balance-card" ref="balanceCard">
        <span class="label">资产总计 (元)</span>
        <div class="amount">{{ formatNumber(store.totalAssets) }}</div>
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-label">本月收入</span>
            <span class="stat-value income">￥{{ formatNumber(store.totalIncome) }}</span>
          </div>
          <div class="divider"></div>
          <div class="stat-item">
            <span class="stat-label">本月支出</span>
            <span class="stat-value expense">￥{{ formatNumber(store.totalExpense) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- App Style Grid -->
    <div class="app-grid">
      <div class="grid-item q-card engel-card">
        <div class="card-header">
          <Utensils :size="18" color="#C5A059" />
          <h3>恩格尔系数</h3>
        </div>
        <div class="engel-content">
          <span class="percent">{{ store.engelCoefficient }}%</span>
          <span class="desc">{{ getEngelDesc(store.engelCoefficient) }}</span>
        </div>
      </div>

      <div class="grid-item q-card budget-card">
        <div class="card-header">
          <Target :size="18" color="#C5A059" />
          <h3>预算进度</h3>
        </div>
        <div class="budget-content">
          <div class="budget-info">
            <span class="percent">{{ ((store.totalExpense / store.monthlyBudget) * 100).toFixed(0) }}%</span>
            <span class="desc">剩余￥{{ formatNumber(store.monthlyBudget - store.totalExpense) }}</span>
          </div>
          <div class="budget-bar-bg">
            <div class="budget-bar-fill" :style="{ width: Math.min((store.totalExpense / store.monthlyBudget) * 100, 100) + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Financial Analysis Section (New) -->
    <div class="section-header">
      <h2>财务洞察</h2>
    </div>
    <div class="q-card insight-card">
      <div class="insight-grid">
        <div class="insight-item">
          <div class="i-icon"><TrendingUp :size="16" /></div>
          <div class="i-content">
            <span class="i-label">月结余率</span>
            <span class="i-value">{{ store.savingsRate }}%</span>
          </div>
        </div>
        <div class="insight-item">
          <div class="i-icon"><Heart :size="16" /></div>
          <div class="i-content">
            <span class="i-label">自我投资</span>
            <span class="i-value">￥{{ formatNumber(store.selfInvestmentTotal) }}</span>
          </div>
        </div>
        <div class="insight-item">
          <div class="i-icon"><Zap :size="16" /></div>
          <div class="i-content">
            <span class="i-label">流动比率</span>
            <span class="i-value">{{ ((store.liquidAssets / store.totalAssets) * 100).toFixed(1) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Asset Allocation Preview -->
    <div class="section-header">
      <h2>资产分布</h2>
      <router-link to="/allocation">详情 <ChevronRight :size="16" /></router-link>
    </div>
    <div class="q-card allocation-card">
      <div class="asset-rows">
        <div v-for="item in store.assetAllocation" :key="item.id" class="asset-row">
          <div class="row-info">
            <span class="row-label">{{ item.label }}</span>
            <span class="row-value">￥{{ formatNumber(item.amount) }}</span>
          </div>
          <div class="row-progress-bg">
            <div class="row-progress-fill" :style="{ width: (item.amount / store.totalAssets * 100) + '%', background: item.color }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAssetStore } from '../store/assets'
import { Utensils, ChevronRight, User, ShieldCheck, Target, TrendingUp, Heart, Zap } from 'lucide-vue-next'
import gsap from 'gsap'

const store = useAssetStore()
const balanceCard = ref(null)

const formatNumber = (num) => {
  return num.toLocaleString()
}

const getEngelDesc = (val) => {
  if (val < 20) return '极富'
  if (val < 30) return '富裕'
  if (val < 40) return '小康'
  if (val < 50) return '温饱'
  return '贫困'
}

const getBriefAdvice = () => {
  const savingsPercent = (store.assetAllocation.savings / store.totalAssets) * 100
  if (savingsPercent > 60) return '现金较多，建议增加投资。'
  if (savingsPercent < 20) return '备用金不足，请注意流动性。'
  return '配置稳健，请继续保持。'
}

const getAssetLabel = (key) => {
  const labels = {
    funds: '基金',
    bonds: '债券',
    savings: '储蓄',
    selfInvestment: '自我投资',
    others: '其他'
  }
  return labels[key] || key
}

const getAssetColor = (key) => {
  const colors = {
    funds: '#D4AF37',
    bonds: '#E5D1B0',
    savings: '#C5A059',
    selfInvestment: '#F5E6CC',
    others: '#A0A0A0'
  }
  return colors[key] || '#eee'
}

onMounted(() => {
  gsap.from(balanceCard.value, {
    y: 30,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  })
  
  gsap.from('.q-card', {
    y: 20,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power2.out',
    delay: 0.2
  })
})
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
  text-align: left;
}

.user-profile {
  width: 40px;
  height: 40px;
  background: #FFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: 1px solid rgba(197, 160, 89, 0.1);
}

.balance-card {
  background: var(--primary-color);
  background: var(--gold-gradient);
  border-radius: 24px;
  padding: 32px 24px;
  color: #FFF;
  text-align: center;
  margin-bottom: 24px;
  box-shadow: 0 20px 40px rgba(197, 160, 89, 0.2);
  border: 1px solid rgba(255,255,255,0.2);
}

.balance-card .label {
  font-size: 13px;
  opacity: 0.9;
  letter-spacing: 1px;
}

.balance-card .amount {
  font-size: 36px;
  font-weight: 700;
  margin: 12px 0 24px;
  letter-spacing: 1px;
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.2);
}

.divider {
  width: 1px;
  height: 24px;
  background: rgba(255,255,255,0.3);
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 11px;
  opacity: 0.8;
  margin-bottom: 4px;
}

.stat-value {
  font-weight: 600;
  font-size: 16px;
}

.app-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.grid-item {
  margin-bottom: 0;
  padding: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.card-header h3 {
  font-size: 13px;
  color: #777;
  font-weight: 600;
}

.engel-content {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.percent {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-color);
}

.desc {
  font-size: 11px;
  color: #999;
}

.budget-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.budget-info {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.budget-bar-bg {
  height: 6px;
  background: #F0F0F0;
  border-radius: 3px;
  overflow: hidden;
}

.budget-bar-fill {
  height: 100%;
  background: var(--gold-gradient);
  border-radius: 3px;
}

.insight-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.insight-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}

.i-icon {
  width: 32px;
  height: 32px;
  background: #FDF9F0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
}

.i-content {
  display: flex;
  flex-direction: column;
}

.i-label {
  font-size: 10px;
  color: #999;
}

.i-value {
  font-size: 12px;
  font-weight: 700;
  color: #333;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  margin-bottom: 0;
}

.section-header a {
  font-size: 13px;
  color: var(--primary-color);
  text-decoration: none;
  display: flex;
  align-items: center;
  font-weight: 600;
}

.asset-rows {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.asset-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.row-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
}

.row-label {
  color: #666;
}

.row-progress-bg {
  height: 6px;
  background: #F0F0F0;
  border-radius: 3px;
  overflow: hidden;
}

.row-progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1s ease-out;
}
</style>
