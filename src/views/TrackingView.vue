<template>
  <div class="page-container">
    <div class="header-section">
      <h1 class="title-main">账单流水</h1>
      <button class="add-fab" @click="showModal = true">
        <Plus :size="24" />
      </button>
    </div>
    
    <div class="dimension-selector">
      <button 
        :class="['dim-btn', { active: timeDimension === 'month' }]"
        @click="timeDimension = 'month'"
      >月度视图</button>
      <button 
        :class="['dim-btn', { active: timeDimension === 'year' }]"
        @click="timeDimension = 'year'"
      >年度视图</button>
    </div>

    <div class="type-selector">
      <button 
        :class="['type-btn', { active: activeType === 'expense' }]"
        @click="activeType = 'expense'"
      >支出</button>
      <button 
        :class="['type-btn', { active: activeType === 'income' }]"
        @click="activeType = 'income'"
      >收入</button>
    </div>

    <!-- Data Visualization Section (Enlarged) -->
    <div class="q-card chart-card" v-if="filteredRecords.length > 0">
      <div class="chart-wrapper">
        <div class="pie-box">
          <svg viewBox="0 0 100 100" class="pie-svg">
            <circle 
              v-for="(slice, index) in pieData" 
              :key="index"
              r="15.9155" cx="50" cy="50"
              fill="transparent"
              stroke-width="12"
              :stroke="slice.color"
              :stroke-dasharray="`${slice.percentage} 100`"
              :stroke-dashoffset="slice.offset"
              class="pie-slice"
              @mouseenter="hoveredIndex = index"
              @mouseleave="hoveredIndex = null"
              :style="{ 
                strokeWidth: hoveredIndex === index ? '15' : '12',
                filter: hoveredIndex === index ? 'brightness(1.1)' : 'none'
              }"
            />
          </svg>
        </div>
        
        <div class="total-display">
          <span class="total-label">{{ timeDimension === 'month' ? '本月总计' : '年度总计' }}</span>
          <span class="total-val">￥{{ formatNumber(dimensionTotal) }}</span>
        </div>

        <div class="chart-legend">
          <div v-for="(slice, index) in pieData" 
               :key="slice.label" 
               class="legend-item"
               @mouseenter="hoveredIndex = index"
               @mouseleave="hoveredIndex = null"
               :class="{ active: hoveredIndex === index }">
            <span class="dot" :style="{ background: slice.color }"></span>
            <div class="l-info">
              <span class="l-label">{{ slice.label }}</span>
              <span class="l-val">{{ slice.percentage.toFixed(1) }}%</span>
            </div>
            <span class="l-amount">￥{{ formatNumber(slice.amount) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="recent-list">
      <div class="section-header">
        <h2>{{ timeDimension === 'month' ? '本月明细' : '本年明细' }}</h2>
        <span class="count">{{ filteredRecords.length }} 笔记录</span>
      </div>
      
      <transition-group name="list" tag="div" class="records-container">
        <div v-for="item in filteredRecords" :key="item.id || item.date + item.amount" class="record-card-wrapper">
          <div class="record-item q-card" @click="handleEdit(item)">
            <div class="record-main">
              <div class="record-icon-bg">
                <component :is="getCategoryIcon(item.type)" :size="18" color="#C5A059" />
              </div>
              <div class="record-info">
                <div class="type-row">
                  <span class="record-type">{{ item.type }}</span>
                  <button v-if="item.subItems && item.subItems.length > 0" 
                          class="expand-toggle" 
                          @click.stop="toggleExpand(item.id)">
                    <component :is="expandedIds.has(item.id) ? ChevronDown : ChevronRight" :size="14" />
                  </button>
                </div>
                <span class="record-date">{{ item.date }}</span>
              </div>
            </div>
            <div class="record-actions">
              <div :class="['record-amount', activeType === 'income' ? 'income' : 'expense']">
                {{ activeType === 'income' ? '+' : '-' }}￥{{ formatNumber(item.amount) }}
              </div>
              <button class="delete-btn" @click.stop="handleDelete(item.id)">
                <Trash2 :size="16" />
              </button>
            </div>
          </div>
          
          <!-- Sub-items expansion -->
          <div v-if="expandedIds.has(item.id) && item.subItems" class="sub-items-list">
            <div v-for="sub in item.subItems" :key="sub.id" class="sub-item">
              <span class="sub-label">{{ sub.label }}</span>
              <span class="sub-amount">￥{{ formatNumber(sub.amount) }}</span>
            </div>
          </div>
        </div>
      </transition-group>
      
      <div v-if="recentRecords.length === 0" class="empty-state">
        <Inbox :size="48" color="#E0E0E0" />
        <p>暂无记录</p>
      </div>
    </div>

    <!-- Elegant Modal for Adding/Editing Record -->
    <div v-if="showModal" class="q-modal-mask" @click.self="handleCloseModal">
      <div class="q-modal-container">
        <div class="modal-header">
          <h3>{{ editingId ? '编辑' : '新增' }}{{ activeType === 'expense' ? '支出' : '收入' }}</h3>
          <button class="close-btn" @click="handleCloseModal">
            <X :size="20" />
          </button>
        </div>
        
        <div class="form-body">
          <div class="input-group">
            <label>金额</label>
            <div class="amount-input">
              <span class="currency">￥</span>
              <input type="number" v-model="form.amount" placeholder="0.00" ref="amountInput" :disabled="form.type === '自我投资' && form.subItems.length > 0" />
            </div>
            <p v-if="form.type === '自我投资' && form.subItems.length > 0" class="amount-tip">金额由子项合计得出</p>
          </div>

          <div class="input-group">
            <label>分类</label>
            <div class="category-grid">
              <button 
                v-for="opt in categories" 
                :key="opt" 
                :class="['cat-item', { active: form.type === opt }]"
                @click="form.type = opt"
              >
                {{ opt }}
              </button>
            </div>
          </div>

          <!-- Sub-items for Self Investment -->
          <div v-if="form.type === '自我投资'" class="input-group sub-items-section">
            <div class="sub-header">
              <label>具体项目 (二级分类)</label>
              <button class="add-sub-btn" @click="addSubItem">
                <Plus :size="14" /> 添加
              </button>
            </div>
            <div class="sub-items-edit">
              <div v-for="(sub, index) in form.subItems" :key="index" class="sub-edit-row">
                <input type="text" v-model="sub.label" placeholder="项目名称 (如: AI图书)" class="sub-label-input" />
                <input type="number" v-model="sub.amount" placeholder="金额" class="sub-amount-input" @input="updateTotalFromSubItems" />
                <button class="remove-sub-btn" @click="removeSubItem(index)">
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
          </div>

          <div class="input-group">
            <label>月份</label>
            <input type="month" v-model="form.date" />
          </div>

          <button class="q-button submit-btn" @click="handleSubmit">
            {{ editingId ? '保存修改' : '确认入账' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, watch } from 'vue'
import { useAssetStore } from '../store/assets'
import { Plus, Trash2, X, Inbox, Utensils, ShoppingBag, GraduationCap, CreditCard, Wallet, Banknote, Briefcase, TrendingUp, ChevronDown, ChevronRight } from 'lucide-vue-next'

const store = useAssetStore()
const activeType = ref('expense')
const timeDimension = ref('month') // 'month' or 'year'
const showModal = ref(false)
const editingId = ref(null)
const amountInput = ref(null)
const hoveredIndex = ref(null)
const expandedIds = ref(new Set())

const toggleExpand = (id) => {
  const newSet = new Set(expandedIds.value)
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
  }
  expandedIds.value = newSet
}

const expenseCategories = ['餐饮消费', '生活消费', '自我投资', '还款', '其他']
const incomeCategories = ['工资', '副业', '分红', '其他']

const categories = computed(() => 
  activeType.value === 'expense' ? expenseCategories : incomeCategories
)

const formatNumber = (num) => num ? num.toLocaleString() : '0'

const filteredRecords = computed(() => {
  const records = activeType.value === 'expense' ? store.expenseRecords : store.incomeRecords
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  return records.filter(r => {
    const d = new Date(r.date)
    const recordYear = d.getFullYear()
    const recordMonth = d.getMonth()
    
    if (timeDimension.value === 'year') {
      return recordYear === currentYear
    }
    return recordYear === currentYear && recordMonth === currentMonth
  }).reverse()
})

const dimensionTotal = computed(() => {
  return filteredRecords.value.reduce((sum, r) => sum + r.amount, 0)
})

const pieData = computed(() => {
  const total = dimensionTotal.value
  if (total === 0) return []
  
  const groups = filteredRecords.value.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + r.amount
    return acc
  }, {})

  // Higher contrast luxury palette
  const colors = [
    '#C5A059', // Champagne Gold
    '#2C3E50', // Deep Navy
    '#8A6E2F', // Bronze
    '#D4AF37', // Gold
    '#5C4033'  // Dark Brown
  ]
  let currentOffset = 0
  
  return Object.keys(groups).map((label, index) => {
    const amount = groups[label]
    const percentage = (amount / total) * 100
    const offset = -currentOffset
    currentOffset += percentage
    
    return {
      label,
      percentage,
      amount,
      offset,
      color: colors[index % colors.length]
    }
  })
})

