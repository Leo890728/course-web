<template>
  <div class="container">
    <header class="page-header">
      <h1 class="title">資料初始化</h1>
      <div class="toolbar">
        <button class="btn btn-info" @click="loadApiInfo" :disabled="loading">
          API 說明
        </button>
        <button class="btn btn-secondary" @click="testSSEConnection" :disabled="loading">
          測試SSE連接
        </button>
      </div>
    </header>

    <div class="main-content">
      <!-- 配置表單 -->
      <div class="form-card">
        <h2 class="card-title">隨機資料生成配置</h2>
        <form @submit.prevent="handleSubmit" class="data-form">
          <div class="form-row">
            <div class="form-group">
              <label for="studentCount">學生數量</label>
              <input
                id="studentCount"
                v-model.number="formData.studentCount"
                type="number"
                min="1"
                max="50000"
                class="form-control"
                :disabled="loading"
              >
              <small class="form-text">建議範圍：1-50,000</small>
            </div>
            <div class="form-group">
              <label for="teacherCount">老師數量</label>
              <input
                id="teacherCount"
                v-model.number="formData.teacherCount"
                type="number"
                min="1"
                max="100"
                class="form-control"
                :disabled="loading"
              >
              <small class="form-text">建議範圍：1-100</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="courseCount">課程數量</label>
              <input
                id="courseCount"
                v-model.number="formData.courseCount"
                type="number"
                min="1"
                :max="maxCourseCount"
                class="form-control"
                :disabled="loading"
              >
              <small class="form-text">最大{{ maxCourseCount }}門（CSV檔案限制）</small>
            </div>
            <div class="form-group">
              <label for="enrollmentCount">選課數量</label>
              <input
                id="enrollmentCount"
                v-model.number="formData.enrollmentCount"
                type="number"
                min="1"
                max="10000000"
                class="form-control"
                :disabled="loading"
              >
              <small class="form-text">不可超過學生×課程數量，建議最大1000萬</small>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <div v-if="loading" class="loading-spinner"></div>
              {{ loading ? '執行中...' : '開始生成資料' }}
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              @click="resetForm"
              :disabled="loading"
            >
              重設為預設值
            </button>
          </div>
        </form>

        <!-- 進度顯示 -->
        <div v-if="progress.show" class="progress-section">
          <h3 class="progress-title">
            <span class="progress-icon">⚙️</span>
            執行進度
          </h3>
          <div class="progress-container">
            <div class="progress-bar-wrapper">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: progress.percentage + '%' }"
                ></div>
              </div>
              <span class="progress-text">{{ progress.percentage }}%</span>
            </div>
            <div class="progress-step">
              <span class="step-indicator">{{ progress.current }}/{{ progress.total }}</span>
              <span class="step-description">{{ progress.step }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 危險操作區域 -->
      <div class="danger-card">
        <h2 class="card-title danger-title">
          危險操作
        </h2>
        <p class="danger-description">
          此操作將會永久刪除所有資料庫資料，包括學生、老師、課程和選課記錄。
        </p>
        <button
          class="btn btn-danger"
          @click="handleClearData"
          :disabled="loading"
        >
          清除所有資料
        </button>
      </div>

      <!-- 結果顯示 -->
      <div v-if="result" class="result-card" :class="result.success ? 'success' : 'error'">
        <h3 class="result-title">
          <span class="result-icon">{{ result.success ? '✅' : '❌' }}</span>
          {{ result.success ? '操作成功' : '操作失敗' }}
        </h3>
        <p class="result-message">{{ result.message }}</p>
        <div v-if="result.success && result.data" class="result-details">
          <h4>執行詳情：</h4>
          <ul>
            <li>學生數量：{{ result.data.studentCount }}</li>
            <li>老師數量：{{ result.data.teacherCount }}</li>
            <li>課程數量：{{ result.data.courseCount }}</li>
            <li>選課數量：{{ result.data.enrollmentCount }}</li>
            <li>執行時間：{{ result.data.executionTime }}</li>
          </ul>
        </div>
      </div>

      <!-- API 說明 -->
      <div v-if="apiInfo" class="info-card">
        <h3 class="card-title">API 使用說明</h3>
        <div class="info-content">
          <p><strong>描述：</strong>{{ apiInfo.description }}</p>
          <p><strong>端點：</strong><code>{{ apiInfo.endpoint }}</code></p>
          <p><strong>方法：</strong><code>{{ apiInfo.method }}</code></p>
          <p><strong>範例：</strong><code>{{ apiInfo.example }}</code></p>
          <p><strong>注意：</strong>{{ apiInfo.note }}</p>

          <h4>參數說明：</h4>
          <ul>
            <li v-for="(desc, param) in apiInfo.parameters" :key="param">
              <strong>{{ param }}：</strong>{{ desc }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { initializeData, initializeDataWithProgress, getDataInfo, clearAllData, testSSE } from '@/api/dataInit'
import { useConfirm } from '@/composables/useConfirm'
import { useErrorHandler } from '@/composables/useErrorHandler'

const loading = ref(false)
const result = ref(null)
const apiInfo = ref(null)
const maxCourseCount = ref(20) // 預設值，將動態更新

const progress = reactive({
  show: false,
  step: '',
  current: 0,
  total: 0,
  percentage: 0
})

const { confirm } = useConfirm()
const { handleError } = useErrorHandler()

const defaultFormData = {
  studentCount: 10000,
  teacherCount: 100,
  courseCount: 50,
  enrollmentCount: 1000000
}

const formData = reactive({ ...defaultFormData })

function resetForm() {
  Object.assign(formData, defaultFormData)
  result.value = null
  progress.show = false
}

async function handleSubmit() {
  result.value = null
  progress.show = false

  // 驗證表單
  if (formData.enrollmentCount > formData.studentCount * formData.courseCount) {
    result.value = {
      success: false,
      message: '選課數量不能超過學生數量 × 課程數量'
    }
    return
  }

  const confirmed = await confirm(
    '確定要初始化資料嗎？',
    '此操作將清除現有資料並生成新的隨機資料。'
  )
  if (!confirmed) return

  loading.value = true
  progress.show = true
  progress.step = '準備中...'
  progress.current = 0
  progress.total = 5
  progress.percentage = 0

  try {
    const eventSource = initializeDataWithProgress(
      formData,
      // onProgress
      (progressData) => {
        progress.step = progressData.step
        progress.current = progressData.current
        progress.total = progressData.total
        progress.percentage = progressData.percentage
      },
      // onComplete
      (data) => {
        result.value = data
        progress.show = false
        loading.value = false
        
        if (data.success) {
          console.log('資料初始化成功:', data)
        }
      },
      // onError
      (errorData) => {
        result.value = errorData
        progress.show = false
        loading.value = false
      }
    )
    
  } catch (error) {
    result.value = {
      success: false,
      message: handleError(error, '資料初始化失敗')
    }
    progress.show = false
    loading.value = false
  }
}

async function handleClearData() {
  const confirmed = await confirm(
    '確定要清除所有資料嗎？',
    '此操作將永久刪除所有學生、老師、課程和選課資料，且無法復原！'
  )
  if (!confirmed) return

  loading.value = true
  result.value = null

  try {
    const { data } = await clearAllData()
    result.value = data
  } catch (error) {
    result.value = {
      success: false,
      message: handleError(error, '清除資料失敗')
    }
  } finally {
    loading.value = false
  }
}

async function loadApiInfo() {
  loading.value = true

  try {
    const { data } = await getDataInfo()
    apiInfo.value = data
    
    // 更新最大課程數量
    if (data.availableCourses) {
      maxCourseCount.value = data.availableCourses
    }
  } catch (error) {
    result.value = {
      success: false,
      message: handleError(error, '載入API說明失敗')
    }
  } finally {
    loading.value = false
  }
}

// 頁面載入時自動獲取API資訊以更新課程數量限制
async function initializePageData() {
  try {
    const { data } = await getDataInfo()
    if (data.availableCourses) {
      maxCourseCount.value = data.availableCourses
    }
  } catch (error) {
    console.warn('無法載入課程數量限制:', error)
  }
}

function testSSEConnection() {
  console.log('開始測試SSE連接...')
  result.value = { success: true, message: '正在測試SSE連接，請查看控制台輸出...' }
  
  try {
    const eventSource = testSSE()
    
    setTimeout(() => {
      if (eventSource.readyState === EventSource.OPEN) {
        console.log('SSE連接測試成功！')
      } else {
        console.log('SSE連接狀態:', eventSource.readyState)
        result.value = { success: false, message: 'SSE連接測試失敗，請查看控制台錯誤' }
      }
    }, 2000)
    
  } catch (error) {
    console.error('SSE測試錯誤:', error)
    result.value = { success: false, message: 'SSE測試失敗: ' + error.message }
  }
}

onMounted(() => {
  initializePageData()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.title {
  margin: 0;
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
}

.toolbar {
  display: flex;
  gap: 12px;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-card, .danger-card, .result-card, .info-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 24px;
}

.card-title {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
}

.danger-card {
  border-left: 4px solid #dc3545;
  background: #fff5f5;
}

.danger-title {
  color: #dc3545;
  display: flex;
  align-items: center;
  gap: 8px;
}

.warning-icon {
  font-size: 1.2em;
}

.danger-description {
  color: #721c24;
  margin-bottom: 16px;
  line-height: 1.5;
}

.data-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
}

.form-control {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.1);
}

.form-control:disabled {
  background: #f8f9fa;
  opacity: 0.6;
}

.form-text {
  font-size: 12px;
  color: #6c757d;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  color: #495057;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #adb5bd;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
  border-color: #004085;
}

.btn-secondary {
  background: #6c757d;
  border-color: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
  border-color: #4e555b;
}

.btn-danger {
  background: #dc3545;
  border-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
  border-color: #bd2130;
}

.btn-info {
  background: #17a2b8;
  border-color: #17a2b8;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background: #138496;
  border-color: #117a8b;
}

.btn-icon {
  font-size: 16px;
  line-height: 1;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.result-card.success {
  border-left: 4px solid #28a745;
  background: #f8fff9;
}

.result-card.error {
  border-left: 4px solid #dc3545;
  background: #fff5f5;
}

.result-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.result-card.success .result-title {
  color: #155724;
}

.result-card.error .result-title {
  color: #721c24;
}

.result-message {
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.result-card.success .result-message {
  color: #155724;
}

.result-card.error .result-message {
  color: #721c24;
}

.result-details h4 {
  margin: 8px 0 8px 0;
  font-size: 1rem;
}

.result-details ul {
  margin: 0;
  padding-left: 20px;
}

.result-details li {
  margin: 4px 0;
}

.info-content code {
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
}

.info-content h4 {
  margin: 16px 0 8px 0;
  font-size: 1rem;
  color: #2c3e50;
}

.info-content ul {
  margin: 0;
  padding-left: 20px;
}

.info-content li {
  margin: 4px 0;
  line-height: 1.5;
}

.progress-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 24px;
  border-left: 4px solid #007bff;
  background: #f8feff;
}

.progress-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  color: #007bff;
  font-size: 1.1rem;
  font-weight: 600;
}

.progress-icon {
  font-size: 1.2em;
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 20px;
  background: #e9ecef;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff 0%, #0056b3 100%);
  border-radius: 10px;
  transition: width 0.3s ease;
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(
    45deg,
    rgba(255,255,255,0.2) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255,255,255,0.2) 50%,
    rgba(255,255,255,0.2) 75%,
    transparent 75%,
    transparent
  );
  background-size: 20px 20px;
  animation: progress-stripes 1s linear infinite;
}

@keyframes progress-stripes {
  0% { background-position: 0 0; }
  100% { background-position: 20px 0; }
}

.progress-text {
  font-weight: 600;
  color: #007bff;
  min-width: 40px;
  text-align: right;
}

.progress-step {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-top: 1px solid #dee2e6;
}

.step-indicator {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.9em;
}

.step-description {
  color: #495057;
  font-weight: 500;
}
</style>
