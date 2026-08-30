import api from './api';

export const skillService = {
  async getSkills(params = {}) {
    const response = await api.get('/skills/list/', { params });
    return response.data.results || response.data;
  },

  async getCategories() {
    const response = await api.get('/skills/categories/');
    return response.data.results || response.data;
  },

  async getJobRoles(params = {}) {
    const response = await api.get('/skills/roles/', { params });
    return response.data.results || response.data;
  },

  async getJobRoleDetail(id) {
    const response = await api.get(`/skills/roles/${id}/`);
    return response.data;
  },

  async getUserSkills() {
    const response = await api.get('/skills/my-skills/');
    return response.data.results || response.data;
  },

  async addUserSkill(skillId, proficiencyLevel = 'intermediate') {
    const response = await api.post('/skills/my-skills/', {
      skill: skillId,
      proficiency_level: proficiencyLevel,
      source: 'manual',
    });
    return response.data;
  },

  async deleteUserSkill(id) {
    const response = await api.delete(`/skills/my-skills/${id}/`);
    return response.data;
  },

  async runGapAnalysis(targetOrPayload) {
    let payload = {};
    if (typeof targetOrPayload === 'object' && targetOrPayload !== null) {
      payload = targetOrPayload;
    } else if (typeof targetOrPayload === 'number' || (typeof targetOrPayload === 'string' && /^\d+$/.test(targetOrPayload))) {
      payload = { target_role_id: targetOrPayload };
    } else if (typeof targetOrPayload === 'string') {
      payload = { custom_role: targetOrPayload };
    }
    const response = await api.post('/skills/gap-analysis/', payload);
    return response.data;
  },

  async getLatestGapAnalysis() {
    const response = await api.get('/skills/gap-analysis/latest/');
    return response.data;
  },
};