const form = reactive({
  amount: '',
  type: '',
  date: new Date().toISOString().slice(0, 7), // YYYY-MM
  subItems: []
})

const addSubItem = () => {
  form.subItems.push({ id: Date.now(), label: '', amount: '' })
}

const removeSubItem = (index) => {
  form.subItems.splice(index, 1)
  updateTotalFromSubItems()
}

const updateTotalFromSubItems = () => {
  if (form.type === '自我投资' && form.subItems.length > 0) {
    const total = form.subItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
    form.amount = total
  }
}

watch(() => form.type, (newType) => {
  if (newType === '自我投资' && form.subItems.length === 0 && !editingId.value) {
    addSubItem()
  }
})

// Initialize type when categories change or modal opens
watch([categories, showModal], () => {
  if (showModal.value && !form.type) {
    form.type = categories.value[0]
  }
})

const recentRecords = computed(() => {
  const records = activeType.value === 'expense' ? store.expenseRecords : store.incomeRecords
  return [...records].reverse()
})

const getCategoryIcon = (type) => {
  const iconMap = {
    '餐饮消费': Utensils,
    '生活消费': ShoppingBag,
    '自我投资': GraduationCap,
    '还款': CreditCard,
    '工资': Banknote,
    '副业': Briefcase,
    '分红': TrendingUp,
    '其他': Wallet
  }
  return iconMap[type] || Wallet
}

