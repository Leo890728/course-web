<template>
  <div class="popular-courses-card">
    <div class="card-header">
      <h2 class="card-title">🔥 最熱門課程 TOP 10</h2>
      <p class="card-subtitle">依選課人數排序</p>
    </div>
    
    <div class="card-body">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>載入中...</span>
      </div>
      
      <div v-else-if="error" class="error-state">
        <span class="error-icon">⚠</span>
        <span>{{ error }}</span>
      </div>
      
      <div v-else-if="courses.length > 0" class="courses-list">
        <div v-for="(course, index) in courses" :key="course.courseId" class="course-item">
          <div class="rank-badge" :class="getRankClass(index)">
            {{ index + 1 }}
          </div>
          <div class="course-info">
            <div class="course-name">{{ course.name }}</div>
            <div class="course-details">
              <span class="course-id">{{ course.courseId }}</span>
              <span class="course-credits">{{ course.credits }} 學分</span>
              <span class="teacher-name">{{ course.teacher?.name || '未指定教師' }}</span>
            </div>
            <div class="course-description" v-if="course.description">
              {{ course.description }}
            </div>
          </div>
          <div class="enrollment-stats">
            <div class="enrollment-count">
              {{ course.enrollmentCount }}
            </div>
            <div class="enrollment-label">選課人數</div>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-state">
        <div class="empty-icon">📚</div>
        <p>目前沒有課程資料</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
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
  }
});

function getRankClass(index) {
  if (index === 0) return 'gold';
  if (index === 1) return 'silver';
  if (index === 2) return 'bronze';
  return 'regular';
}
</script>

<style scoped>
.popular-courses-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 24px;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px 24px;
}

.card-title {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.card-subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.card-body {
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
  border-top: 3px solid #667eea;
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

.courses-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.course-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.course-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.rank-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  color: white;
  flex-shrink: 0;
}

.rank-badge.gold {
  background: linear-gradient(135deg, #ffd700, #ffa500);
}

.rank-badge.silver {
  background: linear-gradient(135deg, #c0c0c0, #a9a9a9);
}

.rank-badge.bronze {
  background: linear-gradient(135deg, #cd7f32, #b8860b);
}

.rank-badge.regular {
  background: linear-gradient(135deg, #6c757d, #495057);
}

.course-info {
  flex: 1;
  min-width: 0;
}

.course-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 8px;
}

.course-details {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.course-id {
  font-family: monospace;
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
  color: #495057;
}

.course-credits {
  color: #6c757d;
}

.teacher-name {
  color: #007bff;
  font-weight: 500;
}

.course-description {
  font-size: 0.9rem;
  color: #6c757d;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.enrollment-stats {
  text-align: center;
  flex-shrink: 0;
}

.enrollment-count {
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 4px;
}

.enrollment-label {
  font-size: 0.8rem;
  color: #6c757d;
  white-space: nowrap;
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

@media (max-width: 768px) {
  .course-item {
    flex-direction: column;
    gap: 12px;
  }
  
  .course-details {
    flex-direction: column;
    gap: 4px;
  }
  
  .enrollment-stats {
    text-align: left;
  }
}
</style>