<template>
  <table class="table">
    <thead>
      <tr>
        <th>學號</th>
        <th>名</th>
        <th>姓</th>
        <th>電子郵件</th>
        <th>生日</th>
        <th>操作</th>
      </tr>
      <tr class="filter-row">
        <th>
          <input 
            :value="filters.studentId" 
            @input="handleFilterInput('studentId', $event)" 
            placeholder="篩選學號" 
            class="filter-input" 
          />
        </th>
        <th>
          <input 
            :value="filters.firstName" 
            @input="handleFilterInput('firstName', $event)" 
            placeholder="篩選名" 
            class="filter-input" 
          />
        </th>
        <th>
          <input 
            :value="filters.lastName" 
            @input="handleFilterInput('lastName', $event)" 
            placeholder="篩選姓" 
            class="filter-input" 
          />
        </th>
        <th>
          <input 
            :value="filters.email" 
            @input="handleFilterInput('email', $event)" 
            placeholder="篩選電子郵件" 
            class="filter-input" 
          />
        </th>
        <th>
          <input 
            :value="filters.birthday" 
            @input="handleFilterInput('birthday', $event)" 
            placeholder="篩選生日" 
            class="filter-input" 
            type="date"
          />
        </th>
        <th>
          <button @click="$emit('clear-filters')" class="clear-filters-btn">
            清除
          </button>
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="student in students" :key="student.studentId">
        <td class="student-id">{{ student.studentId }}</td>
        <td>{{ student.firstName }}</td>
        <td>{{ student.lastName }}</td>
        <td class="email-cell">
          <a :href="`mailto:${student.email}`" class="email-link">
            {{ student.email }}
          </a>
        </td>
        <td class="date-cell">{{ formatDate(student.birthday) }}</td>
        <td class="actions-cell">
          <div class="action-buttons">
            <button 
              class="btn btn-sm btn-outline" 
              @click="$emit('edit', student)" 
              :disabled="loading"
              title="編輯學生"
            >
              編輯
            </button>
            <button 
              class="btn btn-sm btn-danger" 
              @click="$emit('delete', student.studentId)" 
              :disabled="loading"
              title="刪除學生"
            >
              刪除
            </button>
          </div>
        </td>
      </tr>
      <tr v-if="students.length === 0 && !loading">
        <td colspan="6" class="no-data">
          沒有符合篩選條件的學生
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
import { defineEmits } from 'vue';

defineProps({
  students: {
    type: Array,
    default: () => []
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['edit', 'delete', 'filter-change', 'clear-filters']);

function handleFilterInput(field, event) {
  emit('filter-change', { [field]: event.target.value });
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW');
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

.filter-row th {
  padding: 8px;
  background: #f1f3f4;
}

.filter-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 13px;
  transition: border-color 0.2s ease;
}

.filter-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.clear-filters-btn {
  padding: 6px 12px;
  font-size: 13px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.clear-filters-btn:hover {
  background: #5a6268;
}

.student-id {
  font-family: monospace;
  font-weight: 500;
  color: #495057;
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

.date-cell {
  font-family: monospace;
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