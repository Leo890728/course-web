import { createRouter, createWebHistory } from 'vue-router'
import StudentList from "@/views/StudentList.vue";
import TeacherList from "@/views/TeacherList.vue";
import CourseList from "@/views/CourseList.vue";
import EnrollmentManagement from "@/views/EnrollmentManagement.vue";
import DataInitialization from "@/views/DataInitialization.vue";
import Statistics from "@/views/Statistics.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/students' },
    { path: '/students', name: 'students', component: StudentList },
    { path: '/teachers', name: 'teachers', component: TeacherList },
    { path: '/courses', name: 'courses', component: CourseList },
    { path: '/enrollment', name: 'enrollment', component: EnrollmentManagement },
    { path: '/statistics', name: 'statistics', component: Statistics },
    { path: '/data-init', name: 'data-init', component: DataInitialization },
  ],
})

export default router
