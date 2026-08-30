import api from './api';

export const resumeService = {
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/resumes/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async listResumes() {
    const response = await api.get('/resumes/list/');
    return response.data.results || response.data;
  },

  async analyzeResume(resumeId) {
    const response = await api.post(`/resumes/${resumeId}/analyze/`);
    return response.data;
  },

  async getActiveAnalysis() {
    const response = await api.get('/resumes/active-analysis/');
    return response.data;
  },

  async activateResume(resumeId) {
    const response = await api.post(`/resumes/${resumeId}/activate/`);
    return response.data;
  },

  async deleteResume(resumeId) {
    const response = await api.delete(`/resumes/${resumeId}/`);
    return response.data;
  },
};
