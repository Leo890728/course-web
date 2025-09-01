<template>
  <div class="container">
    <header class="page-header">
      <h1 class="title">學生列表</h1>
      <div class="toolbar">
        <button class="btn btn-primary" @click="openCreateModal" :disabled="loading">
          <span class="btn-icon">+</span>
          新增學生
        </button>
      </div>
    </header>

    <div v-if="loading && !students.length" class="loading">
      <div class="loading-spinner"></div>
      <span>載入中...</span>
    </div>
    
    <div v-else class="table-container">
      <StudentTable
        :students="filteredStudents"
        :filters="filters"
        :loading="loading"
        @edit="openEditModal"
        @delete="handleDelete"
        @filter-change="handleFilterChange"
        @clear-filters="clearFilters"
      />
    </div>

    <div v-if="error" class="error-message">
      <span class="error-icon">⚠</span>
      {{ error }}
    </div>
    
    <StudentForm 
      ref="studentFormRef"
      :mode="formMode" 
      :student-data="selectedStudent" 
      @success="handleFormSuccess" 
      @close="handleFormClose" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { fetchStudents, deleteStudent } from '@/api/students';
import StudentForm from './StudentForm.vue';
import StudentTable from '@/components/StudentTable.vue';
import { useConfirm } from '@/composables/useConfirm';
import { useErrorHandler } from '@/composables/useErrorHandler';

const students = ref([]);
const error = ref('');
const loading = ref(false);
const formMode = ref('create');
const selectedStudent = ref(null);
const studentFormRef = ref(null);

const filters = ref({
  studentId: '',
  firstName: '',
  lastName: '',
  email: '',
  birthday: ''
});

const { confirm } = useConfirm();
const { handleError } = useErrorHandler();

const filteredStudents = computed(() => {
  return students.value.filter(student => {
    return (
      student.studentId.toString().toLowerCase().includes(filters.value.studentId.toLowerCase()) &&
      student.firstName.toLowerCase().includes(filters.value.firstName.toLowerCase()) &&
      student.lastName.toLowerCase().includes(filters.value.lastName.toLowerCase()) &&
      student.email.toLowerCase().includes(filters.value.email.toLowerCase()) &&
      student.birthday.includes(filters.value.birthday)
    );
  });
});

async function loadStudents() {
  error.value = '';
  loading.value = true;
  
  try {
    const { data } = await fetchStudents();
    students.value = data;
  } catch (e) {
    error.value = handleError(e, '載入學生資料失敗');
  } finally {
    loading.value = false;
  }
}

async function handleDelete(studentId) {
  const confirmed = await confirm('確定要刪除這名學生嗎？', '此操作無法復原。');
  if (!confirmed) return;
  
  error.value = '';
  loading.value = true;
  
  try {
    await deleteStudent(studentId);
    await loadStudents();
  } catch (e) {
    error.value = handleError(e, '刪除學生失敗');
  } finally {
    loading.value = false;
  }
}

async function openCreateModal() {
  formMode.value = 'create';
  selectedStudent.value = null;
  await nextTick();
  studentFormRef.value?.show();
}

async function openEditModal(student) {
  formMode.value = 'edit';
  selectedStudent.value = { 
    id: student.studentId, 
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    birthday: student.birthday 
  };
  await nextTick();
  studentFormRef.value?.show();
}

async function handleFormSuccess() {
  try {
    await nextTick();
    await loadStudents();
  } catch (e) {
    error.value = handleError(e, '更新資料失敗');
  }
}

function handleFormClose() {
  selectedStudent.value = null;
}

function handleFilterChange(newFilters) {
  filters.value = { ...filters.value, ...newFilters };
}

function clearFilters() {
  filters.value = {
    studentId: '',
    firstName: '',
    lastName: '',
    email: '',
    birthday: ''
  };
}

onMounted(() => {
  loadStudents();
});
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

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: #6c757d;
  gap: 16px;
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

.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  color: #721c24;
  margin-top: 16px;
}

.error-icon {
  font-size: 1.2em;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
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

.btn-icon {
  font-size: 16px;
  line-height: 1;
}
</style>
