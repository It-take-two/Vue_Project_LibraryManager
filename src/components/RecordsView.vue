<template>
  <el-card class="borrow-manage-page">
    <h2>借阅记录管理</h2>

    <el-form inline @submit.prevent>
      <el-form-item>
        <el-input
          v-model="searchUserNumber"
          placeholder="请输入学号/工号"
          style="width: 240px"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchBorrowsByUserNumber">搜索</el-button>
      </el-form-item>
    </el-form>

    <el-table
      :data="borrows"
      border
      v-loading="loading"
      style="margin-top: 16px"
    >
      <el-table-column label="书名">
        <template #default="{ row }">
          <el-link type="primary" @click="showCollectionDetail(row)">
            {{ row.collectionName }}
          </el-link>
        </template>
      </el-table-column>

      <el-table-column prop="barcode" label="条码" />
      
      <el-table-column label="借阅人">
        <template #default="{ row }">
          <el-link type="primary" @click="showUserDetail(row)">
            {{ row.userName }}
          </el-link>
        </template>
      </el-table-column>

      <el-table-column prop="borrowDateFormatted" label="借书时间" />
      <el-table-column prop="returnDeadlineFormatted" label="应还时间" />
      <el-table-column prop="returnDateFormatted" label="归还时间" />
      <el-table-column prop="finePaid" label="罚款" />
      
      <el-table-column label="操作" width="260">
        <template #default="{ row }">
          <el-button size="small" type="danger" @click="confirmDelete(row.id)">删除</el-button>
          <el-button
            size="small"
            type="warning"
            @click="openFineDialog(row)"
          >罚款</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      layout="prev, pager, next"
      :current-page="page"
      :page-size="12"
      :total="total"
      @current-change="fetchData"
      style="margin-top: 16px; text-align: right"
    />

    <el-dialog v-model="fineDialogVisible" title="罚款登记">
      <el-descriptions :column="1" border style="margin-bottom: 16px">
        <el-descriptions-item label="书名">{{ fineTarget?.collectionName }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ fineTarget?.category }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ fineTarget?.author }}</el-descriptions-item>
        <el-descriptions-item label="出版社">{{ fineTarget?.publisher }}</el-descriptions-item>
        <el-descriptions-item label="ISBN">{{ fineTarget?.isbn }}</el-descriptions-item>
        <el-descriptions-item label="条码">{{ fineTarget?.barcode }}</el-descriptions-item>
        <el-descriptions-item label="价值（¥）">{{ fineTarget?.value }}</el-descriptions-item>
      </el-descriptions>
      <el-form :model="fineForm" label-width="80px" style="margin-top: 12px">
        <el-form-item label="罚款金额">
          <el-input-number
            v-model="fineForm.finePaid"
            :min="0"
            :step="1"
            controls-position="right"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="fineDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitFine">提交</el-button>
      </template>
    </el-dialog>

    <!-- 书籍详情 -->
    <el-dialog v-model="collectionDialogVisible" title="图书详情" width="400px">
      <el-descriptions v-if="collectionDetail" :column="1" border>
        <el-descriptions-item label="书名">{{ collectionDetail.name }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ collectionDetail.author }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ collectionDetail.category }}</el-descriptions-item>
        <el-descriptions-item label="出版社">{{ collectionDetail.publisher }}</el-descriptions-item>
        <el-descriptions-item label="ISBN">{{ collectionDetail.isbn }}</el-descriptions-item>
        <el-descriptions-item label="条码">{{ collectionDetail.barcode }}</el-descriptions-item>
        <el-descriptions-item label="价值（¥）">{{ collectionDetail.value }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <!-- 用户详情 -->
    <el-dialog v-model="userDialogVisible" title="用户详情" width="400px">
      <el-descriptions v-if="userDetail" :column="1" border>
        <el-descriptions-item label="姓名">{{ userDetail.name }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ userDetail.userNumber }}</el-descriptions-item>
        <el-descriptions-item label="角色">
          {{ roleMap[userDetail.roleName] || userDetail.roleName }}
        </el-descriptions-item>
        <el-descriptions-item label="电话">{{ userDetail.phone }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useBorrowRepository } from '../repositories/borrow'
