import http from './http'

export function fetchTeachers(pageNumber, pageSize, searchKeyword) {
    const params = {};
    if (pageNumber !== undefined && pageSize !== undefined) {
        params.pageNumber = pageNumber;
        params.pageSize = pageSize;
    }
    if (searchKeyword !== undefined && searchKeyword !== null && searchKeyword.trim() !== '') {
        params.search = searchKeyword.trim();
    }
    return http.get('/teachers', { params });
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
