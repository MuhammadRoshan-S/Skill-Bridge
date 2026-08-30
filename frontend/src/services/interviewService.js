import api from './api';

export const interviewService = {
  async createSession(targetRoleId, sessionType = 'technical', numQuestions = 5) {
    const response = await api.post('/interviews/create-session/', {
      target_role_id: targetRoleId,
      session_type: sessionType,
      num_questions: numQuestions,
    });
    return response.data;
  },

  async listSessions() {
    const response = await api.get('/interviews/sessions/');
    return response.data.results || response.data;
  },

  async getSessionDetail(id) {
    const response = await api.get(`/interviews/sessions/${id}/`);
    return response.data;
  },

  async submitAnswer(questionId, userAnswer) {
    const response = await api.post('/interviews/submit-answer/', {
      question_id: questionId,
      user_answer: userAnswer,
    });
    return response.data;
  },
};
