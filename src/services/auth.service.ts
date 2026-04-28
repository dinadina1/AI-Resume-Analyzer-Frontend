import api from './api';

export interface LoginPayload { email: string; password: string }
export interface SignupPayload { name: string; email: string; password: string }

export class AuthService {
  static async login(payload: LoginPayload) {
    const { data } = await api.post('/auth/login', payload);
    return data.data;
  }

  static async signup(payload: SignupPayload) {
    const { data } = await api.post('/auth/signup', payload);
    return data.data;
  }

  static async logout(refreshToken?: string) {
    await api.post('/auth/logout', { refreshToken });
  }

  static async getMe() {
    const { data } = await api.get('/auth/me');
    return data.data;
  }
}
