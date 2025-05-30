import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import StationsList from '../views/StationsList.vue';
import StationEdit from '../views/StationEdit.vue';
import MapView from '../views/MapView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/stations',
    name: 'Stations',
    component: StationsList,
    meta: { requiresAuth: true }
  },
  {
    path: '/stations/new',
    name: 'NewStation',
    component: StationEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/stations/:id/edit',
    name: 'EditStation',
    component: StationEdit,
    meta: { requiresAuth: true }
  },
  {
    path: '/map',
    name: 'Map',
    component: MapView
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token');
  
  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router;
