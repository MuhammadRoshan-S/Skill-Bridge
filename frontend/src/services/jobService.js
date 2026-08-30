import api from './api';

export const jobService = {
  async getRecommendations(params = {}) {
    const response = await api.get('/jobs/recommendations/', { params });
    return response.data;
  },

  async generateRecommendations(params = {}) {
    const response = await api.post('/jobs/recommendations/', params);
    return response.data;
  },

  async getJobDetail(id) {
    const response = await api.get(`/jobs/${id}/`);
    return response.data;
  },
};
