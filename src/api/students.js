import http from './http'

export function fetchStudents() {
    return http.get('/students')
}

export function getStudent(id) {
    return http.get(`/students/${id}`)
}

export function createStudent(data) {
    return http.post('/students', data)
}

export function updateStudent(id, data) {
    return http.put(`/students/${id}`, data)
}

export function deleteStudent(id) {
    return http.delete(`/students/${id}`)
}

export function enrollStudentToCourse(studentId, courseId) {
    return http.post(`/students/${studentId}/courses/${courseId}`)
}

export function removeStudentFromCourse(studentId, courseId) {
    return http.delete(`/students/${studentId}/courses/${courseId}`)
}
