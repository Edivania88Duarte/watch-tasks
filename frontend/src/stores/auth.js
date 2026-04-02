import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { http, setAuthToken } from '../api/http';

const STORAGE_KEY = 'watch_tasks_token';
const USER_KEY = 'watch_tasks_user';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(STORAGE_KEY) || '');
  const user = ref(JSON.parse(localStorage.getItem(USER_KEY) || 'null'));

  if (token.value) {
    setAuthToken(token.value);
  }

  const isAuthenticated = computed(() => Boolean(token.value));

  function persist(session) {
    token.value = session.token;
    user.value = session.user;
    localStorage.setItem(STORAGE_KEY, session.token);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    setAuthToken(session.token);
  }

  function clear() {
    token.value = '';
    user.value = null;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthToken(null);
  }

  async function login(payload) {
    const { data } = await http.post('/api/auth/login', payload);
    persist(data);
  }

  async function register(payload) {
    const { data } = await http.post('/api/auth/register', payload);
    return data.user;
  }

  function logout() {
    clear();
  }

  return { token, user, isAuthenticated, login, register, logout };
});
