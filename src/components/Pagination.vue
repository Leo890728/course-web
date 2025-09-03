<template>
  <div v-if="totalPages > 1" class="pagination-container">
    <div class="pagination-info">
      顯示 {{ startItem }} - {{ endItem }} 項，共 {{ totalCount }} 項
    </div>
    
    <div class="pagination-controls">
      <div class="page-size-selector">
        <label for="pageSize">每頁顯示：</label>
        <select 
          id="pageSize" 
          :value="pageSize" 
          @change="handlePageSizeChange"
          class="page-size-select"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>
      
      <div class="page-navigation">
        <button 
          class="page-btn page-btn-nav" 
          :disabled="currentPage === 0"
          @click="goToPage(0)"
          title="第一頁"
        >
          ««
        </button>
        
        <button 
          class="page-btn page-btn-nav" 
          :disabled="currentPage === 0"
          @click="goToPage(currentPage - 1)"
          title="上一頁"
        >
          ‹
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="page in visiblePages" 
            :key="page"
            :class="['page-btn', 'page-btn-number', { 'active': page - 1 === currentPage }]"
            @click="goToPage(page - 1)"
            :disabled="page - 1 === currentPage"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          class="page-btn page-btn-nav" 
          :disabled="currentPage === totalPages - 1"
          @click="goToPage(currentPage + 1)"
          title="下一頁"
        >
          ›
        </button>
        
        <button 
          class="page-btn page-btn-nav" 
          :disabled="currentPage === totalPages - 1"
          @click="goToPage(totalPages - 1)"
          title="最後一頁"
        >
          »»
        </button>
      </div>
      
      <div class="page-jump">
        <label for="pageJump">跳至第</label>
        <input 
          id="pageJump"
          type="number" 
          :min="1" 
          :max="totalPages"
          :value="currentPage + 1"
          @keyup.enter="handlePageJump"
          @blur="handlePageJump"
          class="page-jump-input"
        />
        <span>頁</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineEmits } from 'vue';

const props = defineProps({
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
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['page-change', 'page-size-change']);

const startItem = computed(() => {
  if (props.totalCount === 0) return 0;
  return props.currentPage * props.pageSize + 1;
});

const endItem = computed(() => {
  const end = (props.currentPage + 1) * props.pageSize;
  return Math.min(end, props.totalCount);
});

const visiblePages = computed(() => {
  const pages = [];
  const total = props.totalPages;
  const current = props.currentPage + 1; // Convert to 1-based
  
  if (total <= 7) {
    // Show all pages if total is 7 or less
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Show pages with ellipsis logic
    if (current <= 4) {
      // Show first 5 pages
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
    } else if (current >= total - 3) {
      // Show last 5 pages
      for (let i = total - 4; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Show current page and 2 pages on each side
      for (let i = current - 2; i <= current + 2; i++) {
        pages.push(i);
      }
    }
  }
  
  return pages;
});

function goToPage(page) {
  if (page !== props.currentPage && page >= 0 && page < props.totalPages && !props.loading) {
    emit('page-change', page);
  }
}

function handlePageSizeChange(event) {
  const newPageSize = parseInt(event.target.value);
  if (newPageSize !== props.pageSize) {
    emit('page-size-change', newPageSize);
  }
}

function handlePageJump(event) {
  const targetPage = parseInt(event.target.value) - 1; // Convert to 0-based
  if (targetPage >= 0 && targetPage < props.totalPages && targetPage !== props.currentPage) {
    goToPage(targetPage);
  } else {
    // Reset to current page if invalid
    event.target.value = props.currentPage + 1;
  }
}
</script>

<style scoped>
.pagination-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  align-items: center;
}

.pagination-info {
  font-size: 14px;
  color: #6c757d;
  text-align: center;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #495057;
}

.page-size-select {
  padding: 4px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  color: #495057;
  cursor: pointer;
}

.page-size-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.page-navigation {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-numbers {
  display: flex;
  gap: 2px;
  margin: 0 8px;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  padding: 4px 8px;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.page-btn:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.page-btn-nav {
  font-weight: bold;
}

.page-btn-number.active {
  background: #007bff;
  border-color: #007bff;
  color: white;
}

.page-btn-number.active:hover {
  background: #0056b3;
  border-color: #004085;
}

.page-jump {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #495057;
}

.page-jump-input {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  text-align: center;
  background: white;
}

.page-jump-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

@media (max-width: 768px) {
  .pagination-controls {
    flex-direction: column;
    gap: 12px;
  }
  
  .page-navigation {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .page-numbers {
    order: 1;
    margin: 8px 0;
  }
}
</style>