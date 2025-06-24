<template>
  <div class="catalog-collection-page">
    <h2>书目与馆藏管理</h2>
    <el-tabs v-model="activeTab">
      
      <el-tab-pane label="书目管理" name="catalog">
        <div class="toolbar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div class="search-left" style="display: flex; align-items: center; gap: 10px;">
            <el-input
              v-model="catalogSearch.keyword"
              placeholder="请输入ISBN搜索书目"
              style="width: 200px;"
              clearable
              @clear="resetSearch"
            />
            <el-button type="primary" @click="searchCatalog">搜索</el-button>
          </div>
          <div class="search-right">
            <el-button type="primary" @click="openCatalogDialog">新增书目</el-button>
          </div>
        </div>
        <el-table :data="catalogList" border style="width: 100%">
          <el-table-column prop="name" label="书名" />
          <el-table-column prop="isbn" label="ISBN" />
          <el-table-column prop="publisher" label="出版社" />
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
              <el-button type="primary" size="small" @click="editCatalog(row)">编辑</el-button>
              <el-button type="danger" size="small" @click="confirmDeleteCatalog(row)">删除</el-button>
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
        <el-dialog
          v-model="catalogDialogVisible"
          :title="dialogTitle"
          width="400px"
        >
          <el-form
            :model="catalogForm"
            :rules="catalogRules"
            ref="catalogFormRef"
            label-width="80px"
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
            <el-button type="primary" @click="submitCatalog">保存</el-button>
          </template>
        </el-dialog>

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

      <el-tab-pane label="馆藏管理" name="collection">
        <div
          class="search-header"
          style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;"
        >
          <div class="left" style="display: flex; align-items: center; gap: 8px;">
            <el-button type="primary" @click="openCollectionCategoryDialog">
              {{ collectionSelectedCategoryLabel || '选择分类' }}
            </el-button>
            <el-input
              v-model="collectionSearch.keyword"
              placeholder="搜索关键词"
              style="width: 240px;"
              clearable
              @clear="resetCollectionSearch"
            />
            <el-button type="primary" @click="searchCollectionHandler">
              搜索
            </el-button>
            <el-input
              v-model="barcodeSearch"
              placeholder="请输入条形码"
              style="width: 240px;"
              clearable
            />
            <el-button type="primary" @click="searchByBarcode">
              搜索
            </el-button>
          </div>
          <div class="right">
            <el-button type="primary" @click="openCollectionDialog">
              新增馆藏
            </el-button>
          </div>
        </div>

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
            <el-button type="danger" size="small" @click.stop="confirmDeleteCollection(row)">
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
        <el-dialog v-model="collectionDialogVisible" title="新增馆藏" width="500px">
          <el-form label-width="100px">
            <el-form-item label="ISBN">
              <div style="display: flex; align-items: center;">
                <el-input v-model="isbnInput" placeholder="请输入 ISBN" style="flex: 1;" />
                <el-button type="primary" @click="searchCatalogByIsbn" style="margin-left: 10px;">
                  查找
                </el-button>
              </div>
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
        <el-dialog v-model="collectionCategoryDialogVisible" width="500px">
          <template #title>
            <div class="dialog-header" style="display: flex; justify-content: space-between; align-items: center;">
              <span>选择分类</span>
              <el-button type="text" size="small" @click="clearCollectionCategory">清除分类</el-button>
            </div>
          </template>
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

        <el-dialog v-model="collectionDetailDialogVisible" :title="collectionDetail.name || '书籍详情'" width="500px">
          <el-descriptions :column="1" border v-if="collectionDetail.id">
            <el-descriptions-item label="作者">{{ collectionDetail.author }}</el-descriptions-item>
            <el-descriptions-item label="出版社">{{ collectionDetail.publisher }}</el-descriptions-item>
            <el-descriptions-item label="ISBN">{{ collectionDetail.isbn }}</el-descriptions-item>
            <el-descriptions-item label="分类">{{ collectionDetail.category }}{{ getCategoryName(collectionDetail.category) }}</el-descriptions-item>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useCatalogRepository } from '../repositories/catalog'
import { useCollectionRepository } from '../repositories/collection'
import { useClcRepository } from '../repositories/clc'

