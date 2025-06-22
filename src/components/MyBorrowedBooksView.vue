<template>
  <div class="borrowed-page">

    <h2>我的借阅记录</h2>

    <el-tabs v-model="activeTab">
      <!-- 全部记录 -->
      <el-tab-pane label="全部记录" name="all">
        <el-table :data="borrowedList" v-loading="loading" border @row-click="showDetail">
          <el-table-column prop="name" label="书名" />
          <el-table-column prop="borrowDate" label="借出时间" :formatter="formatDate" />
          <el-table-column prop="returnDeadline" label="应还时间" :formatter="formatDate" />
          <el-table-column prop="returnDate" label="归还时间" :formatter="formatReturn" />
          <el-table-column label="状态" :formatter="(_, row) => formatStatus(row)" />
        </el-table>
        <div class="pagination">
          <el-pagination
            v-model:current-page="borrowPagination.page"
            :page-size="10"
            :total="borrowPagination.total"
            layout="prev, pager, next"
            background
            @current-change="loadBorrowed"
          />
        </div>
      </el-tab-pane>

      <!-- 未归还 -->
      <el-tab-pane label="未归还" name="incomplete">
        <el-table :data="incompleteList" v-loading="loading" border @row-click="showDetail">
          <el-table-column prop="name" label="书名" />
          <el-table-column prop="borrowDate" label="借出时间" :formatter="formatDate" />
          <el-table-column prop="returnDeadline" label="应还时间" :formatter="formatDate" />
          <el-table-column prop="renewedTimes" label="续借次数" />
          <el-table-column label="状态" :formatter="(_, row) => formatStatus(row)" />
        </el-table>
        <div class="pagination">
          <el-pagination
            v-model:current-page="incompletePagination.page"
            :page-size="10"
            :total="incompletePagination.total"
            layout="prev, pager, next"
            background
            @current-change="loadIncomplete"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 借阅详情弹窗 -->
    <el-dialog v-model="detailVisible" title="借阅详情" width="500px">
      <el-descriptions :column="1" border v-if="detail">
        <el-descriptions-item label="书名">{{ detail.name }}</el-descriptions-item>
        <el-descriptions-item label="借出时间">{{ formatDate(null, null, detail.borrowDate) }}</el-descriptions-item>
        <el-descriptions-item label="应还时间">{{ formatDate(null, null, detail.returnDeadline) }}</el-descriptions-item>
        <el-descriptions-item label="归还时间">{{ formatReturn(null, null, detail.returnDate) }}</el-descriptions-item>
        <el-descriptions-item label="续借次数">{{ detail.renewedTimes }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ formatStatus(detail) }}</el-descriptions-item>
        <el-descriptions-item label="是否已赔偿">
          <el-tag :type="isCompensated(detail) ? 'danger' : 'success'">
            {{ isCompensated(detail) ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="赔偿金额">
          {{ detail.finePaid && Number(detail.finePaid || 0) > 0 ? detail.finePaid + ' 元' : '—' }}
        </el-descriptions-item>
        <el-descriptions-item label="条码号">
          {{ detail.barcode || '—' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import UserLayout from './UserLayout.vue'
import { useBorrowRepository } from '../repositories/borrow'
import { useCatalogRepository } from '../repositories/catalog'

const { getMyBorrows, getMyIncompleteBorrows } = useBorrowRepository()
const { getCatalog } = useCatalogRepository()

const activeTab = ref('all')
const loading = ref(false)

const borrowedList = ref([])
const incompleteList = ref([])
const borrowPagination = ref({ page: 1, total: 0 })
const incompletePagination = ref({ page: 1, total: 0 })

const detailVisible = ref(false)
const detail = ref({})

const formatDate = (_, __, val) => val?.slice(0, 10) || '—'
const formatReturn = (_, __, val) => (val ? val.slice(0, 10) : '未归还')

const isCompensated = (row) => Number(row.finePaid || 0) > 0

const formatStatus = (row) => {
  if (row.returnDate) {
    return isCompensated(row) ? '已赔偿' : '已归还'
  }
  const now = new Date()
  const deadline = new Date(row.returnDeadline)
  return now > deadline ? '逾期未还' : '借阅中'
}

const enrichWithCatalog = async (records) => {
  const enriched = []
  for (const record of records) {
    const { data } = await getCatalog(record.catalogId)
    enriched.push({ ...record, name: data.name })
  }
  return enriched
}

const loadBorrowed = async () => {
  loading.value = true
  const res = await getMyBorrows(borrowPagination.value.page)
  borrowPagination.value.total = res.data.total
  borrowedList.value = await enrichWithCatalog(res.data.records)
  loading.value = false
}

const loadIncomplete = async () => {
  loading.value = true
  const res = await getMyIncompleteBorrows(incompletePagination.value.page)
  incompletePagination.value.total = res.data.total
  incompleteList.value = await enrichWithCatalog(res.data.records)
  loading.value = false
}

const showDetail = (row) => {
  detail.value = row
  detailVisible.value = true
}

onMounted(() => {
  loadBorrowed()
  loadIncomplete()
})

watch(() => borrowPagination.value.page, () => {
  if (activeTab.value === 'all') loadBorrowed()
})
watch(() => incompletePagination.value.page, () => {
  if (activeTab.value === 'incomplete') loadIncomplete()
})
</script>

<style scoped>
.borrowed-page {
  padding: 2rem;
}
.pagination {
  margin-top: 1rem;
  text-align: right;
}
</style>