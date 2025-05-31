<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { stationService } from '../services/api';

const route = useRoute();
const router = useRouter();
const stationId = computed(() => route.params.id);
const isEditMode = computed(() => !!stationId.value);

const station = ref({
  name: '',
  location: {
    latitude: 0,
    longitude: 0,
    address: ''
  },
  status: 'Active',
  powerOutput: 0,
  connectorType: ''
});

const statusOptions = ['Active', 'Inactive', 'Maintenance'];
const connectorOptions = ['Type 1', 'Type 2', 'CCS', 'CHAdeMO', 'Tesla'];

const loading = ref(false);
const error = ref('');
const successMessage = ref('');

const fetchStation = async () => {
  if (!isEditMode.value) return;
  
  try {
    loading.value = true;
    const response = await stationService.getById(stationId.value);
    station.value = response.data;
  } catch (err) {
    console.error('Error fetching station:', err);
    error.value = 'Failed to load station data. Please try again.';
    router.push('/stations');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = '';
    successMessage.value = '';
    
    if (isEditMode.value) {
      await stationService.update(stationId.value, station.value);
      successMessage.value = 'Station updated successfully!';
    } else {
      await stationService.create(station.value);
      successMessage.value = 'Station created successfully!';
      station.value = {
        name: '',
        location: {
          latitude: 0,
          longitude: 0,
          address: ''
        },
        status: 'Active',
        powerOutput: 0,
        connectorType: ''
      };
    }
    
    setTimeout(() => {
      router.push('/stations');
    }, 2000);
    
  } catch (err) {
    console.error('Error saving station:', err);
    error.value = err.response?.data?.msg || 'Failed to save station. Please try again.';
  } finally {
    loading.value = false;
  }
};

const initMap = () => {
  if (navigator.geolocation && !isEditMode.value) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        station.value.location.latitude = position.coords.latitude;
        station.value.location.longitude = position.coords.longitude;
      },
      () => {
        station.value.location.latitude = 40.7128;
        station.value.location.longitude = -74.0060;
      }
    );
  }
};

const handleCancel = () => {
  router.push('/stations');
};

onMounted(() => {
  fetchStation();
  initMap();
});
</script>

<template>
  <div class="station-edit">
    <h1>{{ isEditMode ? 'Edit Charging Station' : 'Add New Charging Station' }}</h1>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
    
    <form @submit.prevent="handleSubmit" class="station-form">
      <div class="form-group">
        <label for="name">Station Name *</label>
        <input 
          id="name" 
          type="text" 
          v-model="station.name" 
          required 
          placeholder="Enter station name"
        />
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="latitude">Latitude *</label>
          <input 
            id="latitude" 
            type="number" 
            v-model.number="station.location.latitude" 
            required 
            step="any"
          />
        </div>
        
        <div class="form-group">
          <label for="longitude">Longitude *</label>
          <input 
            id="longitude" 
            type="number" 
            v-model.number="station.location.longitude" 
            required 
            step="any"
          />
        </div>
      </div>
      
      <div class="form-group">
        <label for="address">Address</label>
        <input 
          id="address" 
          type="text" 
          v-model="station.location.address" 
          placeholder="Enter address"
        />
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="status">Status *</label>
          <select id="status" v-model="station.status" required>
            <option v-for="option in statusOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="powerOutput">Power Output (kW) *</label>
          <input 
            id="powerOutput" 
            type="number" 
            v-model.number="station.powerOutput" 
            required 
            min="0" 
            step="0.1"
          />
        </div>
      </div>
      
      <div class="form-group">
        <label for="connectorType">Connector Type *</label>
        <select id="connectorType" v-model="station.connectorType" required>
          <option value="" disabled>Select connector type</option>
          <option v-for="option in connectorOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>
      
      <div class="form-actions">
        <button type="button" @click="handleCancel" class="cancel-btn">Cancel</button>
        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? 'Saving...' : (isEditMode ? 'Update Station' : 'Add Station') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.station-edit {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.station-form {
  background-color: #2a2a2a;
  padding: 2rem;
  border-radius: 8px;
  margin-top: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
  width: 100%;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-row .form-group {
  margin-bottom: 0;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input, select {
  width: 100%;
  padding: 0.8rem;
  border-radius: 4px;
  background: #1a1a1a;
  border: 1px solid #444;
  color: #fff;
}

input:focus, select:focus {
  border-color: #646cff;
  outline: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn {
  background-color: transparent;
  border: 1px solid #888;
  color: #888;
}

.cancel-btn:hover {
  background-color: rgba(136, 136, 136, 0.1);
}

.submit-btn {
  background-color: #646cff;
  color: white;
}

.submit-btn:hover {
  background-color: #535bf2;
}

.error-message {
  background-color: rgba(255, 0, 0, 0.1);
  color: #ff6464;
  padding: 0.8rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.success-message {
  background-color: rgba(0, 255, 0, 0.1);
  color: #4caf50;
  padding: 0.8rem;
  border-radius: 4px;
  margin-top: 1rem;
}
</style>
