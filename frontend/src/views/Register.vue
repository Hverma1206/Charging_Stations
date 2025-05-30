<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import auth from '../store/auth';

const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const loading = ref(false);

const handleRegister = async () => {
  if (!name.value || !email.value || !password.value) {
    error.value = 'Please fill in all required fields';
    return;
  }
  
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }
  
  loading.value = true;
  const success = await auth.actions.register({
    name: name.value,
    email: email.value,
    password: password.value
  });
  
  if (success) {
    router.push('/stations');
  } else {
    error.value = auth.state.error || 'Registration failed';
  }
  loading.value = false;
};
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <h1>Register</h1>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Name</label>
          <input 
            id="name" 
            type="text" 
            v-model="name" 
            placeholder="Your name"
            required
          />
        </div>
        
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
        
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input 
            id="confirmPassword" 
            type="password" 
            v-model="confirmPassword" 
            placeholder="Confirm your password"
            required
          />
        </div>
        
        <button type="submit" :disabled="loading">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>
      
      <div class="login-link">
        Already have an account? 
        <router-link to="/login">Login</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 140px);
}

.register-card {
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

.login-link {
  text-align: center;
  margin-top: 1.5rem;
}
</style>
