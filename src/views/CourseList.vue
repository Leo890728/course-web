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
    
    
    <div v-if="!loading" class="table-container">
      <CourseTable
        :courses="courses"
        :loading="loading"
        @edit="openEditModal"
        @delete="handleDelete"
        @view-students="viewStudents"
        @search="handleSearch"
      />
      
      <Pagination
        :current-page="pagination.currentPage"
        :total-pages="pagination.totalPages"
        :total-count="pagination.totalCount"
        :page-size="pagination.pageSize"
        :loading="loading"
        @page-change="handlePageChange"
        @page-size-change="handlePageSizeChange"
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
      :current-page="studentsPagination.currentPage"
      :total-pages="studentsPagination.totalPages"
      :total-count="studentsPagination.totalCount"
      :page-size="studentsPagination.pageSize"
      @close="closeStudentsModal"
      @page-change="handleStudentsPageChange"
      @page-size-change="handleStudentsPageSizeChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { fetchCourses, deleteCourse, getCourseStudents } from '@/api/courses';
import CourseForm from './CourseForm.vue';
import CourseTable from '@/components/CourseTable.vue';
import StudentsModal from '@/components/StudentsModal.vue';
import Pagination from '@/components/Pagination.vue';
import { useConfirm } from '@/composables/useConfirm';
import { useErrorHandler } from '@/composables/useErrorHandler';

const courses = ref([]);
const students = ref([]);
const error = ref('');
const studentsError = ref('');
const loading = ref(false);
const studentsLoading = ref(false);
const showStudentsModal = ref(false);
const currentCourseId = ref(null);

const studentsPagination = ref({
  currentPage: 0,
  totalPages: 0,
  totalCount: 0,
  pageSize: 10
});
const formMode = ref('create');
const selectedCourse = ref(null);
const courseFormRef = ref(null);

const pagination = ref({
  currentPage: 0,
  totalPages: 0,
  totalCount: 0,
  pageSize: 20
});

const searchQuery = ref('');

const { confirm } = useConfirm();
const { handleError } = useErrorHandler();

async function loadCourses() {
  error.value = '';
  loading.value = true;
  
  try {
    const response = await fetchCourses(
      pagination.value.currentPage, 
      pagination.value.pageSize,
      searchQuery.value
    );
    courses.value = response.data;
    
    // Extract pagination info from headers
    pagination.value.totalPages = parseInt(response.headers['x-total-pages']) || 0;
    pagination.value.totalCount = parseInt(response.headers['x-total-count']) || 0;
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
  currentCourseId.value = courseId;
  studentsError.value = '';
  studentsPagination.value.currentPage = 0; // Reset to first page
  showStudentsModal.value = true;
  await loadStudents();
}

async function loadStudents() {
  if (!currentCourseId.value) return;
  
  studentsLoading.value = true;
  
  try {
    const response = await getCourseStudents(
      currentCourseId.value,
      studentsPagination.value.currentPage,
      studentsPagination.value.pageSize
    );
    students.value = response.data;
    
    // Extract pagination info from headers
    studentsPagination.value.totalPages = parseInt(response.headers['x-total-pages']) || 0;
    studentsPagination.value.totalCount = parseInt(response.headers['x-total-count']) || 0;
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
  currentCourseId.value = null;
}

function handleStudentsPageChange(page) {
  studentsPagination.value.currentPage = page;
  loadStudents();
}

function handleStudentsPageSizeChange(pageSize) {
  studentsPagination.value.pageSize = pageSize;
  studentsPagination.value.currentPage = 0; // Reset to first page when changing page size
  loadStudents();
}

function handleSearch(query) {
  searchQuery.value = query;
  pagination.value.currentPage = 0; // Reset to first page when searching
  loadCourses();
}

function handlePageChange(page) {
  pagination.value.currentPage = page;
  loadCourses();
}

function handlePageSizeChange(pageSize) {
  pagination.value.pageSize = pageSize;
  pagination.value.currentPage = 0; // Reset to first page when changing page size
  loadCourses();
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