const handleEdit = (item) => {
  editingId.value = item.id
  form.amount = item.amount
  form.type = item.type
  form.date = item.date
  form.subItems = item.subItems ? JSON.parse(JSON.stringify(item.subItems)) : []
  showModal.value = true
}

const handleCloseModal = () => {
  showModal.value = false
  editingId.value = null
  form.amount = ''
  form.type = ''
  form.date = new Date().toISOString().slice(0, 7)
  form.subItems = []
}

const handleSubmit = () => {
  if (!form.amount) return
  
  const record = {
    amount: parseFloat(form.amount),
    type: form.type,
    date: form.date,
    subItems: form.type === '自我投资' ? form.subItems.filter(s => s.label && s.amount) : []
  }

  if (editingId.value) {
    if (activeType.value === 'expense') {
      store.updateExpense(editingId.value, record)
    } else {
      store.updateIncome(editingId.value, record)
    }
  } else {
    if (activeType.value === 'expense') {
      store.addExpense(record)
    } else {
      store.addIncome(record)
    }
  }

  handleCloseModal()
}

const handleDelete = (id) => {
  if (confirm('确定删除该笔记录吗？')) {
    if (activeType.value === 'expense') {
      store.expenseRecords = store.expenseRecords.filter(r => r.id !== id)
    } else {
      store.incomeRecords = store.incomeRecords.filter(r => r.id !== id)
    }
  }
}

watch(showModal, (val) => {
  if (val) {
    nextTick(() => {
      amountInput.value?.focus()
    })
  }
})
</script>

<style scoped>
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.add-fab {
  width: 44px;
  height: 44px;
  background: var(--gold-gradient);
  border: none;
  border-radius: 50%;
  color: #FFF;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 16px rgba(197, 160, 89, 0.3);
  cursor: pointer;
}

.type-selector {
  display: flex;
  background: #EEE;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 32px;
}

.type-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-weight: 600;
  color: #999;
  transition: all 0.3s;
  font-size: 13px;
}