import { useUserRepository } from '../repositories/user'
import { useCollectionRepository } from '../repositories/collection'

const { getAllBorrows, updateBorrow, deleteBorrow, getBorrowsByUser } = useBorrowRepository()
const { getUserById, getUserByUserNumber } = useUserRepository()
const { getCollectionById } = useCollectionRepository()

const borrows = ref([])
const total = ref(0)
const page = ref(1)
const loading = ref(false)
const searchUserNumber = ref('')

const fineDialogVisible = ref(false)
const fineTarget = ref(null)
const fineForm = ref({ finePaid: 0.00 })

const collectionDialogVisible = ref(false)
const collectionDetail = ref(null)

const userDialogVisible = ref(false)
const userDetail = ref(null)

const roleMap = {
  admin: '管理员',
  teacher: '教师',
  undergraduate: '本科生',
  master: '研究生',
  phd: '博士研究生',
  vocational: '专科生'
}

const searchBorrowsByUserNumber = async () => {
  if (!searchUserNumber.value.trim()) {
    fetchData()
    return
  }

  loading.value = true
  try {
    const userRes = await getUserByUserNumber(searchUserNumber.value.trim())
    const user = userRes.data
    if (!user) {
      ElMessage.warning('未找到该用户')
      return
    }

    const borrowsRes = await getBorrowsByUser(user.userId, 1)
    const records = borrowsRes.data.records

    borrows.value = await Promise.all(records.map(enrichBorrowRecord))
    total.value = borrowsRes.data.total
    page.value = 1
  } catch {
    ElMessage.error('搜索失败')
  } finally {
    loading.value = false
  }
}



const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
}

const getUserName = async (userId) => {
  try {
    const res = await getUserById(userId)
    return res.data.name
  } catch {
    return '未知用户'
  }
}

const enrichBorrowRecord = async (record) => {
  const userName = await getUserName(record.userId)
  const collectionRes = await getCollectionById(record.collectionId)
  const collection = collectionRes.data

  return {
    ...record,
    userName,
    collectionName: collection.name,
    barcode: collection.barcode,
    category: collection.category,
    author: collection.author,
    publisher: collection.publisher,
    isbn: collection.isbn,
    value: collection.value,
    borrowDateFormatted: formatDate(record.borrowDate),
    returnDeadlineFormatted: formatDate(record.returnDeadline),
    returnDateFormatted: record.returnDate ? formatDate(record.returnDate) : '—',
    overdue: !record.returnDate && new Date(record.returnDeadline) < new Date()
  }
}

const fetchData = async (p = page.value) => {
  loading.value = true
  try {
    page.value = p
    const res = await getAllBorrows(p)
    borrows.value = await Promise.all(res.data.records.map(enrichBorrowRecord))
    total.value = res.data.total
  } catch {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const confirmDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确认删除该借阅记录？', '警告', { type: 'warning' })
    await deleteBorrow(id)
    ElMessage.success('记录已删除')
    fetchData()
  } catch {}
}

const openFineDialog = (row) => {
  fineTarget.value = row
  fineForm.value.finePaid = fineTarget.value.finePaid
  fineDialogVisible.value = true
}

const submitFine = async () => {
  try {
    await updateBorrow(
      fineTarget.value.userId,
      fineTarget.value.id,
      fineTarget.value.renewedTimes,
      fineForm.value.finePaid,
      fineTarget.value.returnDate,
      false
    )
    ElMessage.success('罚款记录已提交')
    fineDialogVisible.value = false
    fetchData()
  } catch {
    ElMessage.error('罚款提交失败')
  }
}

const showCollectionDetail = async (row) => {
  try {
    const res = await getCollectionById(row.collectionId)
    collectionDetail.value = res.data
    collectionDialogVisible.value = true
  } catch {
    ElMessage.error('获取图书信息失败')
  }
}

const showUserDetail = async (row) => {
  try {
    const user = await getUserById(row.userId)
    console.log(user.data)
    if (user) {
      userDetail.value = user.data
      userDialogVisible.value = true
    } else {
      ElMessage.error('未找到用户信息')
    }
  } catch {
    ElMessage.error('获取用户信息失败')
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
.borrow-manage-page {
  max-width: 1000px;
  margin: auto;
  padding: 24px;
}
</style>