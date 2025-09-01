<template>
  <div class="container">
    <header class="page-header">
      <h1 class="title">教師列表</h1>
      <div class="toolbar">
        <button class="btn btn-primary" @click="openCreateModal" :disabled="loading">
          <span class="btn-icon">+</span>
          新增教師
        </button>
      </div>
    </header>

    <div v-if="loading && !teachers.length" class="loading">
      <div class="loading-spinner"></div>
      <span>載入中...</span>
    </div>
    
    <div v-else class="table-container">
      <TeacherTable
        :teachers="filteredTeachers"
        :filters="filters"
        :loading="loading"
        @edit="openEditModal"
        @delete="handleDelete"
        @view-courses="viewCourses"
        @filter-change="handleFilterChange"
        @clear-filters="clearFilters"
      />
    </div>

    <div v-if="error" class="error-message">
      <span class="error-icon">⚠</span>
      {{ error }}
    </div>
    
    <TeacherForm 
      ref="teacherFormRef"
      :mode="formMode" 
      :teacher-data="selectedTeacher" 
      @success="handleFormSuccess" 
      @close="handleFormClose" 
    />

    <TeacherCoursesModal
      :visible="showCoursesModal"
      :courses="courses"
      :loading="coursesLoading"
      :error="coursesError"
      @close="closeCoursesModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { fetchTeachers, deleteTeacher, getTeacherCourses } from '@/api/teachers.js';
import TeacherForm from './TeacherForm.vue';
import TeacherTable from '@/components/TeacherTable.vue';
import TeacherCoursesModal from '@/components/TeacherCoursesModal.vue';
import { useConfirm } from '@/composables/useConfirm';
import { useErrorHandler } from '@/composables/useErrorHandler';

const teachers = ref([]);
const courses = ref([]);
const error = ref('');
const coursesError = ref('');
const loading = ref(false);
const coursesLoading = ref(false);
const showCoursesModal = ref(false);
const formMode = ref('create');
const selectedTeacher = ref(null);
const teacherFormRef = ref(null);

const filters = ref({
  teacherId: '',
  name: '',
  email: '',
  age: ''
});

const { confirm } = useConfirm();
const { handleError } = useErrorHandler();

const filteredTeachers = computed(() => {
  return teachers.value.filter(teacher => {
    return (
      teacher.teacherId.toString().toLowerCase().includes(filters.value.teacherId.toLowerCase()) &&
      teacher.name.toLowerCase().includes(filters.value.name.toLowerCase()) &&
      teacher.email.toLowerCase().includes(filters.value.email.toLowerCase()) &&
      teacher.age.toString().includes(filters.value.age)
    );
  });
});

async function loadTeachers() {
  error.value = '';
  loading.value = true;
  
  try {
    const { data } = await fetchTeachers();
    teachers.value = data;
  } catch (e) {
    error.value = handleError(e, '載入教師資料失敗');
  } finally {
    loading.value = false;
  }
}

async function handleDelete(teacherId) {
  const confirmed = await confirm('確定要刪除這名教師嗎？', '此操作無法復原。');
  if (!confirmed) return;
  
  error.value = '';
  loading.value = true;
  
  try {
    await deleteTeacher(teacherId);
    await loadTeachers();
  } catch (e) {
    error.value = handleError(e, '刪除教師失敗');
  } finally {
    loading.value = false;
  }
}

async function openCreateModal() {
  formMode.value = 'create';
  selectedTeacher.value = null;
  await nextTick();
  teacherFormRef.value?.show();
}

async function openEditModal(teacher) {
  formMode.value = 'edit';
  selectedTeacher.value = { 
    id: teacher.teacherId, 
    name: teacher.name,
    email: teacher.email,
    age: teacher.age 
  };
  await nextTick();
  teacherFormRef.value?.show();
}

async function handleFormSuccess() {
  try {
    await nextTick();
    await loadTeachers();
  } catch (e) {
    error.value = handleError(e, '更新資料失敗');
  }
}

function handleFormClose() {
  selectedTeacher.value = null;
}

function handleFilterChange(newFilters) {
  filters.value = { ...filters.value, ...newFilters };
}

function clearFilters() {
  filters.value = {
    teacherId: '',
    name: '',
    email: '',
    age: ''
  };
}

async function viewCourses(teacherId) {
  coursesError.value = '';
  coursesLoading.value = true;
  showCoursesModal.value = true;
  
  try {
    const { data } = await getTeacherCourses(teacherId);
    courses.value = data;
  } catch (e) {
    coursesError.value = handleError(e, '載入教師課程資料失敗');
  } finally {
    coursesLoading.value = false;
  }
}

function closeCoursesModal() {
  showCoursesModal.value = false;
  courses.value = [];
  coursesError.value = '';
}

onMounted(() => {
  loadTeachers();
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