const { 
  getCatalogList, 
  getCatalogByIsbn,
  addCatalog, 
  updateCatalog, 
  deleteCatalog 
} = useCatalogRepository()
const { searchCollections, getCollectionByBarcode, addCollection, deleteCollection } = useCollectionRepository()
const { getClcTree } = useClcRepository()

const activeTab = ref('catalog')

const catalogList = ref([])
const catalogPage = ref(1)
const catalogTotal = ref(0)
const pageSize = ref(12)

const catalogSearch = reactive({ keyword: '' })
const isSearchActive = ref(false)

const catalogDialogVisible = ref(false)
const isEdit = ref(false)
const dialogTitle = ref('新增书目')
const catalogForm = reactive({
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
const catalogFormRef = ref(null)

const catalogRules = {
  name: [{ required: true, message: '请输入书名', trigger: 'blur' }],
  isbn: [{ required: true, message: '请输入ISBN', trigger: 'blur' }],
  publisher: [{ required: true, message: '请输入出版社', trigger: 'blur' }],
  category: [{ required: true, message: '请选择类别', trigger: 'blur' }],
  publishDate: [{ required: true, message: '请选择出版日期', trigger: 'change' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  value: [{ required: true, message: '请输入价值', trigger: 'blur' }],
}

const loadCatalogList = async () => {
  try {
    const res = await getCatalogList(catalogPage.value)
    catalogList.value = res.data.records
    catalogTotal.value = res.data.total
    catalogOptions.value = res.data.records
  } catch (error) {
    console.error('加载书目失败', error)
  }
}

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

const resetSearch = async () => {
  catalogSearch.keyword = ''
  isSearchActive.value = false
  catalogPage.value = 1
  await loadCatalogList()
}

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

const editCatalog = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑书目'
  Object.assign(catalogForm, {
    id: row.id,
    name: row.name,
    isbn: row.isbn,
    publisher: row.publisher,
    category: row.category,
    categoryName: row.categoryName || getCategoryName(row.category),
    publishDate: row.publishDate,
    author: row.author,
    value: row.value,
  })
  catalogDialogVisible.value = true
}

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

const confirmDeleteCatalog = (row) => {
  ElMessageBox.confirm(`确定删除书目【${row.name}】吗？`, '提示', {
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
    })
}

const handleCatalogPageChange = (page) => {
  catalogPage.value = page
  if (!isSearchActive.value) {
    loadCatalogList()
  }
}

const collectionList = ref([])
const collectionPage = ref(1)
const collectionTotal = ref(0)
const collectionSearch = reactive({ keyword: '' })
const collectionDialogVisible = ref(false)
const catalogInfo = ref({})
const catalogNotFound = ref(false)
const isbnInput = ref('')

const catalogOptions = ref([])

const collectionSearchExecuted = ref(false)

const barcodeSearch = ref('')

const collectionDetailDialogVisible = ref(false)
const collectionDetail = reactive({})

const loadCollectionList = async () => {
  try {
    const res = await searchCollections(
      collectionPage.value,
      collectionSearch.keyword,
      collectionSelectedCategory.value,
      ''
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

const confirmDeleteCollection = (row) => {
  if (!row.isBorrowable && Number(row.finePaid) === 0) {
    return ElMessage.error('该馆藏不可删除')
  }

  ElMessageBox.confirm(
    `确定删除馆藏【${row.barcode}】吗？这将同时删除相关借阅记录。`,
    '提示',
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
    })
}

const handleCollectionPageChange = (page) => {
  collectionPage.value = page
  loadCollectionList()
}

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

const openCategoryDialog = async () => {
  categoryDialogVisible.value = true
  if (!clcOptions.value.length) {
    await loadCategoryOptions()
  }
}

const selectCategory = (child) => {
  catalogForm.category = child.value
  catalogForm.categoryName = child.label
  categoryDialogVisible.value = false
}

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

const clearCollectionCategory = async () => {
  collectionSelectedCategory.value = ''
  collectionSelectedCategoryLabel.value = ''
  collectionCategoryDialogVisible.value = false
  collectionPage.value = 1
  await loadCollectionList()
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

.catalog-collection-page {
  max-width: 94%;
  margin-top: 24px;
  margin-bottom: 24px;
  padding: 24px;
}

.child-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.5rem;
}
</style>