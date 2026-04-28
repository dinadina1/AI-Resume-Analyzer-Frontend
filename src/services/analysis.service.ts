import api from './api';

export class AnalysisService {
  static async getReportsByResume(resumeId: string) {
    const { data } = await api.get(`/analysis/resume/${resumeId}`);
    return data.data;
  }

  static async getReportById(reportId: string) {
    const { data } = await api.get(`/analysis/${reportId}`);
    return data.data;
  }
}

export class JdService {
  static async matchJd(payload: { resumeId: string; title: string; content: string }) {
    const { data } = await api.post('/job-descriptions/match', payload);
    return data.data;
  }

  static async getMyJds() {
    const { data } = await api.get('/job-descriptions');
    return data.data;
  }

  static async getMyMatches() {
    const { data } = await api.get('/job-descriptions/matches');
    return data.data;
  }

  static async getMatchById(matchId: string) {
    const { data } = await api.get(`/job-descriptions/matches/${matchId}`);
    return data.data;
  }
}

export class SuggestionService {
  static async getSuggestions(resumeId: string) {
    const { data } = await api.get(`/suggestions/resume/${resumeId}`);
    return data.data;
  }
}

export class LlmService {
  static async getConfig() {
    const { data } = await api.get('/llm/config');
    return data.data;
  }

  static async saveConfig(
    apiKey: string,
    isEnabled: boolean,
    provider: string,
    model: string,
    baseUrl?: string
  ) {
    const { data } = await api.post('/llm/config', { apiKey, isEnabled, provider, model, baseUrl });
    return data.data;
  }

  static async toggleLlm(isEnabled: boolean) {
    const { data } = await api.patch('/llm/config/toggle', { isEnabled });
    return data.data;
  }

  static async getUsage() {
    const { data } = await api.get('/llm/usage');
    return data.data;
  }
}
