import api from './api';

export const roadmapService = {
  async generateRoadmap(targetOrPayload) {
    let payload = {};
    if (typeof targetOrPayload === 'object' && targetOrPayload !== null) {
      payload = targetOrPayload;
    } else if (typeof targetOrPayload === 'number' || (typeof targetOrPayload === 'string' && /^\d+$/.test(targetOrPayload))) {
      payload = { target_role_id: targetOrPayload };
    } else if (typeof targetOrPayload === 'string') {
      payload = { custom_role: targetOrPayload };
    }
    const response = await api.post('/roadmap/generate/', payload);
    return response.data;
  },

  async getActiveRoadmap() {
    const response = await api.get('/roadmap/active/');
    return response.data;
  },

  async listRoadmaps() {
    const response = await api.get('/roadmap/list/');
    return response.data.results || response.data;
  },

  async getRoadmapDetail(id) {
    const response = await api.get(`/roadmap/${id}/`);
    return response.data;
  },

  async toggleMilestone(milestoneId) {
    const response = await api.post(`/roadmap/milestones/${milestoneId}/complete/`);
    return response.data;
  },

  async getResources(params = {}) {
    const response = await api.get('/roadmap/resources/', { params });
    return response.data.results || response.data;
  },

  async updateResourceProgress(resourceId, data) {
    const response = await api.post(`/roadmap/resources/${resourceId}/progress/`, data);
    return response.data;
  },
};
