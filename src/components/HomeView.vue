<template>

  <div class="home-page">
    <div class="header">
      <h1>欢迎来到图书馆 📚</h1>
      <p class="subtitle">发现一本好书，就是遇见另一个世界。</p>
    </div>

    <el-divider content-position="left">📘 推荐可借图书</el-divider>

    <el-row :gutter="20" v-loading="loading" class="book-list">
      <el-col v-for="book in books" :key="book.id" :span="8">
        <el-card class="book-card" shadow="always" @click="showDetail(book)">
          <div class="card-header">
            <h3>{{ book.name }}</h3>
            <el-tag type="success">可借</el-tag>
          </div>
          <p class="info">作者：{{ book.author }}</p>
          <p class="info">出版社：{{ book.publisher }}</p>
          <p class="info">出版：{{ format(book.publishDate) }}</p>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图书详情弹窗 -->
    <el-dialog v-model="dialogVisible" :title="detail.name || '图书详情'" width="500px">
      <el-descriptions :column="1" border v-if="detail.id">
        <el-descriptions-item label="作者">{{ detail.author }}</el-descriptions-item>
        <el-descriptions-item label="出版社">{{ detail.publisher }}</el-descriptions-item>
        <el-descriptions-item label="ISBN">{{ detail.isbn }}</el-descriptions-item>
        <el-descriptions-item label="分类">{{ detail.category }}</el-descriptions-item>
        <el-descriptions-item label="出版时间">{{ format(detail.publishDate) }}</el-descriptions-item>
        <el-descriptions-item label="条码">{{ detail.barcode }}</el-descriptions-item>
        <el-descriptions-item label="价值">{{ detail.value }} 元</el-descriptions-item>
        <el-descriptions-item label="借阅状态">
          <el-tag type="success">可借</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCollectionRepository } from '../repositories/collection'

const { getRandomBorrowableCollections, getCollectionByBarcode } = useCollectionRepository()

const books = ref([])
const detail = ref({})
const loading = ref(false)
const dialogVisible = ref(false)

const loadBooks = async () => {
  loading.value = true
  const res = await getRandomBorrowableCollections()
  books.value = res.data
  loading.value = false
}

const showDetail = async (item) => {
  const res = await getCollectionByBarcode(item.barcode)
  detail.value = res.data
  dialogVisible.value = true
}

const format = (val) => val?.slice(0, 10) || '—'

onMounted(loadBooks)
</script>

<style scoped>
.home-page {
  padding: 2rem;
  background-color: #f9f9f9;
  min-height: 100vh;
}
.header {
  margin-bottom: 2rem;
  text-align: center;
}
.subtitle {
  color: #666;
  font-size: 1.1rem;
  margin-top: 0.5rem;
}
.book-list {
  margin-top: 1rem;
}
.book-card {
  cursor: pointer;
  transition: transform 0.2s ease;
}
.book-card:hover {
  transform: scale(1.02);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}
.info {
  font-size: 14px;
  color: #444;
}
</style>