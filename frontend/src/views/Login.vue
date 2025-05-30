<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import auth from '../store/auth';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = 'Please provide both email and password';
    return;
  }
  
  loading.value = true;
  const success = await auth.actions.login({
    email: email.value,
    password: password.value
  });
  
  if (success) {
    router.push('/stations');
  } else {
    error.value = auth.state.error || 'Login failed';
  }
  loading.value = false;
};
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Login</h1>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            id="email" 
            type="email" 
            v-model="email" 
            placeholder="Your email"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            id="password" 
            type="password" 
            v-model="password" 
            placeholder="Your password"
            required
          />
        </div>
        
        <button type="submit" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      
      <div class="register-link">
        Don't have an account? 
        <router-link to="/register">Register</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 140px);
}

.login-card {
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
  margin-bottom: 1.5rem;
  text-align: center;
}

.form-group {
  margin-bottom: 1.2rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.8rem;
  border-radius: 4px;
  background: #1a1a1a;
  border: 1px solid #444;
  color: #fff;
}

input:focus {
  border-color: #646cff;
  outline: none;
}

button {
  width: 100%;
  margin-top: 1rem;
}

.error-message {
  background-color: rgba(255, 0, 0, 0.1);
  color: #ff6464;
  padding: 0.8rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
}
</style>
