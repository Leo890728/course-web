<template>
  <Teleport to="body">
    <div 
      v-if="visible" 
      class="modal-backdrop" 
      @click="handleBackdropClick"
    >
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">學生選課列表</h2>
          <button class="btn-close" @click="$emit('close')" aria-label="關閉">
            <span>&times;</span>
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <span>載入中...</span>
          </div>
          
          <div v-else-if="error" class="error-state">
            <span class="error-icon">⚠</span>
            <span>{{ error }}</span>
          </div>
          
          <div v-else-if="courses.length > 0" class="courses-content">
            <div class="courses-summary">
              共 {{ totalCount || courses.length }} 門課程已選修
            </div>
            
            <div class="table-wrapper">
              <table class="courses-table">
                <thead>
                  <tr>
                    <th>課程編號</th>
                    <th>課程名稱</th>
                    <th>課程描述</th>
                    <th>學分</th>
                    <th>授課教師</th>
                    <th>選課時間</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="course in courses" :key="course.courseId">
                    <td class="course-id">{{ course.courseId }}</td>
                    <td class="course-name">{{ course.name }}</td>
                    <td class="course-description">{{ course.description }}</td>
                    <td class="course-credits">{{ course.credits }}</td>
                    <td class="course-teacher">{{ course.teacher?.name || '未指定' }}</td>
                    <td class="enrollment-date">{{ formatDate(course.enrollmentDate) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="pagination-wrapper" v-if="totalPages > 1">
              <Pagination
                :current-page="currentPage"
                :total-pages="totalPages"
                :total-count="totalCount"
                :page-size="pageSize"
                :loading="loading"
                @page-change="$emit('page-change', $event)"
                @page-size-change="$emit('page-size-change', $event)"
              />
            </div>
          </div>
          
          <div v-else class="empty-state">
            <div class="empty-icon">📚</div>
            <p>此學生目前沒有選修任何課程</p>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="$emit('close')">
            關閉
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import Pagination from './Pagination.vue';

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  courses: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  currentPage: {
    type: Number,
    default: 0
  },
  totalPages: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 0
  },
  pageSize: {
    type: Number,
    default: 20
  }
});

const emit = defineEmits(['close', 'page-change', 'page-size-change']);

function handleBackdropClick() {
  emit('close');
}

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW');
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  backdrop-filter: blur(2px);
}

.modal {
  background: white;
  justify-self: anchor-center;
  top: 50px;
  border-radius: 12px;
  width: 90vw;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  animation: modalIn 0.2s ease-out;
  margin: auto;
  overflow: auto;
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  border-radius: 12px 12px 0 0;
  background: #f8f9fa;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #6c757d;
  transition: all 0.2s ease;
}

.btn-close:hover {
  background: #e9ecef;
  color: #495057;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 16px;
  color: #6c757d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e9ecef;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  color: #721c24;
}

.error-icon {
  font-size: 1.2em;
}

.courses-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.courses-summary {
  padding: 12px 16px;
  background: #e7f3ff;
  border: 1px solid #b8daff;
  border-radius: 6px;
  color: #004085;
  font-weight: 500;
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.courses-table {
  width: 100%;
  border-collapse: collapse;
}

.courses-table th,
.courses-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.courses-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  position: sticky;
  top: 0;
}

.courses-table tbody tr:hover {
  background: #f8f9fa;
}

.courses-table tbody tr:last-child td {
  border-bottom: none;
}

.course-id {
  font-family: monospace;
  font-weight: 500;
  color: #495057;
}

.course-name {
  font-weight: 500;
  color: #2c3e50;
}

.course-description {
  color: #6c757d;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-credits {
  font-weight: 500;
  color: #495057;
}

.course-teacher {
  font-weight: 500;
  color: #2c3e50;
}

.enrollment-date {
  font-family: monospace;
  color: #6c757d;
  font-weight: 500;
}

.pagination-wrapper {
  padding: 16px 0;
  border-top: 1px solid #dee2e6;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: #6c757d;
  gap: 16px;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 1.1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  color: #495057;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #6c757d;
  border-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  border-color: #545b62;
}
</style>