<template>
  <table class="table">
    <thead>
      <tr>
        <th>編號</th>
        <th>姓名</th>
        <th>電子郵件</th>
        <th>年齡</th>
        <th>操作</th>
      </tr>
      <tr class="search-row">
        <th colspan="5">
          <div class="search-container">
            <input 
              :value="searchQuery" 
              @input="handleSearchInput"
              @keyup.enter="$emit('search', searchQuery)"
              placeholder="搜尋教師（編號、姓名、電子郵件）" 
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
      <tr v-for="teacher in teachers" :key="teacher.teacherId">
        <td class="teacher-id">{{ teacher.teacherId }}</td>
        <td class="teacher-name">{{ teacher.name }}</td>
        <td class="email-cell">
          <a :href="`mailto:${teacher.email}`" class="email-link">
            {{ teacher.email }}
          </a>
        </td>
        <td class="age-cell">{{ teacher.age }} 歲</td>
        <td class="actions-cell">
          <div class="action-buttons">
            <button 
              class="btn btn-sm btn-info" 
              @click="$emit('view-courses', teacher.teacherId)" 
              :disabled="loading"
              title="查看課程"
            >
              查看課程
            </button>
            <button 
              class="btn btn-sm btn-outline" 
              @click="$emit('edit', teacher)" 
              :disabled="loading"
              title="編輯教師"
            >
              編輯
            </button>
            <button 
              class="btn btn-sm btn-danger" 
              @click="$emit('delete', teacher.teacherId)" 
              :disabled="loading"
              title="刪除教師"
            >
              刪除
            </button>
          </div>
        </td>
      </tr>
      <tr v-if="teachers.length === 0 && !loading">
        <td colspan="5" class="no-data">
          沒有找到教師資料
        </td>
      </tr>
      <tr v-if="loading">
        <td colspan="5" class="loading-row">
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
  teachers: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['edit', 'delete', 'view-courses', 'search']);

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

.teacher-id {
  font-family: monospace;
  font-weight: 500;
  color: #495057;
}

.teacher-name {
  font-weight: 500;
  color: #2c3e50;
}

.email-cell {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.email-link {
  color: #007bff;
  text-decoration: none;
  transition: color 0.2s ease;
}

.email-link:hover {
  color: #0056b3;
  text-decoration: underline;
}

.age-cell {
  text-align: center;
  font-weight: 500;
  color: #6c757d;
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