import http from './http'

export function fetchCourses(pageNumber, pageSize) {
    const params = {};
    if (pageNumber !== undefined && pageSize !== undefined) {
        params.pageNumber = pageNumber;
        params.pageSize = pageSize;
    }
    return http.get('/courses', { params });
}

export function getCourse(id) {
    return http.get(`/courses/${id}`)
}

export function createCourse(data) {
    return http.post('/courses', data)
}

export function updateCourse(id, data) {
    return http.put(`/courses/${id}`, data)
}

export function deleteCourse(id) {
    return http.delete(`/courses/${id}`)
}

export function getCourseStudents(id, pageNumber, pageSize) {
    const params = {};
    if (pageNumber !== undefined && pageSize !== undefined) {
        params.pageNumber = pageNumber;
        params.pageSize = pageSize;
    }
    return http.get(`/courses/${id}/Students`, { params });
}