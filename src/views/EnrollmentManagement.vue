<template>
  <div class="container">
    <header class="page-header">
      <h1 class="title">選課管理</h1>
    </header>

    <div class="filters">
      <select v-model="selectedCourse" class="filter-select">
        <option value="">選擇課程</option>
        <option v-for="course in courses" :key="course.courseId" :value="course.courseId">
          {{ course.name }} ({{ course.courseId }})
        </option>
      </select>
      <button class="btn btn-primary" @click="loadEnrolledStudents" :disabled="!selectedCourse || loading">
        查看選課學生
      </button>
    </div>

    <div v-if="loading" class="loading-placeholders">
      <div class="enrolled-section">
        <h2>已選課學生</h2>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>學號</th>
                <th>姓名</th>
                <th>電子郵件</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in 3" :key="`enrolled-${i}`">
                <td><span class="placeholder col-8"></span></td>
                <td><span class="placeholder col-10"></span></td>
                <td><span class="placeholder col-12"></span></td>
                <td><span class="placeholder col-6"></span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="available-section">
        <h2>可選課學生</h2>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>學號</th>
                <th>姓名</th>
                <th>電子郵件</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in 5" :key="`available-${i}`">
                <td><span class="placeholder col-8"></span></td>
                <td><span class="placeholder col-10"></span></td>
                <td><span class="placeholder col-12"></span></td>
                <td><span class="placeholder col-6"></span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else-if="selectedCourse && enrolledStudents.length > 0" class="enrolled-section">
      <h2>已選課學生</h2>
      <div class="table-container">
        <table class="table">
        <thead>
          <tr>
            <th>學號</th>
            <th>姓名</th>
            <th>電子郵件</th>
            <th>操作</th>
          </tr>
          <tr class="filter-row">
            <th><input v-model="enrolledFilters.studentId" @input="applyEnrolledFilters" placeholder="篩選學號" class="filter-input" /></th>
            <th><input v-model="enrolledFilters.name" @input="applyEnrolledFilters" placeholder="篩選姓名" class="filter-input" /></th>
            <th><input v-model="enrolledFilters.email" @input="applyEnrolledFilters" placeholder="篩選電子郵件" class="filter-input" /></th>
            <th><button @click="clearEnrolledFilters" class="clear-filters-btn">清除</button></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in filteredEnrolledStudents" :key="student.studentId">
            <td>{{ student.studentId }}</td>
            <td>{{ student.firstName }} {{ student.lastName }}</td>
            <td>{{ student.email }}</td>
            <td>
              <button 
                class="btn danger" 
                @click="removeEnrollment(student.studentId)" 
                :disabled="loading"
              >
                退選
              </button>
            </td>
          </tr>
        </tbody>
        </table>
      </div>
    </div>

    <div v-else-if="selectedCourse && enrolledStudents.length === 0 && !loading" class="no-data">
      此課程目前沒有學生選修
    </div>

    <div v-if="selectedCourse" class="available-section">
      <h2>可選課學生</h2>
      <div v-if="availableStudents.length > 0" class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>學號</th>
              <th>姓名</th>
              <th>電子郵件</th>
              <th>操作</th>
            </tr>
            <tr class="filter-row">
              <th><input v-model="availableFilters.studentId" @input="applyAvailableFilters" placeholder="篩選學號" class="filter-input" /></th>
              <th><input v-model="availableFilters.name" @input="applyAvailableFilters" placeholder="篩選姓名" class="filter-input" /></th>
              <th><input v-model="availableFilters.email" @input="applyAvailableFilters" placeholder="篩選電子郵件" class="filter-input" /></th>
              <th><button @click="clearAvailableFilters" class="clear-filters-btn">清除</button></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in filteredAvailableStudents" :key="student.studentId">
              <td>{{ student.studentId }}</td>
              <td>{{ student.firstName }} {{ student.lastName }}</td>
              <td>{{ student.email }}</td>
              <td>
                <button 
                  class="btn btn-primary" 
                  @click="addEnrollment(student.studentId)" 
                  :disabled="loading"
                >
                  選課
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="no-data">
        沒有可選課的學生
      </div>
    </div>

    <div v-if="error" class="error-message">
      <span class="error-icon">⚠</span>
      {{ error }}
    </div>
    
    <div v-if="success" class="success-message">
      <span class="success-icon">✓</span>
      {{ success }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { fetchCourses, getCourseStudents } from '@/api/courses';
import { fetchStudents, enrollStudentToCourse, removeStudentFromCourse } from '@/api/students';

const courses = ref([]);
const allStudents = ref([]);
const enrolledStudents = ref([]);
const selectedCourse = ref('');
const error = ref('');
const success = ref('');
const loading = ref(false);

const enrolledFilters = ref({
  studentId: '',
  name: '',
  email: ''
});

const availableFilters = ref({
  studentId: '',
  name: '',
  email: ''
});

const availableStudents = computed(() => {
  const enrolledIds = new Set(enrolledStudents.value.map(s => s.studentId));
  return allStudents.value.filter(student => !enrolledIds.has(student.studentId));
});

const filteredEnrolledStudents = computed(() => {
  return enrolledStudents.value.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`;
    return (
      student.studentId.toString().toLowerCase().includes(enrolledFilters.value.studentId.toLowerCase()) &&
      fullName.toLowerCase().includes(enrolledFilters.value.name.toLowerCase()) &&
      student.email.toLowerCase().includes(enrolledFilters.value.email.toLowerCase())
    );
  });
});

const filteredAvailableStudents = computed(() => {
  return availableStudents.value.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`;
    return (
      student.studentId.toString().toLowerCase().includes(availableFilters.value.studentId.toLowerCase()) &&
      fullName.toLowerCase().includes(availableFilters.value.name.toLowerCase()) &&
      student.email.toLowerCase().includes(availableFilters.value.email.toLowerCase())
    );
  });
});

