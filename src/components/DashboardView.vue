<template>
  <el-card class="borrow-return-page">
    <h2>借还书管理</h2>

    <el-radio-group v-model="mode" size="large" style="margin-bottom: 24px">
      <el-radio-button label="borrow">借书</el-radio-button>
      <el-radio-button label="return">还书</el-radio-button>
    </el-radio-group>

    <div v-if="mode === 'borrow'">
      <el-form inline @submit.prevent>
        <el-form-item label="学号/工号">
          <el-input v-model="userNumber" placeholder="请输入学号/工号" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchUser">查询用户</el-button>
        </el-form-item>
      </el-form>

      <el-descriptions v-if="user" title="用户信息" :column="2" border class="user-section">
        <el-descriptions-item label="姓名">{{ user.name }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ user.roleName }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ user.phone }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ user.userNumber }}</el-descriptions-item>
      </el-descriptions>

      <el-divider />
    </div>

    <el-form inline @submit.prevent>
      <el-form-item label="书籍条码">
        <el-input v-model="barcode" placeholder="请输入条码" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">
          查询{{ mode === 'borrow' ? '图书' : '借阅记录' }}
        </el-button>
      </el-form-item>
    </el-form>

    <el-card v-if="mode === 'borrow' && collection" class="collection-card">
      <el-descriptions title="书籍详情" :column="1" border>
        <el-descriptions-item label="书名">{{ collection.name }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ collection.author }}</el-descriptions-item>
        <el-descriptions-item label="出版社">{{ collection.publisher }}</el-descriptions-item>
        <el-descriptions-item label="ISBN">{{ collection.isbn }}</el-descriptions-item>
        <el-descriptions-item label="条码">{{ collection.barcode }}</el-descriptions-item>
        <el-descriptions-item label="可借状态">
          <el-tag :type="collection.isBorrowable ? 'success' : 'danger'">
            {{ collection.isBorrowable ? '可借' : '已借出' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <div style="margin-top: 16px;">
        <el-button
          v-if="collection.isBorrowable"
          type="success"
          :disabled="!user"
          @click="handleBorrow"
        >借书</el-button>

        <el-button
          v-else
          type="info"
          :disabled="!user || !borrow"
          @click="handleRenew"
        >续借</el-button>
      </div>

      <el-card v-if="borrow" style="margin-top: 16px">
        <el-descriptions title="当前借阅记录" :column="2" border>
          <el-descriptions-item label="借阅人">
            <el-link @click="handleShowBorrowUser" type="primary">
              {{ borrowUser?.name || '—' }}
            </el-link>
          </el-descriptions-item>
          <el-descriptions-item label="借书时间">{{ format(borrow.borrowDate) }}</el-descriptions-item>
          <el-descriptions-item label="应还时间">{{ format(borrow.returnDeadline) }}</el-descriptions-item>
          <el-descriptions-item label="续借次数">{{ borrow.renewedTimes }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </el-card>

    <el-card v-if="mode === 'return' && borrow" class="borrow-card">
      <el-descriptions title="图书详情" :column="1" border>
        <el-descriptions-item label="书名">{{ collection.name }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ collection.author }}</el-descriptions-item>
        <el-descriptions-item label="出版社">{{ collection.publisher }}</el-descriptions-item>
        <el-descriptions-item label="ISBN">{{ collection.isbn }}</el-descriptions-item>
        <el-descriptions-item label="条码">{{ collection.barcode }}</el-descriptions-item>
      </el-descriptions>

      <el-divider />

      <el-descriptions title="借阅记录详情" :column="2" border>
        <el-descriptions-item label="借阅人">
          <el-link @click="handleShowBorrowUser" type="primary">
            {{ borrowUser?.name || '—' }}
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="借书时间">{{ format(borrow.borrowDate) }}</el-descriptions-item>
        <el-descriptions-item label="应还时间">{{ format(borrow.returnDeadline) }}</el-descriptions-item>
        <el-descriptions-item label="续借次数">{{ borrow.renewedTimes }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="borrow.returnDate ? 'success' : 'warning'">
            {{ borrow.returnDate ? '已归还' : '未归还' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="是否逾期">
          <el-tag :type="calculateFine() > 0 ? 'danger' : 'success'">
            {{ calculateFine() > 0 ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="逾期天数">{{ calculateFine() }} 天</el-descriptions-item>
        <el-descriptions-item label="应缴罚款">¥ {{ calculateFine() }}</el-descriptions-item>
        <el-descriptions-item label="罚款状态">
          <el-tag :type="borrow.fineSettled ? 'success' : 'warning'">
            {{ borrow.fineSettled ? '已登记' : '未缴纳' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <div style="margin-top: 16px;">
        <el-button
          type="warning"
          @click="handleReturn"
          :disabled="borrow.returnDate"
        >确认还书</el-button>

        <el-button
          v-if="!borrow.fineSettled && calculateFine() > 0"
          type="danger"
          @click="handleFineRegister"
        >登记罚款</el-button>
      </div>
    </el-card>
  </el-card>
  <el-dialog v-model="borrowUserDialogVisible" title="借阅人详情" width="400px">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="姓名">{{ borrowUserDetail?.name }}</el-descriptions-item>
      <el-descriptions-item label="学号">{{ borrowUserDetail?.userNumber }}</el-descriptions-item>
      <el-descriptions-item label="身份">
        {{ roleMap[borrowUserDetail?.roleName] || borrowUserDetail?.roleName }}
      </el-descriptions-item>
      <el-descriptions-item label="电话">{{ borrowUserDetail?.phone }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserRepository } from '../repositories/user'
import { useCollectionRepository } from '../repositories/collection'
import { useBorrowRepository } from '../repositories/borrow'

const mode = ref('borrow')
const userNumber = ref('')
const barcode = ref('')
const user = ref(null)
const collection = ref(null)
const borrow = ref(null)
const borrowUser = ref(null)
const borrowUserDialogVisible = ref(false)
const borrowUserDetail = ref(null)

const roleMap = {
  teacher: '教师',
  vocational: '高职',
  undergraduate: '本科',
  master: '硕士研究生',
  phd: '博士研究生',
}

const { getUserByUserNumber, getUserById } = useUserRepository()
const { getCollectionByBarcode } = useCollectionRepository()
const { addBorrow, getBorrowByBarcode, updateBorrow } = useBorrowRepository()

const fetchUser = async () => {
  try {
    const res = await getUserByUserNumber(userNumber.value)
    user.value = res.data
    if (user.value && user.value.roleName) {
      user.value.roleName = roleMap[user.value.roleName] || user.value.roleName
    }
    ElMessage.success('用户加载成功')
  } catch {
    user.value = null
    ElMessage.error('未找到该用户')
  }
}

const handleSearch = async () => {
  borrow.value = null
  collection.value = null
  try {
    const res = await getCollectionByBarcode(barcode.value)
    collection.value = res.data

    if (mode.value === 'borrow' && !collection.value.isBorrowable) {
      const b = await getBorrowByBarcode(barcode.value)
      borrow.value = b.data
      const u = await getUserById(borrow.value.userId)
      borrowUser.value = u.data
      if (borrowUser.value && borrowUser.value.roleName) {
        borrowUser.value.roleName = roleMap[borrowUser.value.roleName] || borrowUser.value.roleName
      }
    }

    if (mode.value === 'return') {
      const b = await getBorrowByBarcode(barcode.value)
      borrow.value = b.data
      const u = await getUserById(borrow.value.userId)
      borrowUser.value = u.data
      if (borrowUser.value && borrowUser.value.roleName) {
        borrowUser.value.roleName = roleMap[borrowUser.value.roleName] || borrowUser.value.roleName
      }
    }

    ElMessage.success('信息加载成功')
  } catch {
    ElMessage.error('查询失败')
  }
}

const handleBorrow = async () => {
  try {
    const result = await addBorrow(user.value.userId, collection.value.id)
    collection.value.isBorrowable = false
    const res = await getBorrowByBarcode(collection.value.barcode)
    borrow.value = res.data
    if (result) { ElMessage.success('借书成功') }
    else { ElMessage.error('借书失败') }
  } catch {
    ElMessage.error('借书失败')
  }
}

const handleRenew = async () => {
  const b = await getBorrowByBarcode(barcode.value)
  borrow.value = b.data
  try {
    const result = await updateBorrow(
      borrow.value.userId,
      borrow.value.id,
      borrow.value.renewedTimes + 1,
      borrow.value.finePaid,
      null,
      false
    )
    borrow.value.renewedTimes += 1
    if (result) { ElMessage.success('续借成功') }
    else { ElMessage.error('续借失败') }
  } catch {
    ElMessage.error('续借失败')
  }
}

const handleReturn = async () => {
  try {
    const fine = calculateFine()
    const result = await updateBorrow(
      borrow.value.userId,
      borrow.value.id,
      borrow.value.renewedTimes,
      fine,
      new Date().toISOString(),
      borrow.value.fineSettled
    )
    borrow.value.returnDate = new Date().toISOString()
    borrow.value.finePaid = fine
    collection.value.isBorrowable = true
    if (result) { ElMessage.success('还书成功') }
    else { ElMessage.error('还书失败') }
  } catch {
    ElMessage.error('还书失败')
  }
}

const handleFineRegister = async () => {
  try {
    await updateBorrow(
      borrow.value.userId,
      borrow.value.id,
      borrow.value.renewedTimes,
      calculateFine(),
      borrow.value.returnDate,
      true
    )
    borrow.value.fineSettled = true
    ElMessage.success('罚款登记成功')
  } catch {
    ElMessage.error('罚款登记失败')
  }
}

const calculateFine = () => {
  if (!borrow.value || borrow.value.returnDate) return 0
  const deadline = new Date(borrow.value.returnDeadline)
  const now = new Date()
  const msPerDay = 1000 * 60 * 60 * 24
  const days = Math.floor((now - deadline) / msPerDay)
  return days > 0 ? days : 0
}

const handleShowBorrowUser = async () => {
  if (!borrow.value?.userId) return
  try {
    const res = await getUserById(borrow.value.userId)
    borrowUserDetail.value = res.data
    if (borrowUserDetail.value && borrowUserDetail.value.roleName) {
      borrowUserDetail.value.roleName = roleMap[borrowUserDetail.value.roleName] || borrowUserDetail.value.roleName
    }
    borrowUserDialogVisible.value = true
  } catch {
    ElMessage.error('加载借阅人信息失败')
  }
}

const format = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
}

watch(mode, () => {
  barcode.value = ''
  collection.value = null
  borrow.value = null
})
</script>


<style scoped>
.borrow-return-page {
  max-width: 780px;
  margin: auto;
  padding: 24px;
  margin-top: 24px;
  margin-bottom: 24px;
}
.collection-card,
.borrow-card {
  margin-top: 24px;
}
.user-section {
  margin-top: 20px;
}
</style>