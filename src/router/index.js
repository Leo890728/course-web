import { createRouter, createWebHistory } from 'vue-router'
import StudentList from "@/views/StudentList.vue";
import TeacherList from "@/views/TeacherList.vue";
import CourseList from "@/views/CourseList.vue";
import EnrollmentManagement from "@/views/EnrollmentManagement.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/students' },
    { path: '/students', name: 'students', component: StudentList },
    { path: '/teachers', name: 'teachers', component: TeacherList },
    { path: '/courses', name: 'courses', component: CourseList },
    { path: '/enrollment', name: 'enrollment', component: EnrollmentManagement },
  ],
})

export default router
