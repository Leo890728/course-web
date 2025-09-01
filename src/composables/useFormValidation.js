import { ref, computed } from 'vue';

export function useFormValidation(form, rules) {
  const validationErrors = ref({});

  const validateField = (fieldName, value, fieldRules) => {
    const errors = [];
    
    for (const rule of fieldRules) {
      if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
        errors.push(rule.message || `${fieldName} 為必填項目`);
        break;
      }
      
      if (rule.minLength && value && value.length < rule.minLength) {
        errors.push(rule.message || `${fieldName} 長度不能少於 ${rule.minLength} 個字符`);
      }
      
      if (rule.maxLength && value && value.length > rule.maxLength) {
        errors.push(rule.message || `${fieldName} 長度不能超過 ${rule.maxLength} 個字符`);
      }
      
      if (rule.min && typeof value === 'number' && value < rule.min) {
        errors.push(rule.message || `${fieldName} 不能小於 ${rule.min}`);
      }
      
      if (rule.max && typeof value === 'number' && value > rule.max) {
        errors.push(rule.message || `${fieldName} 不能大於 ${rule.max}`);
      }
      
      if (rule.pattern && value && !rule.pattern.test(value)) {
        errors.push(rule.message || `${fieldName} 格式不正確`);
      }
    }
    
    return errors[0] || null;
  };

  const validateForm = () => {
    const errors = {};
    let hasErrors = false;

    for (const [fieldName, fieldRules] of Object.entries(rules)) {
      let value = form.value[fieldName];
      
      // Handle nested objects (like teacher.teacherId)
      if (fieldName === 'teacher' && form.value.teacher) {
        value = form.value.teacher.teacherId;
      }
      
      const error = validateField(fieldName, value, fieldRules);
      if (error) {
        errors[fieldName] = error;
        hasErrors = true;
      }
    }
    
    validationErrors.value = errors;
    return !hasErrors;
  };

  const validateSingleField = (fieldName) => {
    if (!rules[fieldName]) return;
    
    let value = form.value[fieldName];
    
    // Handle nested objects
    if (fieldName === 'teacher' && form.value.teacher) {
      value = form.value.teacher.teacherId;
    }
    
    const error = validateField(fieldName, value, rules[fieldName]);
    
    if (error) {
      validationErrors.value = { ...validationErrors.value, [fieldName]: error };
    } else {
      const { [fieldName]: removed, ...rest } = validationErrors.value;
      validationErrors.value = rest;
    }
  };

  const clearValidationErrors = () => {
    validationErrors.value = {};
  };

  const clearFieldError = (fieldName) => {
    const { [fieldName]: removed, ...rest } = validationErrors.value;
    validationErrors.value = rest;
  };

  const hasErrors = computed(() => Object.keys(validationErrors.value).length > 0);

  return {
    validationErrors,
    validateForm,
    validateSingleField,
    clearValidationErrors,
    clearFieldError,
    hasErrors
  };
}