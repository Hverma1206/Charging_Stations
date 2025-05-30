<script setup>
import { defineProps, defineEmits, computed } from 'vue';
import auth from '../store/auth';

const props = defineProps({
  station: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['delete']);

const isOwner = computed(() => {
  return auth.state.user && auth.state.user._id === props.station.owner;
});

const formattedAddress = computed(() => {
  return props.station.location.address || 'No address provided';
});

const statusClass = computed(() => {
  const status = props.station.status.toLowerCase();
  return {
    'status-active': status === 'active',
    'status-inactive': status === 'inactive',
    'status-maintenance': status === 'maintenance'
  };
});

const handleDelete = () => {
  emit('delete', props.station._id);
};
</script>

<template>
  <div class="station-card">
    <div class="station-header">
      <h3>{{ station.name }}</h3>
      <span class="status" :class="statusClass">{{ station.status }}</span>
    </div>
    
    <div class="station-details">
      <p class="address">
        <strong>Address:</strong> {{ formattedAddress }}
      </p>
      <p class="power">
        <strong>Power Output:</strong> {{ station.powerOutput }}kW
      </p>
      <p class="connector">
        <strong>Connector Type:</strong> {{ station.connectorType }}
      </p>
    </div>
    
    <div class="location-preview">
      <strong>Location:</strong> 
      {{ station.location.latitude.toFixed(4) }}, {{ station.location.longitude.toFixed(4) }}
    </div>
    
    <div class="card-actions">
      <router-link :to="`/map?id=${station._id}`" class="view-map-btn">
        View on Map
      </router-link>
      
      <div v-if="isOwner" class="owner-actions">
        <router-link :to="`/stations/${station._id}/edit`" class="edit-btn">
          Edit
        </router-link>
        <button @click="handleDelete" class="delete-btn">Delete</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.station-card {
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 1.5rem;
  transition: transform 0.2s ease;
}

.station-card:hover {
  transform: translateY(-5px);
}

.station-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid #444;
  padding-bottom: 0.5rem;
}

.station-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.status {
  padding: 0.3rem 0.6rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-active {
  background-color: rgba(0, 255, 0, 0.1);
  color: #4caf50;
}

.status-inactive {
  background-color: rgba(255, 0, 0, 0.1);
  color: #f44336;
}

.status-maintenance {
  background-color: rgba(255, 165, 0, 0.1);
  color: #ff9800;
}

.station-details {
  margin-bottom: 1rem;
}

.station-details p {
  margin: 0.5rem 0;
}

.location-preview {
  padding: 0.8rem;
  background-color: #1a1a1a;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-map-btn, .edit-btn, .delete-btn {
  padding: 0.5rem 0.8rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  text-decoration: none;
}

.view-map-btn {
  background-color: #1a1a1a;
  color: #646cff;
}

.owner-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn {
  background-color: #1a1a1a;
  color: #4caf50;
}

.delete-btn {
  background-color: rgba(255, 0, 0, 0.1);
  color: #f44336;
  border: 1px solid #f44336;
}
</style>
