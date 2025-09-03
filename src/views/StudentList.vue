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
        :students="students"
        :loading="loading"
        @edit="openEditModal"
        @delete="handleDelete"
        @view-courses="viewCourses"
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
    
    <StudentForm 
      ref="studentFormRef"
      :mode="formMode" 
      :student-data="selectedStudent" 
      @success="handleFormSuccess" 
      @close="handleFormClose" 
    />

    <StudentCoursesModal
      :visible="showCoursesModal"
      :courses="courses"
      :loading="coursesLoading"
      :error="coursesError"
      :current-page="coursesPagination.currentPage"
      :total-pages="coursesPagination.totalPages"
      :total-count="coursesPagination.totalCount"
      :page-size="coursesPagination.pageSize"
      @close="closeCoursesModal"
      @page-change="handleCoursesPageChange"
      @page-size-change="handleCoursesPageSizeChange"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { fetchStudents, deleteStudent, getStudentCourses } from '@/api/students';
import StudentForm from './StudentForm.vue';
import StudentTable from '@/components/StudentTable.vue';
import StudentCoursesModal from '@/components/StudentCoursesModal.vue';
import Pagination from '@/components/Pagination.vue';
import { useConfirm } from '@/composables/useConfirm';
import { useErrorHandler } from '@/composables/useErrorHandler';

const students = ref([]);
const courses = ref([]);
const error = ref('');
const coursesError = ref('');
const loading = ref(false);
const coursesLoading = ref(false);
const showCoursesModal = ref(false);
const currentStudentId = ref(null);

const coursesPagination = ref({
  currentPage: 0,
  totalPages: 0,
  totalCount: 0,
  pageSize: 10
});
const formMode = ref('create');
const selectedStudent = ref(null);
const studentFormRef = ref(null);

const pagination = ref({
  currentPage: 0,
  totalPages: 0,
  totalCount: 0,
  pageSize: 20
});

const searchQuery = ref('');

const { confirm } = useConfirm();
const { handleError } = useErrorHandler();

async function loadStudents() {
  error.value = '';
  loading.value = true;
  
  try {
    const response = await fetchStudents(pagination.value.currentPage, pagination.value.pageSize);
    students.value = response.data;
    
    // Extract pagination info from headers
    pagination.value.totalPages = parseInt(response.headers['x-total-pages']) || 0;
    pagination.value.totalCount = parseInt(response.headers['x-total-count']) || 0;
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

function handleSearch(query) {
  searchQuery.value = query;
  pagination.value.currentPage = 0; // Reset to first page when searching
  loadStudents();
}

function handlePageChange(page) {
  pagination.value.currentPage = page;
  loadStudents();
}

function handlePageSizeChange(pageSize) {
  pagination.value.pageSize = pageSize;
  pagination.value.currentPage = 0; // Reset to first page when changing page size
  loadStudents();
}

async function viewCourses(studentId) {
  currentStudentId.value = studentId;
  coursesError.value = '';
  coursesPagination.value.currentPage = 0; // Reset to first page
  showCoursesModal.value = true;
  await loadCourses();
}

async function loadCourses() {
  if (!currentStudentId.value) return;
  
  coursesLoading.value = true;
  
  try {
    const response = await getStudentCourses(
      currentStudentId.value,
      coursesPagination.value.currentPage,
      coursesPagination.value.pageSize
    );
    courses.value = response.data;
    
    // Extract pagination info from headers
    coursesPagination.value.totalPages = parseInt(response.headers['x-total-pages']) || 0;
    coursesPagination.value.totalCount = parseInt(response.headers['x-total-count']) || 0;
  } catch (e) {
    coursesError.value = handleError(e, '載入學生選課資料失敗');
  } finally {
    coursesLoading.value = false;
  }
}

function closeCoursesModal() {
  showCoursesModal.value = false;
  courses.value = [];
  coursesError.value = '';
  currentStudentId.value = null;
}

function handleCoursesPageChange(page) {
  coursesPagination.value.currentPage = page;
  loadCourses();
}

function handleCoursesPageSizeChange(pageSize) {
  coursesPagination.value.pageSize = pageSize;
  coursesPagination.value.currentPage = 0; // Reset to first page when changing page size
  loadCourses();
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
