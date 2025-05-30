<script setup>
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import auth from './store/auth';

const router = useRouter();
const isAuthenticated = computed(() => auth.state.isAuthenticated);
const user = computed(() => auth.state.user);

onMounted(async () => {
  await auth.actions.fetchCurrentUser();
});

const logout = () => {
  auth.actions.logout();
  router.push('/login');
};
</script>

<template>
  <div class="app-container">
    <header>
      <nav>
        <div class="nav-logo">
          <router-link to="/">Charging Stations</router-link>
        </div>
        <div class="nav-links">
          <router-link to="/map">Map View</router-link>
          <template v-if="isAuthenticated">
            <router-link to="/stations">Stations</router-link>
            <span class="user-name">{{ user?.name }}</span>
            <button @click="logout" class="logout-btn">Logout</button>
          </template>
          <template v-else>
            <router-link to="/login">Login</router-link>
            <router-link to="/register">Register</router-link>
          </template>
        </div>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: #1a1a1a;
  padding: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
}

.nav-logo a {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  color: #ccc;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #646cff;
}

.user-name {
  color: #7b7b7b;
  margin-left: 0.5rem;
}

.logout-btn {
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 0.5rem;
}

.logout-btn:hover {
  color: #ff6464;
}

main {
  flex: 1;
  padding: 1rem;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
}
</style>

