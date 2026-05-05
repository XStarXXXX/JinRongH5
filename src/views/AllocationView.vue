<template>
  <div class="page-container">
    <div class="header-section">
      <h1 class="title-main">资产国库</h1>
      <button class="add-btn" @click="openAddModal">
        <Plus :size="20" />
      </button>
    </div>

    <div class="q-card total-card">
      <span class="label">资产净值</span>
      <div class="total-amount">￥{{ store.totalAssets.toLocaleString() }}</div>
      <div class="liquidity-bar">
        <div class="liq-fill" :style="{ width: ((store.liquidAssets / store.totalAssets) * 100) + '%' }"></div>
        <span class="liq-label">流动性: {{ ((store.liquidAssets / store.totalAssets) * 100).toFixed(0) }}%</span>
      </div>
    </div>

    <div class="section-header">
      <h2>资产明细</h2>
      <span class="hint">点击科目可修改</span>
    </div>

    <div class="allocation-grid">
      <div v-for="item in store.assetAllocation" :key="item.id" class="grid-item q-card clickable" @click="openEditModal(item)">
        <div class="item-top">
          <div class="item-icon-bg" :style="{ background: item.color }">
            <component :is="getIcon(item.id)" :size="18" color="#FFF" />
          </div>
          <span class="item-percent">{{ ((item.amount / store.totalAssets) * 100).toFixed(1) }}%</span>
        </div>
        <div class="item-bottom">
          <span class="item-name">{{ item.label }}</span>
          <span class="item-value">￥{{ formatCompact(item.amount) }}</span>
        </div>
      </div>
    </div>

    <!-- Edit/Add Asset Modal -->
    <div v-if="showModal" class="q-modal-mask" @click.self="showModal = false">
      <div class="q-modal-container">
        <div class="modal-header">
          <h3>{{ editingId ? '编辑资产' : '新增资产' }}</h3>
          <button class="close-btn" @click="showModal = false"><X :size="20" /></button>
        </div>
        
        <div class="form-body">
          <div class="input-group">
            <label>资产名称</label>
            <input type="text" v-model="form.label" placeholder="例如：某某理财" />
          </div>

          <div class="input-group">
            <label>当前金额</label>
            <input type="number" v-model="form.amount" placeholder="0.00" />
          </div>

          <div class="input-group checkbox-group">
            <input type="checkbox" v-model="form.isLiquid" id="isLiquid" />
            <label for="isLiquid">高流动性 (可随时变现)</label>
          </div>

          <div class="modal-actions">
            <button v-if="editingId" class="delete-btn-modal" @click="handleDelete">删除科目</button>
            <button class="q-button submit-btn" @click="handleSave">保存变更</button>
          </div>
        </div>
      </div>
    </div>

    <div class="q-card advice-card">
      <div class="advice-header">
        <ShieldCheck :size="20" color="#C5A059" />
        <h3>专家配置建议</h3>
      </div>
      <p class="advice-content">{{ getAdvice() }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAssetStore } from '../store/assets'
import { Wallet, Landmark, TrendingUp, Heart, Layers, ShieldCheck, Plus, X } from 'lucide-vue-next'

const store = useAssetStore()
const showModal = ref(false)
const editingId = ref(null)

const form = reactive({
  label: '',
  amount: '',
  isLiquid: true,
  color: '#C5A059'
})

const formatCompact = (val) => {
  if (val >= 10000) return (val / 10000).toFixed(1) + '万'
  return val.toLocaleString()
}

const getIcon = (id) => {
  const iconMap = {
    funds: TrendingUp,
    bonds: Layers,
    savings: Landmark,
    selfInvestment: Heart,
    others: Wallet
  }
  return iconMap[id] || Wallet
}

const openEditModal = (item) => {
  editingId.value = item.id
  form.label = item.label
  form.amount = item.amount
  form.isLiquid = item.isLiquid
  form.color = item.color
  showModal.value = true
}

const openAddModal = () => {
  editingId.value = null
  form.label = ''
  form.amount = ''
  form.isLiquid = true
  form.color = '#D4AF37'
  showModal.value = true
}

const handleSave = () => {
  if (!form.label || !form.amount) return
  
  if (editingId.value) {
    const asset = store.assetAllocation.find(a => a.id === editingId.value)
    if (asset) {
      asset.label = form.label
      asset.amount = parseFloat(form.amount)
      asset.isLiquid = form.isLiquid
    }
  } else {
    store.addAssetCategory({
      label: form.label,
      amount: parseFloat(form.amount),
      isLiquid: form.isLiquid,
      color: form.color
    })
  }
  showModal.value = false
}

const handleDelete = () => {
  if (confirm('确定删除此科目吗？')) {
    store.deleteAssetCategory(editingId.value)
    showModal.value = false
  }
}

const getAdvice = () => {
  const savingsPercent = (store.liquidAssets / store.totalAssets) * 100
  if (savingsPercent > 60) return '您的流动性储备过于充裕。建议将其中的 20%-30% 转化为长期债权或指数基金，以对抗通胀并提升长期购买力。'
  if (savingsPercent < 20) return '当前现金比例较低。在经济波动期，建议保留至少 6 个月的固定开支作为安全垫，以应对突发状况。'
  return '您的资产结构非常优雅且平衡。目前各类资产占比均在合理区间，建议继续保持定投习惯，静待时间复利。'
}
</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.add-btn {
  width: 40px;
  height: 40px;
  background: #FFF;
  border: 1px solid rgba(197, 160, 89, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary-color);
  cursor: pointer;
}

.total-card {
  background: #FFF;
  text-align: center;
  padding: 32px;
  margin-bottom: 32px;
}

.total-card .label {
  font-size: 13px;
  color: #999;
}

.total-amount {
  font-size: 36px;
  font-weight: 700;
  margin: 12px 0;
  color: #333;
}

.liquidity-bar {
  width: 100%;
  height: 20px;
  background: #F5F5F5;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  margin-top: 16px;
}

.liq-fill {
  height: 100%;
  background: var(--gold-gradient);
  transition: width 1s ease;
}

.liq-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 10px;
  color: #333;
  font-weight: 600;
  mix-blend-mode: multiply;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.hint {
  font-size: 11px;
  color: #AAA;
}

.allocation-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.grid-item.clickable:active {
  transform: scale(0.95);
}

.item-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-icon-bg {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-percent {
  font-size: 12px;
  color: var(--primary-color);
  font-weight: 700;
}

.item-bottom {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-size: 13px;
  color: #999;
}

.item-value {
  font-size: 16px;
  font-weight: 700;
  color: #333;
}

/* Modal internal */
.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: -8px;
}

.checkbox-group input {
  width: 18px;
  height: 18px;
  margin-bottom: 0;
}

.checkbox-group label {
  font-size: 13px;
  color: #666;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.delete-btn-modal {
  flex: 1;
  padding: 12px;
  background: #FFEBEE;
  color: #C62828;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

.submit-btn {
  flex: 2;
}

.advice-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.advice-header h3 {
  font-size: 15px;
  font-weight: 700;
  color: #333;
}

.advice-content {
  font-size: 13px;
  line-height: 1.8;
  color: #666;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.close-btn {
  background: #F5F5F5;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
