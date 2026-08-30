import api from './api';

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },

  async login(username, password) {
    const response = await api.post('/auth/login/', { username, password });
    const { access, refresh } = response.data;
    localStorage.setItem('skillbridge_access_token', access);
    localStorage.setItem('skillbridge_refresh_token', refresh);
    
    // Fetch profile
    const profile = await this.getProfile();
    localStorage.setItem('skillbridge_user', JSON.stringify(profile));
    return profile;
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me/');
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/profile/');
    return response.data;
  },

  async updateProfile(profileData) {
    const headers = profileData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await api.put('/profile/', profileData, { headers });
    localStorage.setItem('skillbridge_user', JSON.stringify(response.data));
    return response.data;
  },

  logout() {
    localStorage.removeItem('skillbridge_access_token');
    localStorage.removeItem('skillbridge_refresh_token');
    localStorage.removeItem('skillbridge_user');
  },
};