async function loadCourses() {
  try {
    const { data } = await fetchCourses();
    courses.value = data;
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '載入課程資料失敗';
  }
}

async function loadAllStudents() {
  try {
    const { data } = await fetchStudents();
    allStudents.value = data;
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '載入學生資料失敗';
  }
}

async function loadEnrolledStudents() {
  if (!selectedCourse.value) return;
  
  error.value = '';
  success.value = '';
  loading.value = true;
  
  try {
    const { data } = await getCourseStudents(selectedCourse.value);
    enrolledStudents.value = data;
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '載入選課學生資料失敗';
  } finally {
    loading.value = false;
  }
}

async function addEnrollment(studentId) {
  if (!selectedCourse.value) return;
  
  error.value = '';
  success.value = '';
  loading.value = true;
  
  try {
    await enrollStudentToCourse(studentId, selectedCourse.value);
    success.value = '學生選課成功';
    await loadEnrolledStudents();
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '新增選課失敗';
  } finally {
    loading.value = false;
  }
}

async function removeEnrollment(studentId) {
  if (!selectedCourse.value) return;
  if (!confirm('確定要讓此學生退選嗎？')) return;
  
  error.value = '';
  success.value = '';
  loading.value = true;
  
  try {
    await removeStudentFromCourse(studentId, selectedCourse.value);
    success.value = '學生退選成功';
    await loadEnrolledStudents();
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '退選失敗';
  } finally {
    loading.value = false;
  }
}

function applyEnrolledFilters() {
  // 過濾邏輯已在 computed 中處理
}

function clearEnrolledFilters() {
  enrolledFilters.value = {
    studentId: '',
    name: '',
    email: ''
  };
}

function applyAvailableFilters() {
  // 過濾邏輯已在 computed 中處理
}

function clearAvailableFilters() {
  availableFilters.value = {
    studentId: '',
    name: '',
    email: ''
  };
}

onMounted(async () => {
  await Promise.all([loadCourses(), loadAllStudents()]);
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

.filters {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  min-width: 200px;
  background: white;
  font-size: 14px;
}

.enrolled-section, .available-section {
  margin-bottom: 32px;
}

.enrolled-section h2, .available-section h2 {
  margin-bottom: 16px;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
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
  margin-bottom: 16px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
}

.table th,
.table td {
  border: 1px solid #dee2e6;
  padding: 12px;
  text-align: left;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.table tbody tr:hover {
  background-color: #f8f9fa;
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

.btn.danger {
  border-color: #dc3545;
  color: #dc3545;
}

.btn.danger:hover:not(:disabled) {
  background: #f8d7da;
  border-color: #dc3545;
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

.no-data {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 48px 24px;
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

.success-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  color: #155724;
  margin-top: 16px;
}

.success-icon {
  font-size: 1.2em;
}

.filter-row th {
  padding: 8px;
  background-color: #f8f9fa;
}

.filter-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 13px;
}

.clear-filters-btn {
  padding: 6px 12px;
  font-size: 13px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  color: #495057;
  transition: all 0.2s ease;
}

.clear-filters-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.loading-placeholders {
  animation: pulse 1.5s ease-in-out infinite;
}

.placeholder {
  display: inline-block;
  min-height: 1em;
  vertical-align: middle;
  cursor: wait;
  background-color: currentColor;
  opacity: 0.5;
  border-radius: 0.25rem;
  animation: placeholder-glow 2s ease-in-out infinite alternate;
}

.placeholder.col-6 {
  width: 50%;
}

.placeholder.col-8 {
  width: 66.666667%;
}

.placeholder.col-10 {
  width: 83.333333%;
}

.placeholder.col-12 {
  width: 100%;
}

@keyframes placeholder-glow {
  50% {
    opacity: 0.2;
  }
}

.loading-placeholders .table th {
  background-color: #f8f9fa;
  color: #6c757d;
}

.loading-placeholders .table td {
  padding: 16px 12px;
}
</style>