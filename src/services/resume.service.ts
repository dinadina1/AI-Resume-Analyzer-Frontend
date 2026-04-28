import api from './api';

export class ResumeService {
  static async uploadResume(file: File, onProgress?: (pct: number) => void) {
    const formData = new FormData();
    formData.append('resume', file);
    const { data } = await api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
    return data.data;
  }

  static async getResumes(page = 1, limit = 10) {
    const { data } = await api.get('/resumes', { params: { page, limit } });
    return data.data;
  }

  static async getResume(id: string) {
    const { data } = await api.get(`/resumes/${id}`);
    return data.data;
  }

  static async getStatus(id: string) {
    const { data } = await api.get(`/resumes/${id}/status`);
    return data.data;
  }

  static async deleteResume(id: string) {
    await api.delete(`/resumes/${id}`);
  }

  static async downloadResume(id: string, fileName: string) {
    const response = await api.get(`/resumes/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}
