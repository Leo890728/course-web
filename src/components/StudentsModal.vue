<template>
  <Teleport to="body">
    <div 
      v-if="visible" 
      class="modal-backdrop" 
      @click="handleBackdropClick"
    >
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">選課學生列表</h2>
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
          
          <div v-else-if="students.length > 0" class="students-content">
            <div class="students-summary">
              共 {{ students.length }} 位學生選修此課程
            </div>
            
            <div class="table-wrapper">
              <table class="students-table">
                <thead>
                  <tr>
                    <th>學號</th>
                    <th>姓名</th>
                    <th>電子郵件</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="student in students" :key="student.studentId">
                    <td class="student-id">{{ student.studentId }}</td>
                    <td class="student-name">{{ student.firstName }} {{ student.lastName }}</td>
                    <td class="student-email">
                      <a :href="`mailto:${student.email}`" class="email-link">
                        {{ student.email }}
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div v-else class="empty-state">
            <div class="empty-icon">📚</div>
            <p>此課程目前沒有學生選修</p>
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

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  students: {
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
  }
});

const emit = defineEmits(['close']);

function handleBackdropClick() {
  emit('close');
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
  max-width: 800px;
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

.students-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.students-summary {
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

.students-table {
  width: 100%;
  border-collapse: collapse;
}

.students-table th,
.students-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.students-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  position: sticky;
  top: 0;
}

.students-table tbody tr:hover {
  background: #f8f9fa;
}

.students-table tbody tr:last-child td {
  border-bottom: none;
}

.student-id {
  font-family: monospace;
  font-weight: 500;
  color: #495057;
}

.student-name {
  font-weight: 500;
  color: #2c3e50;
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