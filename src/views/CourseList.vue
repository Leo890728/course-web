<template>
  <div class="container">
    <header class="page-header">
      <h1 class="title">課程列表</h1>
      <div class="toolbar">
        <button class="btn btn-primary" @click="openCreateModal" :disabled="loading">
          <span class="btn-icon">+</span>
          新增課程
        </button>
      </div>
    </header>

    <div v-if="loading && !courses.length" class="loading">
      <div class="loading-spinner"></div>
      <span>載入中...</span>
    </div>
    
    <div v-else class="table-container">
      <CourseTable
        :courses="filteredCourses"
        :filters="filters"
        :loading="loading"
        @edit="openEditModal"
        @delete="handleDelete"
        @view-students="viewStudents"
        @filter-change="handleFilterChange"
        @clear-filters="clearFilters"
      />
    </div>

    <div v-if="error" class="error-message">
      <span class="error-icon">⚠</span>
      {{ error }}
    </div>
    
    <CourseForm 
      ref="courseFormRef"
      :mode="formMode" 
      :course-data="selectedCourse" 
      @success="handleFormSuccess" 
      @close="handleFormClose" 
    />

    <StudentsModal
      :visible="showStudentsModal"
      :students="students"
      :loading="studentsLoading"
      :error="studentsError"
      @close="closeStudentsModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from 'vue';
import { fetchCourses, deleteCourse, getCourseStudents } from '@/api/courses';
import CourseForm from './CourseForm.vue';
import CourseTable from '@/components/CourseTable.vue';
import StudentsModal from '@/components/StudentsModal.vue';
import { useConfirm } from '@/composables/useConfirm';
import { useErrorHandler } from '@/composables/useErrorHandler';

const courses = ref([]);
const students = ref([]);
const error = ref('');
const studentsError = ref('');
const loading = ref(false);
const studentsLoading = ref(false);
const showStudentsModal = ref(false);
const formMode = ref('create');
const selectedCourse = ref(null);
const courseFormRef = ref(null);

const filters = ref({
  courseId: '',
  name: '',
  description: '',
  credits: '',
  teacher: ''
});

const { confirm } = useConfirm();
const { handleError } = useErrorHandler();

const filteredCourses = computed(() => {
  return courses.value.filter(course => {
    const teacherName = course.teacher?.name || '未指定';
    return (
      course.courseId.toString().toLowerCase().includes(filters.value.courseId.toLowerCase()) &&
      course.name.toLowerCase().includes(filters.value.name.toLowerCase()) &&
      course.description.toLowerCase().includes(filters.value.description.toLowerCase()) &&
      course.credits.toString().includes(filters.value.credits) &&
      teacherName.toLowerCase().includes(filters.value.teacher.toLowerCase())
    );
  });
});

async function loadCourses() {
  error.value = '';
  loading.value = true;
  
  try {
    const { data } = await fetchCourses();
    courses.value = data;
  } catch (e) {
    error.value = handleError(e, '載入課程資料失敗');
  } finally {
    loading.value = false;
  }
}

async function handleDelete(courseId) {
  const confirmed = await confirm('確定要刪除這門課程嗎？', '此操作無法復原。');
  if (!confirmed) return;
  
  error.value = '';
  loading.value = true;
  
  try {
    await deleteCourse(courseId);
    await loadCourses();
  } catch (e) {
    error.value = handleError(e, '刪除課程失敗');
  } finally {
    loading.value = false;
  }
}

async function openCreateModal() {
  formMode.value = 'create';
  selectedCourse.value = null;
  await nextTick();
  courseFormRef.value?.show();
}

async function openEditModal(course) {
  formMode.value = 'edit';
  selectedCourse.value = { ...course };
  await nextTick();
  courseFormRef.value?.show();
}

async function handleFormSuccess() {
  try {
    await nextTick();
    await loadCourses();
  } catch (e) {
    error.value = handleError(e, '更新資料失敗');
  }
}

function handleFormClose() {
  selectedCourse.value = null;
}

async function viewStudents(courseId) {
  studentsError.value = '';
  studentsLoading.value = true;
  showStudentsModal.value = true;
  
  try {
    const { data } = await getCourseStudents(courseId);
    students.value = data;
  } catch (e) {
    studentsError.value = handleError(e, '載入選課學生資料失敗');
  } finally {
    studentsLoading.value = false;
  }
}

function closeStudentsModal() {
  showStudentsModal.value = false;
  students.value = [];
  studentsError.value = '';
}

function handleFilterChange(newFilters) {
  filters.value = { ...filters.value, ...newFilters };
}

function clearFilters() {
  filters.value = {
    courseId: '',
    name: '',
    description: '',
    credits: '',
    teacher: ''
  };
}

onMounted(() => {
  loadCourses();
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