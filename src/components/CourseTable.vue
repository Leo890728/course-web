<template>
  <table class="table">
    <thead>
      <tr>
        <th>課程編號</th>
        <th>課程名稱</th>
        <th>描述</th>
        <th>學分</th>
        <th>授課教師</th>
        <th>操作</th>
      </tr>
      <tr class="search-row">
        <th colspan="6">
          <div class="search-container">
            <input 
              :value="searchQuery" 
              @input="handleSearchInput"
              @keyup.enter="$emit('search', searchQuery)"
              placeholder="搜尋課程（課程編號、名稱、描述、教師）" 
              class="search-input" 
            />
            <button 
              @click="$emit('search', searchQuery)" 
              class="search-btn"
              :disabled="loading"
            >
              搜尋
            </button>
            <button 
              @click="handleClearSearch" 
              class="clear-search-btn"
              :disabled="loading"
            >
              清除
            </button>
          </div>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="course in courses" :key="course.courseId">
        <td>{{ course.courseId }}</td>
        <td>{{ course.name }}</td>
        <td class="description-cell">{{ course.description }}</td>
        <td class="credits-cell">{{ course.credits }}</td>
        <td>{{ course.teacher?.name || '未指定' }}</td>
        <td class="actions-cell">
          <div class="action-buttons">
            <button 
              class="btn btn-sm btn-info" 
              @click="$emit('view-students', course.courseId)" 
              :disabled="loading"
              title="查看選課學生"
            >
              查看學生
            </button>
            <button 
              class="btn btn-sm btn-outline" 
              @click="$emit('edit', course)" 
              :disabled="loading"
              title="編輯課程"
            >
              編輯
            </button>
            <button 
              class="btn btn-sm btn-danger" 
              @click="$emit('delete', course.courseId)" 
              :disabled="loading"
              title="刪除課程"
            >
              刪除
            </button>
          </div>
        </td>
      </tr>
      <tr v-if="courses.length === 0 && !loading">
        <td colspan="6" class="no-data">
          沒有找到課程資料
        </td>
      </tr>
      <tr v-if="loading">
        <td colspan="6" class="loading-row">
          <div class="table-loading">
            <div class="loading-spinner"></div>
            <span>載入中...</span>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

defineProps({
  courses: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['edit', 'delete', 'view-students', 'search']);

const searchQuery = ref('');

function handleSearchInput(event) {
  searchQuery.value = event.target.value;
}

function handleClearSearch() {
  searchQuery.value = '';
  emit('search', '');
}
</script>

<style scoped>
.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.table th,
.table td {
  border-bottom: 1px solid #dee2e6;
  padding: 12px;
  text-align: left;
  vertical-align: middle;
}

.table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  border-top: 1px solid #dee2e6;
}

.search-row th {
  padding: 12px;
  background: #f1f3f4;
}

.search-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.search-btn {
  padding: 8px 16px;
  font-size: 14px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-btn:hover:not(:disabled) {
  background: #0056b3;
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clear-search-btn {
  padding: 8px 16px;
  font-size: 14px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clear-search-btn:hover:not(:disabled) {
  background: #5a6268;
}

.clear-search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.description-cell {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.credits-cell {
  text-align: center;
  font-weight: 500;
}

.actions-cell {
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 6px;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 500;
}

.btn-outline {
  background: white;
  border: 1px solid #dee2e6;
  color: #495057;
}

.btn-outline:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #6c757d;
}

.btn-danger {
  background: #dc3545;
  border: 1px solid #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
  border-color: #bd2130;
}

.btn-info {
  background: #17a2b8;
  border: 1px solid #17a2b8;
  color: white;
}

.btn-info:hover:not(:disabled) {
  background: #138496;
  border-color: #117a8b;
}

.no-data {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 32px;
}

.loading-row {
  text-align: center;
  padding: 24px;
}

.table-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #6c757d;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e9ecef;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>