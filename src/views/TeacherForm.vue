<template>
    <Teleport to="body">
        <div v-if="visible" class="modal-backdrop" @click="handleBackdropClick">
            <div class="modal" @click.stop>
                <form @submit.prevent="handleSubmit">
                    <div class="modal-header">
                        <h2 class="modal-title">
                            {{ isEdit ? '編輯教師資訊' : '新增教師' }}
                        </h2>
                        <button type="button" class="btn-close" @click="handleCancel" aria-label="關閉">
                            <span>&times;</span>
                        </button>
                    </div>

                    <div class="modal-body">
                        <div class="form-grid">
                            <FormField label="姓名" :error="validationErrors.name" required class="full-width">
                                <input v-model.trim="form.name" type="text" class="form-control"
                                    :class="{ 'is-invalid': validationErrors.name }" placeholder="請輸入教師姓名"
                                    maxlength="100" required />
                            </FormField>

                            <FormField label="電子郵件" :error="validationErrors.email" required class="full-width">
                                <input v-model.trim="form.email" type="email" class="form-control"
                                    :class="{ 'is-invalid': validationErrors.email }" placeholder="請輸入電子郵件"
                                    maxlength="150" required />
                            </FormField>

                            <FormField label="年齡" :error="validationErrors.age" required hint="年齡範圍：18-100 歲">
                                <input v-model.number="form.age" type="number" class="form-control"
                                    :class="{ 'is-invalid': validationErrors.age }" placeholder="18-100" min="18"
                                    max="100" required />
                            </FormField>
                        </div>

                        <div v-if="error" class="error-message">
                            <span class="error-icon">⚠</span>
                            {{ error }}
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="handleCancel" :disabled="loading">
                            取消
                        </button>
                        <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
                            <span v-if="loading" class="loading-spinner"></span>
                            {{ loading ? '處理中...' : (isEdit ? '更新' : '建立') }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { createTeacher, updateTeacher } from '@/api/teachers';
import FormField from '@/components/FormField.vue';
import { useFormValidation } from '@/composables/useFormValidation';
import { useErrorHandler } from '@/composables/useErrorHandler';

const props = defineProps({
    mode: {
        type: String,
        default: 'create',
    },
    teacherData: {
        type: Object,
        default: () => null,
    }
});

const emit = defineEmits(['success', 'close']);

const visible = ref(false);
const form = ref({ name: '', email: '', age: '' });
const error = ref('');
const loading = ref(false);

const isEdit = computed(() => props.mode === 'edit');
const { handleError } = useErrorHandler();

const validationRules = {
    name: [
        { required: true, message: '教師姓名為必填項目' },
        { maxLength: 100, message: '教師姓名不能超過100個字符' }
    ],
    email: [
        { required: true, message: '電子郵件為必填項目' },
        { maxLength: 150, message: '電子郵件不能超過150個字符' },
        { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '請輸入有效的電子郵件格式' }
    ],
    age: [
        { required: true, message: '年齡為必填項目' },
        { min: 18, message: '教師年齡不能小於18歲' },
        { max: 100, message: '教師年齡不能超過100歲' }
    ]
};

const { validationErrors, validateForm, clearValidationErrors } = useFormValidation(form, validationRules);

const isFormValid = computed(() => {
    return form.value.name.trim() &&
        form.value.email.trim() &&
        form.value.age >= 18 &&
        form.value.age <= 100 &&
        Object.keys(validationErrors.value).length === 0;
});


watch(() => props.teacherData, (newData) => {
    if (newData) {
        form.value = {
            teacherId: newData.teacherId || '',
            name: newData.name || '',
            email: newData.email || '',
            age: newData.age || ''
        };
        clearValidationErrors();
    } else {
        resetForm();
    }
    error.value = '';
}, { immediate: true });

function resetForm() {
    form.value = { name: '', email: '', age: '' };
    error.value = '';
    clearValidationErrors();
}

function show() {
    visible.value = true;
}

function hide() {
    visible.value = false;
}

function handleBackdropClick() {
    if (!loading.value) {
        handleCancel();
    }
}

function handleCancel() {
    emit('close');
    hide();
    resetForm();
}

async function handleSubmit() {
    if (!validateForm()) {
        return;
    }

    error.value = '';
    loading.value = true;

    try {
        const teacherData = {
            name: form.value.name.trim(),
            email: form.value.email.trim(),
            age: form.value.age
        };

        if (isEdit.value && props.teacherData?.id) {
            await updateTeacher(props.teacherData.id, teacherData);
        } else {
            await createTeacher(teacherData);
        }

        emit('success');
        hide();
        resetForm();

    } catch (e) {
        error.value = handleError(e, `${isEdit.value ? '更新' : '新增'}教師失敗`);
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    // Component initialization if needed
});

defineExpose({
    show,
    hide
});
</script>

<style scoped>
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
    backdrop-filter: blur(2px);
}

.modal {
    background: white;
    border-radius: 12px;
    justify-self: anchor-center;
    top: 50px;
    width: 90vw;
    max-width: 500px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    animation: modalIn 0.2s ease-out;
}

@keyframes modalIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e9ecef;
    border-radius: 12px 12px 0 0;
    background: #f8f9fa;
}

.modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #2c3e50;
}

.btn-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 4px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #6c757d;
    transition: all 0.2s ease;
}

.btn-close:hover {
    background: #e9ecef;
    color: #495057;
}

.modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
}

.form-grid {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 20px;
}

.full-width {
    width: 100%;
}

.form-control {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    box-sizing: border-box;
}

.form-control:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.form-control.is-invalid {
    border-color: #dc3545;
}

.form-control.is-invalid:focus {
    border-color: #dc3545;
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
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

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid #e9ecef;
    background: #f8f9fa;
    border-radius: 0 0 12px 12px;
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
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-secondary {
    background: #6c757d;
    border-color: #6c757d;
    color: white;
}

.btn-secondary:hover:not(:disabled) {
    background: #5a6268;
    border-color: #545b62;
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

.btn-primary:disabled {
    background: #007bff;
    border-color: #007bff;
}

.loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>