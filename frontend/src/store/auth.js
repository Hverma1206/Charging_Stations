import { reactive } from 'vue';
import { authService } from '../services/api';

const state = reactive({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
});

const actions = {
  async login(credentials) {
    try {
      state.loading = true;
      state.error = null;
      const response = await authService.login(credentials);
      const { token } = response.data;
      localStorage.setItem('token', token);
      await actions.fetchCurrentUser();
      return true;
    } catch (error) {
      state.error = error.response?.data?.msg || 'Login failed';
      return false;
    } finally {
      state.loading = false;
    }
  },

  async register(userData) {
    try {
      state.loading = true;
      state.error = null;
      const response = await authService.register(userData);
      const { token } = response.data;
      localStorage.setItem('token', token);
      await actions.fetchCurrentUser();
      return true;
    } catch (error) {
      state.error = error.response?.data?.msg || 'Registration failed';
      return false;
    } finally {
      state.loading = false;
    }
  },

  async fetchCurrentUser() {
    if (!localStorage.getItem('token')) {
      state.user = null;
      state.isAuthenticated = false;
      return;
    }
    
    try {
      state.loading = true;
      const response = await authService.getCurrentUser();
      state.user = response.data;
      state.isAuthenticated = true;
    } catch (error) {
      state.error = 'Failed to fetch user data';
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    } finally {
      state.loading = false;
    }
  },

  logout() {
    localStorage.removeItem('token');
    state.user = null;
    state.isAuthenticated = false;
  }
};

export default { state, actions };
