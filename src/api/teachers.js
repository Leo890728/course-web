import http from './http'

export function fetchTeachers() {
    return http.get('/teachers')
}

export function getTeacher(id) {
    return http.get(`/teachers/${id}`)
}

export function createTeacher(data) {
    return http.post('/teachers', data)
}

export function updateTeacher(id, data) {
    return http.put(`/teachers/${id}`, data)
}

export function deleteTeacher(id) {
    return http.delete(`/teachers/${id}`)
}

export function getTeacherCourses(id) {
    return http.get(`/teachers/${id}/courses`)
}