.type-btn.active {
  background: #FFF;
  color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.count {
  font-size: 12px;
  color: #999;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
}

.record-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.record-icon-bg {
  width: 40px;
  height: 40px;
  background: #FDF9F0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.record-info {
  display: flex;
  flex-direction: column;
}

.record-type {
  font-weight: 600;
  font-size: 15px;
  color: #333;
}

.type-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.expand-toggle {
  background: transparent;
  border: none;
  padding: 2px;
  display: flex;
  align-items: center;
  color: #999;
  cursor: pointer;
}

.sub-items-list {
  padding: 0 16px 12px 68px;
  margin-top: -8px;
  margin-bottom: 12px;
}

.sub-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  padding: 4px 0;
  border-bottom: 1px dashed #F0F0F0;
}

.sub-item:last-child {
  border-bottom: none;
}

.sub-amount {
  font-weight: 600;
  color: #333;
}

.record-date {
  font-size: 11px;
  color: #AAA;
  margin-top: 2px;
}

.record-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.record-amount {
  font-weight: 700;
  font-size: 17px;
}

.record-amount.income { color: #27AE60; }
.record-amount.expense { color: #333; }

.delete-btn {
  background: transparent;
  border: none;
  color: #EEE;
  padding: 4px;
  cursor: pointer;
  transition: color 0.3s;
}

.record-item:hover .delete-btn {
  color: #FF7675;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #DDD;
}

.empty-state p {
  margin-top: 12px;
  font-size: 14px;
}

.dimension-selector {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.dim-btn {
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid #EEE;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: #999;
  cursor: pointer;
  transition: all 0.3s;
}

.dim-btn.active {
  background: var(--text-color);
  color: #FFF;
  border-color: var(--text-color);
}

/* Pie Chart Styles */
.chart-card {
  padding: 32px 24px;
}

.chart-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.pie-box {
  width: 280px;
  height: 280px;
  position: relative;
}

.pie-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.total-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.total-label {
  font-family: 'Noto Serif SC', serif;
  font-size: 12px;
  color: #999;
}

.total-val {
  font-family: 'Bodoni Moda', serif;
  font-size: 28px;
  font-weight: 700;
  color: #333;
}

.pie-slice {
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  cursor: pointer;
  transform-origin: center;
}

.chart-center-label {
  font-family: 'Noto Serif SC', serif;
  font-size: 6px;
  fill: #999;
  transform: rotate(90deg);
  transform-origin: center;
}

.chart-center-val {
  font-family: 'Bodoni Moda', serif;
  font-size: 8px;
  font-weight: 700;
  fill: #333;
  transform: rotate(90deg);
  transform-origin: center;
}

.chart-legend {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.legend-item.active {
  background: #F8F9FA;
  transform: translateX(4px);
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.l-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.l-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.l-val {
  font-size: 11px;
  color: #999;
}

.l-amount {
  font-family: 'Bodoni Moda', serif;
  font-size: 14px;
  font-weight: 700;
  color: #333;
}

/* Modal Internal Styles */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
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
  cursor: pointer;
}

.amount-input {
  display: flex;
  align-items: center;
  border-bottom: 2px solid #F0F0F0;
  padding-bottom: 12px;
  margin-top: 8px;
}

.currency {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
  margin-right: 8px;
}

.amount-input input {
  border: none;
  font-size: 40px;
  font-weight: 700;
  width: 100%;
  padding: 0;
  margin-bottom: 0;
}

.amount-input input:focus {
  box-shadow: none;
}

.amount-tip {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
}

.sub-items-section {
  background: #F9F9F9;
  padding: 12px;
  border-radius: 12px;
  margin-top: 16px;
}

.sub-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sub-header label {
  margin-bottom: 0;
  font-size: 13px;
  font-weight: 600;
}

.add-sub-btn {
  background: var(--primary-color);
  color: #FFF;
  border: none;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.sub-edit-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.sub-label-input {
  flex: 2;
  padding: 8px !important;
  font-size: 13px !important;
  margin-bottom: 0 !important;
}

.sub-amount-input {
  flex: 1;
  padding: 8px !important;
  font-size: 13px !important;
  margin-bottom: 0 !important;
}

.remove-sub-btn {
  background: transparent;
  border: none;
  color: #DDD;
  cursor: pointer;
}

.remove-sub-btn:hover {
  color: #FF7675;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 8px;
}

.cat-item {
  padding: 8px;
  border: 1px solid #EEE;
  background: #FFF;
  border-radius: 8px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.cat-item.active {
  background: #FDF9F0;
  border-color: var(--primary-color);
  color: var(--primary-color);
  font-weight: 600;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  margin-top: 32px;
}

/* List Transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
