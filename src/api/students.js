import http from './http'

export function fetchStudents(pageNumber, pageSize, searchKeyword) {
    const params = {};
    if (pageNumber !== undefined && pageSize !== undefined) {
        params.pageNumber = pageNumber;
        params.pageSize = pageSize;
    }
    if (searchKeyword !== undefined && searchKeyword !== null && searchKeyword.trim() !== '') {
        params.search = searchKeyword.trim();
    }
    return http.get('/students', { params });
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

export function getStudentCourses(id, pageNumber, pageSize) {
    const params = {};
    if (pageNumber !== undefined && pageSize !== undefined) {
        params.pageNumber = pageNumber;
        params.pageSize = pageSize;
    }
    return http.get(`/students/${id}/courses`, { params });
}
