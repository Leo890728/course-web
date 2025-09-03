import http from './http'

export function getPopularCourses(limit = 10) {
    return http.get('/statistics/popular-courses', { params: { limit } });
}