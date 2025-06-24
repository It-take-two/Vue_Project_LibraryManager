<template>
  <div class="report-view">
    <el-card>
        <div class="text">
           <h2>报表列表</h2>         
        </div> 
      <div class="card-header" style="position: relative;">
        <el-button type="primary" @click="handleExport">
          导出报表
        </el-button>
      </div>
      <el-table :data="reportList" style="width: 100%;" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="semester" label="学期" />
        <el-table-column prop="classId" label="班级ID" />
        <el-table-column prop="className" label="班级名称" />
        <el-table-column prop="borrowTimes" label="借阅次数" />
        <el-table-column prop="readerCount" label="读者数量" />
        <el-table-column prop="lastBorrowTime" label="最后借阅时间">
          <template #default="{ row }">
            <span>{{ formatTime(row.lastBorrowTime) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useReportRepository } from '../repositories/report'

function formatTime(time) {
  if (!time) return ''
  const date = new Date(time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const reportList = ref([])

const { getReportList, exportReport } = useReportRepository()

const loadReportList = () => {
  getReportList()
    .then((res) => {
      reportList.value = res.data
    })
    .catch((err) => {
      console.error('加载报表数据失败:', err)
    })
}

const handleExport = () => {
  exportReport()
    .then((res) => {
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const contentDisposition = res.headers['content-disposition']
      let fileName = '报表数据.xlsx'
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
        if (fileNameMatch && fileNameMatch.length > 1) {
          fileName = fileNameMatch[1]
        }
      }
      const link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = fileName
      link.click()
      window.URL.revokeObjectURL(link.href)
    })
    .catch((err) => {
      console.error('导出报表失败:', err)
    })
}

onMounted(() => {
  loadReportList()
})
</script>

<style scoped>
.report-view {
  padding: 20px;
  margin-top: 4px;
}

.text {
  margin-top: 40px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
</style>
