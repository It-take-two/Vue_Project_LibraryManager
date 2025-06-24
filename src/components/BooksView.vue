<template>
  <el-tabs v-model="activeTab">
    <!-- 书目管理 Tab （书目部分保持不变） -->
    <el-tab-pane label="书目管理" name="catalog">
      <div class="toolbar">
        <!-- 搜索区域 -->
        <el-input
          v-model="catalogSearch.keyword"
          placeholder="请输入ISBN搜索书目"
          style="width: 200px; margin-right: 10px;"
        />
        <el-button type="primary" @click="searchCatalog">搜索</el-button>
        <el-button
          type="default"
          v-if="isSearchActive"
          @click="resetSearch"
          style="margin-left: 10px;"
        >
          返回
        </el-button>
        <el-button
          type="primary"
          @click="openCatalogDialog"
          style="margin-left: 10px;"
        >
          新增书目
        </el-button>
      </div>
      <el-table :data="catalogList" border style="width: 100%">
        <el-table-column prop="name" label="书名" />
        <el-table-column prop="isbn" label="ISBN" />
        <el-table-column prop="publisher" label="出版社" />
        <!-- 自定义类别列，显示为 编号-名字 -->
        <el-table-column label="类别">
          <template #default="{ row }">
            {{ row.category }}-{{ row.categoryName ? row.categoryName : getCategoryName(row.category) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="publishDate"
          label="出版日期"
          :formatter="formatDate"
        />
        <el-table-column prop="author" label="作者" />
        <el-table-column prop="value" label="价值" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button type="text" size="small" @click="editCatalog(row)">编辑</el-button>
            <el-button type="text" size="small" @click="confirmDeleteCatalog(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        layout="prev, pager, next"
        :total="catalogTotal"
        :page-size="pageSize"
        :current-page="catalogPage"
        @current-change="handleCatalogPageChange"
        style="margin-top: 15px; text-align: right;"
      />
      <!-- 新增/编辑书目弹窗 -->
      <el-dialog v-model="catalogDialogVisible" :title="dialogTitle">
        <el-form
          :model="catalogForm"
          :rules="catalogRules"
          ref="catalogFormRef"
          label-width="100px"
        >
          <el-form-item label="书名" prop="name">
            <el-input v-model="catalogForm.name" />
          </el-form-item>
          <el-form-item label="ISBN" prop="isbn">
            <el-input v-model="catalogForm.isbn" />
          </el-form-item>
          <el-form-item label="出版社" prop="publisher">
            <el-input v-model="catalogForm.publisher" />
          </el-form-item>
          <!-- 类别：展示类别名称，仅供选择，不可直接编辑 -->
          <el-form-item label="类别" prop="category">
            <el-input
              v-model="catalogForm.categoryName"
              readonly
              placeholder="请选择分类"
              suffix-icon="el-icon-arrow-down"
              @click="openCategoryDialog"
            />
          </el-form-item>
          <el-form-item label="出版日期" prop="publishDate">
            <el-date-picker
              v-model="catalogForm.publishDate"
              type="date"
              placeholder="请选择日期"
              style="width: 100%;"
            />
          </el-form-item>
          <el-form-item label="作者" prop="author">
            <el-input v-model="catalogForm.author" />
          </el-form-item>
          <el-form-item label="价值" prop="value">
            <el-input v-model="catalogForm.value" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="catalogDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCatalog">
            {{ isEdit ? '更新' : '新增' }}
          </el-button>
        </template>
      </el-dialog>
      <!-- 分类选择弹窗（书目部分使用） -->
      <el-dialog v-model="categoryDialogVisible" title="选择分类" width="500px">
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
                @click="selectCategory(child)"
              >
                {{ child.label }}
              </el-button>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-dialog>
    </el-tab-pane>

    <!-- 馆藏管理 Tab -->
    <el-tab-pane label="馆藏管理" name="collection">
      <div class="toolbar">
        <!-- 搜索关键词及按分类筛选 -->
        <el-input
          v-model="collectionSearch.keyword"
          placeholder="搜索关键词"
          style="width: 200px; margin-right: 10px;"
        />
        <el-button type="primary" @click="searchCollectionHandler">搜索</el-button>
        <el-button
          type="primary"
          @click="openCollectionCategoryDialog"
          style="margin-left: 10px;"
        >
          {{ collectionSelectedCategoryLabel || '选择分类' }}
        </el-button>
        <!-- 新增 书籍条码搜索 -->
        <span style="margin-left: 10px; line-height: 32px;">书籍条码</span>
        <el-input
          v-model="barcodeSearch"
          placeholder="请输入条形码"
          style="width: 200px; margin: 0 10px;"
        />
        <el-button type="primary" @click="searchByBarcode">搜索</el-button>
        <!-- 搜索后出现返回按钮 -->
        <el-button
          type="default"
          v-if="collectionSearchExecuted"
          @click="resetCollectionSearch"
          style="margin-left: 10px;"
        >
          返回
        </el-button>
        <el-button
          type="success"
          @click="openCollectionDialog"
          style="float: right;"
        >
          新增馆藏
        </el-button>
      </div>
      <!-- 点击行查看详情（避免与删除按钮冲突，使用 @row-click） -->
      <el-table
        :data="collectionList"
        border
        style="width: 100%"
        @row-click="viewCollectionDetail"
      >
        <el-table-column prop="barcode" label="条形码" />
        <el-table-column prop="name" label="书名" />
        <el-table-column
          prop="isBorrowable"
          label="可借"
          :formatter="formatBorrowable"
        />
        <el-table-column
          prop="storageDate"
          label="存储时间"
          :formatter="formatDate"
        />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button type="text" size="small" @click.stop="confirmDeleteCollection(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        background
        layout="prev, pager, next"
        :total="collectionTotal"
        :page-size="pageSize"
        :current-page="collectionPage"
        @current-change="handleCollectionPageChange"
        style="margin-top: 15px; text-align: right;"
      />
      <el-dialog
        v-model="collectionDialogVisible"
        title="新增馆藏"
        width="500px"
      >
        <el-form label-width="100px">
          <el-form-item label="ISBN">
            <el-input v-model="isbnInput" placeholder="请输入 ISBN" />
            <el-button type="primary" @click="searchCatalogByIsbn" style="margin-top: 10px;">
              查找
            </el-button>
          </el-form-item>

          <div v-if="!catalogNotFound && catalogInfo.name">
            <el-descriptions title="书目信息" :column="1" border>
              <el-descriptions-item label="书名">{{ catalogInfo.name }}</el-descriptions-item>
              <el-descriptions-item label="作者">{{ catalogInfo.author }}</el-descriptions-item>
              <el-descriptions-item label="分类">{{ catalogInfo.category }}</el-descriptions-item>
              <el-descriptions-item label="出版社">{{ catalogInfo.publisher }}</el-descriptions-item>
              <el-descriptions-item label="出版日期">{{ format(catalogInfo.publishDate) }}</el-descriptions-item>
              <el-descriptions-item label="价值（¥）">{{ catalogInfo.value }}</el-descriptions-item>
            </el-descriptions>
          </div>

          <div v-else-if="catalogNotFound" style="color: #f56c6c; margin-top: 10px;">
            未找到书目信息，请前往“书目管理”新增
          </div>
        </el-form>

        <template #footer>
          <el-button @click="collectionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCollection" :disabled="!catalogInfo.id">
            确定
          </el-button>
        </template>
      </el-dialog>
      <!-- 按类别搜索的分类弹窗（馆藏模块专用） -->
      <el-dialog v-model="collectionCategoryDialogVisible" title="选择分类" width="500px">
        <el-collapse v-model="collectionExpandedCategories">
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
                @click="selectCollectionCategory(child)"
              >
                {{ child.label }}
              </el-button>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-dialog>
      <!-- 书籍详情弹窗（详情内容参照给定代码） -->
      <el-dialog v-model="collectionDetailDialogVisible" :title="collectionDetail.name || '书籍详情'" width="500px">
        <el-descriptions :column="1" border v-if="collectionDetail.id">
          <el-descriptions-item label="作者">{{ collectionDetail.author }}</el-descriptions-item>
          <el-descriptions-item label="出版社">{{ collectionDetail.publisher }}</el-descriptions-item>
          <el-descriptions-item label="ISBN">{{ collectionDetail.isbn }}</el-descriptions-item>
          <el-descriptions-item label="分类">{{ collectionDetail.category }}</el-descriptions-item>
          <el-descriptions-item label="出版时间">{{ format(collectionDetail.publishDate) }}</el-descriptions-item>
          <el-descriptions-item label="存入时间">{{ format(collectionDetail.storageDate) }}</el-descriptions-item>
          <el-descriptions-item label="条码">{{ collectionDetail.barcode }}</el-descriptions-item>
          <el-descriptions-item label="价值">{{ collectionDetail.value }} 元</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="collectionDetail.isBorrowable ? 'success' : 'info'">
              {{ collectionDetail.isBorrowable ? '可借' : '不可借' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-dialog>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useCatalogRepository } from '../repositories/catalog'
import { useCollectionRepository } from '../repositories/collection'
import { useClcRepository } from '../repositories/clc'

// 仓库接口方法
const { 
  getCatalogList, 
  getCatalogByIsbn,
  addCatalog, 
  updateCatalog, 
  deleteCatalog 
} = useCatalogRepository()
const { searchCollections, getCollectionByBarcode, addCollection, deleteCollection } = useCollectionRepository()
const { getClcTree } = useClcRepository()

// 当前所选 Tab：catalog 或 collection
const activeTab = ref('catalog')

// ========== 书目管理 ==========
const catalogList = ref([])
const catalogPage = ref(1)
const catalogTotal = ref(0)
const pageSize = ref(12)

// 搜索状态和关键字（以 ISBN 为示例）
const catalogSearch = reactive({ keyword: '' })
const isSearchActive = ref(false)

// 新增/编辑书目弹窗数据
const catalogDialogVisible = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('新增书目')
const catalogForm = reactive({
  id: null,
  name: '',
  isbn: '',
  publisher: '',
  // 后端需要的分类标识
  category: '',
  // 用于界面显示的分类名称
  categoryName: '',
  publishDate: '',
  author: '',
  value: '',
})
const catalogFormRef = ref(null)

// 表单验证规则
const catalogRules = {
  name: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  isbn: [{ required: true, message: '请输入ISBN', trigger: 'blur' }],
  publisher: [{ required: true, message: '请输入出版社', trigger: 'blur' }],
  category: [{ required: true, message: '请选择类别', trigger: 'blur' }],
  publishDate: [{ required: true, message: '请选择出版日期', trigger: 'change' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  value: [{ required: true, message: '请输入价值', trigger: 'blur' }],
}

// 加载书目列表（分页查询）
const loadCatalogList = async () => {
  try {
    const res = await getCatalogList(catalogPage.value)
    catalogList.value = res.data.records
    catalogTotal.value = res.data.total
    // 同时更新供馆藏新增选择书目的数据
    catalogOptions.value = res.data.records
  } catch (error) {
    console.error('加载书目失败', error)
  }
}

// ISBN 搜索书目
const searchCatalog = async () => {
  if (!catalogSearch.keyword) return
  try {
    const res = await getCatalogByIsbn(catalogSearch.keyword)
    if (res.data) {
      catalogList.value = [res.data]
      catalogTotal.value = 1
      isSearchActive.value = true
    } else {
      catalogList.value = []
      catalogTotal.value = 0
      isSearchActive.value = true
    }
  } catch (error) {
    console.error('搜索书目失败', error)
  }
}

// 返回重置搜索（书目）
const resetSearch = async () => {
  catalogSearch.keyword = ''
  isSearchActive.value = false
  catalogPage.value = 1
  await loadCatalogList()
}

// 打开新增书目弹窗
const openCatalogDialog = () => {
  isEdit.value = false
  dialogTitle.value = '新增书目'
  Object.assign(catalogForm, {
    id: null,
    name: '',
    isbn: '',
    publisher: '',
    category: '',
    categoryName: '',
    publishDate: '',
    author: '',
    value: '',
  })
  catalogDialogVisible.value = true
}

// 编辑书目弹窗：填充数据
const editCatalog = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑书目'
  Object.assign(catalogForm, {
    id: row.id,
    name: row.name,
    isbn: row.isbn,
    publisher: row.publisher,
    category: row.category,
    // 如果 row 中未传递 categoryName，则利用本地 clcOptions 查找
    categoryName: row.categoryName || getCategoryName(row.category),
    publishDate: row.publishDate,
    author: row.author,
    value: row.value,
  })
  catalogDialogVisible.value = true
}

// 提交新增或更新操作
const submitCatalog = () => {
  catalogFormRef.value.validate(async (valid) => {
    if (valid) {
      if (isEdit.value) {
        try {
          const res = await updateCatalog(catalogForm.id, catalogForm)
          if (res.data) {
            ElMessage.success('更新书目成功')
            catalogDialogVisible.value = false
            await loadCatalogList()
          }
        } catch (error) {
          console.error('更新书目失败', error)
          ElMessage.error('更新书目失败')
        }
      } else {
        try {
          const res = await addCatalog(catalogForm)
          if (res.data) {
            ElMessage.success('新增书目成功')
            catalogDialogVisible.value = false
            await loadCatalogList()
          }
        } catch (error) {
          console.error('新增书目失败', error)
          ElMessage.error('新增书目失败')
        }
      }
    }
  })
}

// 删除书目（若存在关联馆藏则删除失败）
const confirmDeleteCatalog = (row) => {
  ElMessageBox.confirm(`确定删除书目【${row.name}】吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const res = await deleteCatalog(row.id)
        if (res.data) {
          ElMessage.success('删除书目成功')
          await loadCatalogList()
        }
      } catch (error) {
        console.error('删除书目失败', error)
        ElMessage.error('删除失败，当前书目下存在对应馆藏记录，请先删除馆藏记录')
      }
    })
    .catch(() => {
      // 用户取消删除操作
    })
}

// 分页处理：书目
const handleCatalogPageChange = (page) => {
  catalogPage.value = page
  if (!isSearchActive.value) {
    loadCatalogList()
  }
}

// ====== 馆藏管理 ==========
const collectionList = ref([])
const collectionPage = ref(1)
const collectionTotal = ref(0)
const collectionSearch = reactive({ keyword: '' })
const collectionDialogVisible = ref(false)
const catalogInfo = ref({})
const catalogNotFound = ref(false)
const isbnInput = ref('')

// 供馆藏选择书目的数据
const catalogOptions = ref([])

// 搜索后的状态标记（仅在执行搜索后显示返回按钮）
const collectionSearchExecuted = ref(false)

// 新增：馆藏条形码搜索
const barcodeSearch = ref('')

// 馆藏详情弹窗相关数据
const collectionDetailDialogVisible = ref(false)
const collectionDetail = reactive({})

// 修改后的加载馆藏列表（增加类别过滤参数）
const loadCollectionList = async () => {
  try {
    const res = await searchCollections(
      collectionPage.value,
      collectionSearch.keyword,
      collectionSelectedCategory.value, // 大类别过滤
      '' // subCategory 可留空
    )
    collectionList.value = res.data.records
    collectionTotal.value = res.data.total
  } catch (error) {
    console.error('加载馆藏信息失败', error)
  }
}

const openCollectionDialog = () => {
  collectionDialogVisible.value = true
  catalogInfo.value = {}
  catalogNotFound.value = false
  isbnInput.value = ''
}

// 查找 ISBN 对应的书目
const searchCatalogByIsbn = async () => {
  if (!isbnInput.value) {
    return ElMessage.warning('请输入 ISBN')
  }

  try {
    const res = await getCatalogByIsbn(isbnInput.value)
    if (res.data) {
      catalogInfo.value = res.data
      catalogNotFound.value = false
    } else {
      catalogNotFound.value = true
      ElMessage.warning('未找到书目信息，请先新增书目')
    }
  } catch (error) {
    catalogNotFound.value = true
    console.error('查找失败', error)
    ElMessage.error('查找失败')
  }
}

const submitCollection = async () => {
  try {
    const res = await addCollection(catalogInfo.value.id)
    if (res.data) {
      catalogInfo.value = {}
      collectionDialogVisible.value = false
      catalogNotFound.value = false
      isbnInput.value = ''
      ElMessage.success('新增馆藏成功')
      loadCollectionList()
    }
  } catch (error) {
    ElMessage.error('新增馆藏失败')
  }
}

// 删除馆藏（仅允许删除那些不满足：状态为不可借且 finePaid 为 0.00 的馆藏）
const confirmDeleteCollection = (row) => {
  // 若馆藏为不可借且罚款金额为 0.00，则禁止删除
  if (!row.isBorrowable && Number(row.finePaid) === 0) {
    return ElMessage.error('该馆藏不可删除')
  }

  ElMessageBox.confirm(
    `确定删除馆藏【${row.barcode}】吗？这将同时删除相关借阅记录。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      try {
        const res = await deleteCollection(row.id)
        if (res.data) {
          ElMessage.success('删除馆藏成功')
          loadCollectionList()
        }
      } catch (error) {
        console.error('删除馆藏失败', error)
        ElMessage.error('删除馆藏失败')
      }
    })
    .catch(() => {
      // 用户取消删除操作
    })
}

// 分页处理：馆藏
const handleCollectionPageChange = (page) => {
  collectionPage.value = page
  loadCollectionList()
}

// ====== 分类选择（书目和馆藏共用） ==========
const categoryDialogVisible = ref(false)
const clcOptions = ref([])
const expandedCategories = ref([])

const loadCategoryOptions = async () => {
  try {
    const res = await getClcTree()
    clcOptions.value = Array.isArray(res.data) ? res.data : []
  } catch (error) {
    console.error('加载分类失败', error)
  }
}

// 书目新增/编辑时打开分类选择弹窗
const openCategoryDialog = async () => {
  categoryDialogVisible.value = true
  if (!clcOptions.value.length) {
    await loadCategoryOptions()
  }
}

// 书目中选择分类后回调
const selectCategory = (child) => {
  catalogForm.category = child.value
  catalogForm.categoryName = child.label
  categoryDialogVisible.value = false
}

// 以下为馆藏搜索按类别相关方法
const collectionCategoryDialogVisible = ref(false)
const collectionSelectedCategory = ref('')
const collectionSelectedCategoryLabel = ref('')
const collectionExpandedCategories = ref([])

const openCollectionCategoryDialog = () => {
  collectionCategoryDialogVisible.value = true
}

const selectCollectionCategory = (child) => {
  collectionSelectedCategory.value = child.value
  collectionSelectedCategoryLabel.value = child.label
  collectionCategoryDialogVisible.value = false
  collectionPage.value = 1
  loadCollectionList()
}

const searchCollectionHandler = async () => {
  collectionPage.value = 1
  await loadCollectionList()
  collectionSearchExecuted.value = true
}

const resetCollectionSearch = async () => {
  collectionSearch.keyword = ''
  collectionSelectedCategory.value = ''
  collectionSelectedCategoryLabel.value = ''
  collectionPage.value = 1
  collectionSearchExecuted.value = false
  await loadCollectionList()
}

// ====== 查看馆藏详情 ==========
const viewCollectionDetail = async (row) => {
  try {
    const res = await getCollectionByBarcode(row.barcode)
    if (res.data) {
      Object.assign(collectionDetail, res.data)
      collectionDetailDialogVisible.value = true
    }
  } catch (error) {
    console.error('获取馆藏详情失败', error)
    ElMessage.error('获取馆藏详情失败')
  }
}

const searchByBarcode = async () => {
  if (!barcodeSearch.value) {
    return ElMessage.error('请输入条形码')
  }
  try {
    const res = await getCollectionByBarcode(barcodeSearch.value)
    if (res.data) {
      Object.assign(collectionDetail, res.data)
      collectionDetailDialogVisible.value = true
    } else {
      ElMessage.error('未找到对应馆藏')
    }
  } catch (error) {
    console.error('查询馆藏详情失败', error)
    ElMessage.error('查询馆藏详情失败')
  }
}

// ====== 辅助函数 ==========
const getCategoryName = (catId) => {
  if (!clcOptions.value.length) return ''
  for (const group of clcOptions.value) {
    if (group.value === catId) return group.label
    if (group.children) {
      for (const child of group.children) {
        if (child.value === catId) return child.label
      }
    }
  }
  return ''
}

const formatDate = (row, column, cellValue) => {
  return cellValue ? new Date(cellValue).toLocaleDateString() : ''
}

const formatBorrowable = (row, column, cellValue) => {
  return cellValue ? '是' : '否'
}

// 辅助函数，用于详情弹窗中格式化日期（取前10个字符）
const format = (date) => date ? date.slice(0, 10) : '—'

onMounted(() => {
  loadCategoryOptions()
  loadCatalogList()
  loadCollectionList()
})
</script>

<style scoped>
.toolbar {
  margin-bottom: 15px;
}
.child-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.5rem;
}
</style>
