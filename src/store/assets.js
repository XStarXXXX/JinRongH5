import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAssetStore = defineStore('assets', () => {
  // Income records
  const incomeRecords = ref([
    { id: 1, type: '工资', amount: 15000, date: '2026-05-01' },
    { id: 2, type: '副业', amount: 2000, date: '2026-05-03' }
  ])

  // Expense records
  const expenseRecords = ref([
    { id: 1, type: '餐饮消费', amount: 3000, date: '2026-05-01' },
    { id: 2, type: '生活消费', amount: 2000, date: '2026-05-02' },
    { 
      id: 3, 
      type: '自我投资', 
      amount: 1500, 
      date: '2026-05-04',
      subItems: [
        { id: 101, label: 'AI 图书', amount: 500 },
        { id: 102, label: '技能课程', amount: 1000 }
      ]
    },
    { id: 4, type: '还款', amount: 4000, date: '2026-05-01' }
  ])

  // Current Assets (Dynamic categories)
  const assetAllocation = ref([
    { id: 'savings', label: '储蓄', amount: 100000, color: '#C5A059', isLiquid: true },
    { id: 'funds', label: '基金', amount: 50000, color: '#D4AF37', isLiquid: false },
    { id: 'bonds', label: '债券', amount: 30000, color: '#E5D1B0', isLiquid: false },
    { id: 'others', label: '其他', amount: 5000, color: '#A0A0A0', isLiquid: true }
  ])

  // Self Investment (Kept separately as requested)
  const selfInvestmentTotal = ref(15000)
  
  // Budget
  const monthlyBudget = ref(12000)

  // Computeds
  const totalIncome = computed(() => 
    incomeRecords.value.reduce((sum, item) => sum + item.amount, 0)
  )

  const totalExpense = computed(() => 
    expenseRecords.value.reduce((sum, item) => sum + item.amount, 0)
  )

  // Total Assets excluding selfInvestment
  const totalAssets = computed(() => 
    assetAllocation.value.reduce((sum, item) => sum + item.amount, 0)
  )

  const liquidAssets = computed(() => 
    assetAllocation.value
      .filter(item => item.isLiquid)
      .reduce((sum, item) => sum + item.amount, 0)
  )

  const foodExpense = computed(() => 
    expenseRecords.value
      .filter(item => item.type === '餐饮消费')
      .reduce((sum, item) => sum + item.amount, 0)
  )

  // Engel Coefficient
  const engelCoefficient = computed(() => {
    if (totalExpense.value === 0) return 0
    return ((foodExpense.value / totalExpense.value) * 100).toFixed(1)
  })

  // Financial Health Metrics
  const savingsRate = computed(() => {
    if (totalIncome.value === 0) return 0
    return (((totalIncome.value - totalExpense.value) / totalIncome.value) * 100).toFixed(1)
  })

  // Actions
  function addIncome(record) {
    incomeRecords.value.push({ ...record, id: Date.now() })
  }

  function updateIncome(id, updatedRecord) {
    const index = incomeRecords.value.findIndex(r => r.id === id)
    if (index !== -1) {
      incomeRecords.value[index] = { ...incomeRecords.value[index], ...updatedRecord }
    }
  }

  function addExpense(record) {
    const newRecord = { ...record, id: Date.now() }
    expenseRecords.value.push(newRecord)
    if (record.type === '自我投资') {
      selfInvestmentTotal.value += record.amount
    }
  }

  function updateExpense(id, updatedRecord) {
    const index = expenseRecords.value.findIndex(r => r.id === id)
    if (index !== -1) {
      const oldRecord = expenseRecords.value[index]
      
      // Update selfInvestmentTotal if type is '自我投资'
      if (oldRecord.type === '自我投资') {
        selfInvestmentTotal.value -= oldRecord.amount
      }
      
      expenseRecords.value[index] = { ...oldRecord, ...updatedRecord }
      
      if (expenseRecords.value[index].type === '自我投资') {
        selfInvestmentTotal.value += expenseRecords.value[index].amount
      }
    }
  }

  function updateAsset(id, amount, label) {
    const asset = assetAllocation.value.find(a => a.id === id)
    if (asset) {
      if (amount !== undefined) asset.amount = amount
      if (label !== undefined) asset.label = label
    }
  }

  function addAssetCategory(category) {
    assetAllocation.value.push({
      ...category,
      id: 'custom_' + Date.now(),
      amount: category.amount || 0
    })
  }

  function deleteAssetCategory(id) {
    assetAllocation.value = assetAllocation.value.filter(a => a.id !== id)
  }

  return {
    incomeRecords,
    expenseRecords,
    assetAllocation,
    selfInvestmentTotal,
    monthlyBudget,
    totalIncome,
    totalExpense,
    totalAssets,
    liquidAssets,
    engelCoefficient,
    savingsRate,
    addIncome,
    updateIncome,
    addExpense,
    updateExpense,
    updateAsset,
    addAssetCategory,
    deleteAssetCategory
  }
})
