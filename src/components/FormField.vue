<template>
  <div class="form-field" :class="{ 'has-error': hasError }">
    <label v-if="label" class="form-label">
      {{ label }}
      <span v-if="required" class="required-indicator">*</span>
    </label>
    
    <div class="form-input-wrapper">
      <slot></slot>
    </div>
    
    <div v-if="hasError" class="form-error">
      <span class="error-icon">⚠</span>
      <span class="error-text">{{ error }}</span>
    </div>
    
    <div v-else-if="hint" class="form-hint">
      {{ hint }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  }
});

const hasError = computed(() => !!props.error);
</script>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
  margin: 0;
}

.required-indicator {
  color: #dc3545;
  margin-left: 2px;
}

.form-input-wrapper {
  position: relative;
}

.form-error {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #dc3545;
  font-size: 13px;
}

.error-icon {
  font-size: 12px;
}

.error-text {
  line-height: 1.2;
}

.form-hint {
  color: #6c757d;
  font-size: 13px;
  line-height: 1.3;
}

.has-error .form-label {
  color: #dc3545;
}
</style>