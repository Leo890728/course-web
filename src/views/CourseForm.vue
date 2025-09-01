<template>
  <div class="modal fade" id="courseFormModal" tabindex="-1" aria-labelledby="courseFormModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="courseFormModalLabel">{{ isEdit ? '編輯課程資訊' : '新增課程' }}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submit">
            <div class="mb-3">
              <label class="form-label">課程名稱</label>
              <input v-model.trim="form.name" class="form-control" required maxlength="200" />
            </div>

            <div class="mb-3">
              <label class="form-label">描述</label>
              <textarea v-model.trim="form.description" class="form-control" rows="3" maxlength="500"></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label">學分</label>
              <input v-model.number="form.credits" type="number" class="form-control" required min="1" max="10" />
            </div>

            <div class="mb-3">
              <label class="form-label">授課教師</label>
              <select v-model="form.teacher.teacherId" class="form-control teacher-select" required>
                <option value="">請選擇教師</option>
                <option v-for="teacher in teachers" :key="teacher.teacherId" :value="String(teacher.teacherId)">
                  {{ teacher.name }}
                </option>
              </select>
            </div>

            <div v-if="error" class="alert alert-danger">{{ error }}</div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="cancel">取消</button>
          <button type="button" class="btn btn-primary" @click="submit" :disabled="loading">
            {{ loading ? '處理中...' : (isEdit ? '更新' : '建立') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { Modal } from 'bootstrap';
import { createCourse, updateCourse } from '@/api/courses';
import { fetchTeachers } from '@/api/teachers';

const props = defineProps({
  mode: {
    type: String,
    default: 'create'
  },
  courseData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['success', 'close']);

const form = ref({
  courseId: 0,
  name: '',
  description: '',
  credits: 1,
  teacher: {
    teacherId: ''
  }
});

const teachers = ref([]);
const error = ref('');
const loading = ref(false);
const modal = ref(null);

const isEdit = computed(() => props.mode === 'edit');

async function loadTeachers() {
  try {
    const { data } = await fetchTeachers();
    console.log('Teachers data loaded:', data);
    teachers.value = data;
  } catch (e) {
    console.error('載入教師列表失敗:', e);
    error.value = '載入教師列表失敗';
  }
}

function resetForm() {
  form.value = {
    courseId: 0,
    name: '',
    description: '',
    credits: 1,
    teacher: {
      teacherId: ''
    }
  };
  error.value = '';
  console.log('Form reset, teacherId set to:', form.value.teacher.teacherId);
}

function show() {
  if (modal.value) {
    modal.value.show();
  }
}

function hide() {
  if (modal.value) {
    modal.value.hide();
  }
}

async function submit() {
  error.value = '';
  loading.value = true;

  try {
    const courseData = {
      name: form.value.name,
      description: form.value.description,
      credits: form.value.credits,
      teacher: {
        teacherId: parseInt(form.value.teacher.teacherId)
      }
    };

    if (isEdit.value) {
      await updateCourse(form.value.courseId, courseData);
    } else {
      await createCourse(courseData);
    }

    emit('success');
    hide();
    resetForm();
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || `${isEdit.value ? '更新' : '新增'}課程失敗`;
  } finally {
    loading.value = false;
  }
}

function cancel() {
  emit('close');
  resetForm();
}

watch(() => props.courseData, (newData) => {
  if (newData && props.mode === 'edit') {
    console.log('Setting form data for edit:', newData);
    form.value = {
      courseId: newData.courseId,
      name: newData.name || '',
      description: newData.description || '',
      credits: newData.credits || 1,
      teacher: {
        teacherId: newData.teacher?.teacherId ? String(newData.teacher.teacherId) : ''
      }
    };
    console.log('Form teacher ID set to:', form.value.teacher.teacherId);
  } else {
    resetForm();
  }
}, { immediate: true });

watch(() => props.mode, () => {
  if (props.mode === 'create') {
    resetForm();
  }
});

onMounted(async () => {
  const modalElement = document.getElementById('courseFormModal');
  if (modalElement) {
    modal.value = new Modal(modalElement);
    
    modalElement.addEventListener('hidden.bs.modal', () => {
      emit('close');
      resetForm();
    });
  }
  
  await loadTeachers();
});

defineExpose({
  show,
  hide
});
</script>

<style scoped>
.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-label {
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
}

.mb-3 {
  margin-bottom: 16px;
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
}

select.form-control {
  height: 40px;
}

.teacher-select {
  color: #333 !important;
  background-color: white !important;
}

.teacher-select option {
  color: #333 !important;
  background-color: white !important;
}

.alert {
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.alert-danger {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}
</style>