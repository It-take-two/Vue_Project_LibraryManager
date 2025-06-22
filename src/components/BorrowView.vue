<template>
  <div class="borrow-page">

    <!-- 操作区域 -->
    <div class="controls">
      <el-button type="primary" @click="categoryDialogVisible = true">
        {{ selectedClcLabel || '选择分类' }}
      </el-button>

      <el-button type="info" @click="dialogVisible = true">借书规则</el-button>
    </div>

    <!-- 图书列表 -->
    <el-row :gutter="20" class="book-list" v-loading="loading">
      <el-col v-for="book in books" :key="book.id" :span="8">
        <el-card @click="showDetail(book)" class="book-card" shadow="hover">
          <div class="card-header">
            <h3>{{ book.name }}</h3>
            <el-tag :type="book.isBorrowable ? 'success' : 'info'">
              {{ book.isBorrowable ? '可借' : '不可借' }}
            </el-tag>
          </div>
          <p>作者：{{ book.author }}</p>
          <p>出版社：{{ book.publisher }}</p>
          <p>出版日期：{{ format(book.publishDate) }}</p>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="currentPage"
      :page-size="10"
      :total="total"
      layout="prev, pager, next"
      background
      class="pagination"
      @current-change="loadBooks"
    />

    <!-- 分类选择弹窗 -->
    <el-dialog v-model="categoryDialogVisible" title="选择分类">
      <el-collapse v-model="expandedCategories">
        <el-collapse-item
          v-for="clc in clcOptions"
          :key="clc.value"
          :name="clc.value"
        >
          <template #title>
            {{ clc.label }}
          </template>
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

    <!-- 借书规则弹窗 -->
    <el-dialog v-model="dialogVisible" title="借书规则">
      <el-table :data="rules" v-loading="rulesLoading" border>
        <el-table-column prop="id" label="规则ID" width="80" />
        <el-table-column prop="maxBooks" label="最大借阅数" />
        <el-table-column prop="durationDays" label="借阅天数" />
        <el-table-column prop="renewable" label="可续借" :formatter="v => v ? '是' : '否'" />
      </el-table>
    </el-dialog>

    <!-- 图书详情弹窗 -->
    <el-dialog v-model="detailVisible" :title="detail.name || '图书详情'" width="500px">
      <el-descriptions :column="1" border v-if="detail.id">
        <el-descriptions-item label="作者">{{ detail.author }}</el-descriptions-item>
        <el-descriptions-item label="出版社">{{ detail.publisher }}</el-descriptions-item>
        <el-descriptions-item label="ISBN">{{ detail.isbn }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ detail.category }}</el-descriptions-item>
        <el-descriptions-item label="出版时间">{{ format(detail.publishDate) }}</el-descriptions-item>
        <el-descriptions-item label="存入时间">{{ format(detail.storageDate) }}</el-descriptions-item>
        <el-descriptions-item label="条码">{{ detail.barcode }}</el-descriptions-item>
        <el-descriptions-item label="价值">{{ detail.value }} 元</el-descriptions-item>
        <el-descriptions-item label="借阅状态">
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
import UserLayout from './UserLayout.vue'
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

const loadClcOptions = async () => {
  const res = await getClcTree()
  clcOptions.value = res.data
  expandedCategories.value = clcOptions.value.map(clc => clc.value)
}

const selectClc = (clc) => {
  selectedClc.value = clc.value
  selectedClcLabel.value = clc.label
  categoryDialogVisible.value = false
  currentPage.value = 1
  loadBooks()
}

const loadBooks = async () => {
  loading.value = true
  currentPage.value = 1
  const res = await searchCollections(currentPage.value, '', selectedClc.value)
  books.value = res.data.records
  total.value = res.data.total
  loading.value = false
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

const format = (d) => d?.slice(0, 10) || '—'

onMounted(() => {
  loadClcOptions()
  loadBooks()
})
</script>

<style scoped>
.borrow-page {
  padding: 2rem;
}
.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.book-list {
  margin-top: 1rem;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.book-card {
  cursor: pointer;
  transition: 0.2s;
}
.book-card:hover {
  transform: scale(1.02);
}
.pagination {
  margin-top: 1.5rem;
  text-align: right;
}
.child-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.5rem;
}
</style>