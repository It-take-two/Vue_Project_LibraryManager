<template>
  <el-card class="borrow-return-page">
    <h2>借还书管理</h2>

    <!-- 操作模式切换 -->
    <el-radio-group v-model="mode" size="large" style="margin-bottom: 24px">
      <el-radio-button label="borrow">借书</el-radio-button>
      <el-radio-button label="return">还书</el-radio-button>
    </el-radio-group>

    <!-- 借书用户信息 -->
    <div v-if="mode === 'borrow'">
      <el-form inline @submit.prevent>
        <el-form-item label="用户学号">
          <el-input v-model="userNumber" placeholder="请输入学号" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchUser">查询用户</el-button>
        </el-form-item>
      </el-form>

      <el-descriptions
        v-if="user"
        title="用户信息"
        :column="2"
        border
        class="user-section"
      >
        <el-descriptions-item label="姓名">{{ user.name }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ user.roleName }}</el-descriptions-item>
        <el-descriptions-item label="电话">{{ user.phone }}</el-descriptions-item>
        <el-descriptions-item label="学号">{{ user.userNumber }}</el-descriptions-item>
      </el-descriptions>

      <el-divider />
    </div>

    <!-- 条码查询 -->
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

    <!-- 借书 / 续借详情 -->
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
          <el-descriptions-item label="借书时间">{{ format(borrow.borrowDate) }}</el-descriptions-item>
          <el-descriptions-item label="应还时间">{{ format(borrow.returnDeadline) }}</el-descriptions-item>
          <el-descriptions-item label="续借次数">{{ borrow.renewedTimes }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </el-card>

    <!-- 还书模块 -->
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
        <el-descriptions-item label="借书时间">{{ format(borrow.borrowDate) }}</el-descriptions-item>
        <el-descriptions-item label="应还时间">{{ format(borrow.returnDeadline) }}</el-descriptions-item>
        <el-descriptions-item label="续借次数">{{ borrow.renewedTimes }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="borrow.returnDate ? 'success' : 'warning'">
            {{ borrow.returnDate ? '已归还' : '未归还' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <div style="margin-top: 16px;">
        <el-button
          type="warning"
          @click="handleReturn"
          :disabled="borrow.returnDate"
        >确认还书</el-button>
      </div>
    </el-card>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
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

const { getUserByUserNumber } = useUserRepository()
const { getCollectionByBarcode } = useCollectionRepository()
const { addBorrow, getBorrowByBarcode, updateBorrow } = useBorrowRepository()

const fetchUser = async () => {
  try {
    const res = await getUserByUserNumber(userNumber.value)
    user.value = res.data
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
    }

    if (mode.value === 'return') {
      const b = await getBorrowByBarcode(barcode.value)
      borrow.value = b.data
    }

    ElMessage.success('信息加载成功')
  } catch {
    ElMessage.error('查询失败')
  }
}

const handleBorrow = async () => {
  try {
    await addBorrow(user.value.userId, collection.value.id)
    collection.value.isBorrowable = false
    const res = await getBorrowByBarcode(collection.value.barcode)
    borrow.value = res.data
    ElMessage.success('借书成功')
  } catch {
    ElMessage.error('借书失败')
  }
}

const handleRenew = async () => {
  try {
    await updateBorrow(
      user.value.userId,
      borrow.value.id,
      borrow.value.renewedTimes + 1,
      borrow.value.finePaid,
      null,
      false
    )
    borrow.value.renewedTimes += 1
    ElMessage.success('续借成功')
  } catch {
    ElMessage.error('续借失败')
  }
}

const handleReturn = async () => {
  try {
    await updateBorrow(
      0,
      borrow.value.id,
      borrow.value.renewedTimes,
      0,
      new Date().toISOString(),
      true
    )
    borrow.value.returnDate = new Date().toISOString()
    collection.value.isBorrowable = true
    ElMessage.success('还书成功')
  } catch {
    ElMessage.error('还书失败')
  }
}

const format = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
}
</script>

<style scoped>
.borrow-return-page {
  max-width: 780px;
  margin: auto;
  padding: 24px;
}
.collection-card,
.borrow-card {
  margin-top: 24px;
}
.user-section {
  margin-top: 20px;
}
</style>