<template>
  <div class="container">
    <header class="page-header">
      <h1 class="title">統計分析</h1>
    </header>

    <div class="stats-grid">
      <div class="stats-card">
        <h2 class="card-title">熱門課程排行</h2>
        <div class="card-content">
          <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
            <span>載入中...</span>
          </div>
          
          <div v-else-if="error" class="error-message">
            <span class="error-icon">⚠</span>
            {{ error }}
          </div>
          
          <div v-else class="popular-courses">
            <div class="limit-selector">
              <label for="limit">顯示前</label>
              <select id="limit" v-model="selectedLimit" @change="loadPopularCourses">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
              </select>
              <span>名課程</span>
            </div>
            
            <div class="courses-list">
              <div 
                v-for="(course, index) in popularCourses" 
                :key="course.courseId"
                class="course-item"
              >
                <div class="rank">
                  <span class="rank-number" :class="getRankClass(index)">{{ index + 1 }}</span>
                </div>
                <div class="course-info">
                  <h3 class="course-name">{{ course.name }}</h3>
                  <p class="course-details">
                    <span class="teacher">授課教師：{{ course.teacher?.name || '未指定教師' }}</span>
                    <span class="credits">學分：{{ course.credits }}</span>
                  </p>
                </div>
                <div class="enrollment-count">
                  <span class="count">{{ course.enrollmentCount }}</span>
                  <span class="label">人選課</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getPopularCourses } from '@/api/statistics';
import { useErrorHandler } from '@/composables/useErrorHandler';

const popularCourses = ref([]);
const error = ref('');
const loading = ref(false);
const selectedLimit = ref(10);

const { handleError } = useErrorHandler();

function getRankClass(index) {
  if (index === 0) return 'rank-gold';
  if (index === 1) return 'rank-silver';
  if (index === 2) return 'rank-bronze';
  return 'rank-default';
}

async function loadPopularCourses() {
  error.value = '';
  loading.value = true;
  
  try {
    const { data } = await getPopularCourses(selectedLimit.value);
    popularCourses.value = data;
  } catch (e) {
    error.value = handleError(e, '載入熱門課程資料失敗');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadPopularCourses();
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.title {
  margin: 0;
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  gap: 24px;
}

.stats-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  overflow: hidden;
}

.card-title {
  margin: 0;
  padding: 24px 24px 16px;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
  border-bottom: 1px solid #e9ecef;
}

.card-content {
  padding: 24px;
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

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  color: #721c24;
}

.error-icon {
  font-size: 1.2em;
}

.limit-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 14px;
  color: #495057;
}

.limit-selector select {
  padding: 4px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: white;
  font-size: 14px;
}

.courses-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.course-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.course-item:hover {
  background: #f1f3f4;
  border-color: #dee2e6;
}

.rank {
  flex-shrink: 0;
}

.rank-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 16px;
}

.rank-gold {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #b45309;
}

.rank-silver {
  background: linear-gradient(135deg, #c0c0c0, #e5e7eb);
  color: #374151;
}

.rank-bronze {
  background: linear-gradient(135deg, #cd7f32, #d97706);
  color: white;
}

.rank-default {
  background: #6c757d;
  color: white;
}

.course-info {
  flex: 1;
}

.course-name {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.course-details {
  margin: 0;
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #6c757d;
}

.enrollment-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.count {
  font-size: 24px;
  font-weight: 700;
  color: #007bff;
  line-height: 1;
}

.label {
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
  
  .course-item {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .course-details {
    flex-direction: column;
    gap: 4px;
  }
}
</style>