<script setup>
import { computed } from 'vue';
import auth from '../store/auth';

const isAuthenticated = computed(() => auth.state.isAuthenticated);
</script>

<template>
  <div class="home-container">
    <div class="hero">
      <h1>Charging Stations Management</h1>
      <p>Find and manage electric vehicle charging stations</p>
      
      <div class="cta-buttons">
        <router-link to="/map" class="btn btn-primary">View Map</router-link>
        <router-link v-if="isAuthenticated" to="/stations" class="btn btn-secondary">
          Manage Stations
        </router-link>
        <router-link v-else to="/login" class="btn btn-secondary">
          Login
        </router-link>
      </div>
    </div>
    
    <div class="features">
      <div class="feature-card">
        <h3>Find Stations</h3>
        <p>Locate charging stations on an interactive map</p>
      </div>
      
      <div class="feature-card">
        <h3>Manage Your Stations</h3>
        <p>Add, update, and monitor your charging stations</p>
      </div>
      
      <div class="feature-card">
        <h3>Filter Options</h3>
        <p>Filter stations by status, power output, and connector type</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  padding: 2rem 0;
}

.hero {
  text-align: center;
  padding: 4rem 1rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero p {
  font-size: 1.2rem;
  color: #888;
  margin-bottom: 2rem;
}

.cta-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #646cff;
  color: white;
}

.btn-primary:hover {
  background-color: #535bf2;
}

.btn-secondary {
  background-color: transparent;
  border: 1px solid #646cff;
  color: #646cff;
}

.btn-secondary:hover {
  background-color: rgba(100, 108, 255, 0.1);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
}

.feature-card {
  background-color: #2a2a2a;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #646cff;
}

.feature-card p {
  color: #888;
}
</style>
