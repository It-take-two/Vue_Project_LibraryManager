<template>
  <div class="borrow-view">
    <section class="toolbar">
      <el-button type="primary" @click="categoryDialogVisible = true">
        {{ selectedClcLabel || '选择分类' }}
      </el-button>
      <el-button type="info" @click="dialogVisible = true">借书规则</el-button>
    </section>

    <el-row :gutter="20" class="book-grid" v-loading="loading">
      <el-col
        v-for="book in books"
        :key="book.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        :xl="6"
      >
        <el-card class="book-card" shadow="hover" @click="showDetail(book)">
          <div class="card-header">
            <h3>{{ book.name }}</h3>
            <el-tag :type="book.isBorrowable ? 'success' : 'info'">
              {{ book.isBorrowable ? '可借' : '不可借' }}
            </el-tag>
          </div>
          <p>作者：{{ book.author }}</p>
          <p>出版社：{{ book.publisher }}</p>
          <p>出版时间：{{ format(book.publishDate) }}</p>
        </el-card>
      </el-col>
    </el-row>

    <el-pagination
      class="pagination"
      v-model:current-page="currentPage"
      :page-size="12"
      :total="total"
      layout="prev, pager, next"
      background
      @current-change="loadBooks"
    />

    <el-dialog v-model="categoryDialogVisible" width="500px">
      <template #title>
        <div class="dialog-header">
          <span>选择分类</span>
          <el-button type="text" size="small" @click="clearClc">清除分类</el-button>
        </div>
      </template>
      <el-collapse v-model="expandedCategories">
        <el-collapse-item
          v-for="clc in clcOptions"
          :key="clc.value"
          :name="clc.value"
        >
          <template #title>{{ clc.label }}</template>
          <div class="child-list">
            <el-button
              v-for="child in clc.children || []"
              :key="child.value"
              link
              type="primary"
              @click="selectClc(child)"
            >
              {{ child.label }}
            </el-button>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-dialog>

    <el-dialog v-model="dialogVisible" title="借书规则" width="600px">
      <el-table
        :data="rules"
        border
        v-loading="rulesLoading"
        style="width: 100%;"
        :cell-style="cellStyle"
        :header-cell-style="headerCellStyle"
      >
        <el-table-column
          prop="roleName"
          label="身份"
          min-width="120"
          align="center"
          header-align="center"
          :formatter="formatRoleName"
        />
        <el-table-column
          prop="maxBooks"
          label="最大借书数"
          min-width="120"
          align="center"
          header-align="center"
        />
        <el-table-column
          prop="loanDays"
          label="借阅天数"
          min-width="120"
          align="center"
          header-align="center"
        />
        <el-table-column
          prop="renewTimes"
          label="续借次数"
          min-width="120"
          align="center"
          header-align="center"
        />
      </el-table>
    </el-dialog>

    <el-dialog
      v-model="detailVisible"
      :title="detail.name || '图书详情'"
      width="500px"
    >
      <el-descriptions :column="1" border v-if="detail.id">
        <el-descriptions-item label="作者">
          {{ detail.author }}
        </el-descriptions-item>
        <el-descriptions-item label="出版社">
          {{ detail.publisher }}
        </el-descriptions-item>
        <el-descriptions-item label="ISBN">
          {{ detail.isbn }}
        </el-descriptions-item>
        <el-descriptions-item label="分类">
          {{ detail.category }}
        </el-descriptions-item>
        <el-descriptions-item label="出版时间">
          {{ format(detail.publishDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="存入时间">
          {{ format(detail.storageDate) }}
        </el-descriptions-item>
        <el-descriptions-item label="条码">
          {{ detail.barcode }}
        </el-descriptions-item>
        <el-descriptions-item label="价值">
          {{ detail.value }} 元
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detail.isBorrowable ? 'success' : 'info'">
            {{ detail.isBorrowable ? '可借' : '不可借' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useCollectionRepository } from '../repositories/collection'
import { useBorrowRuleRepository } from '../repositories/borrowRule'
import { useClcRepository } from '../repositories/clc'

const { searchCollections, getCollectionByBarcode } = useCollectionRepository()
const { getBorrowRules } = useBorrowRuleRepository()
const { getClcTree } = useClcRepository()

const books = ref([])
const total = ref(0)
const currentPage = ref(1)
const loading = ref(false)

const clcOptions = ref([])
const selectedClc = ref(null)
const selectedClcLabel = ref('')
const categoryDialogVisible = ref(false)
const expandedCategories = ref([])

const dialogVisible = ref(false)
const rules = ref([])
const rulesLoading = ref(false)

const detailVisible = ref(false)
const detail = ref({})

const loadBooks = async () => {
  loading.value = true
  const res = await searchCollections(currentPage.value, '', selectedClc.value)
  books.value = res.data.records
  total.value = res.data.total
  loading.value = false
}

const loadClcOptions = async () => {
  const res = await getClcTree()
  clcOptions.value = Array.isArray(res.data) ? res.data : []
}

const selectClc = (clc) => {
  selectedClc.value = clc.value
  selectedClcLabel.value = clc.label
  categoryDialogVisible.value = false
  currentPage.value = 1
  loadBooks()
}

const clearClc = () => {
  selectedClc.value = null
  selectedClcLabel.value = ''
  categoryDialogVisible.value = false
  currentPage.value = 1
  loadBooks()
}

const showDetail = async (item) => {
  const res = await getCollectionByBarcode(item.barcode)
  detail.value = res.data
  detailVisible.value = true
}

watch(dialogVisible, async (open) => {
  if (open && rules.value.length === 0) {
    rulesLoading.value = true
    const res = await getBorrowRules()
    rules.value = res.data
    rulesLoading.value = false
  }
})

const format = (date) => date?.slice(0, 10) || '—'

const formatRoleName = (row, column, cellValue) => {
  const roleMap = {
    teacher: '教师',
    vocational: '高职',
    undergraduate: '本科',
    master: '硕士研究生',
    phd: '博士研究生'
  }
  return roleMap[row.roleName] || row.roleName || cellValue
}

const cellStyle = () => ({ textAlign: 'center' })
const headerCellStyle = () => ({ textAlign: 'center' })

onMounted(() => {
  loadClcOptions()
  loadBooks()
})
</script>

<style scoped>
.borrow-view {
  height: 100%;
  width: 100%;
  padding: 1.5rem;
  box-sizing: border-box;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
}

.book-grid {
  margin-bottom: 1rem;
}

.book-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}
.book-card:hover {
  transform: scale(1.02);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination {
  text-align: right;
  margin-top: 1rem;
}

.child-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.5rem;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
