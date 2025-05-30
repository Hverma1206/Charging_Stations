<script setup>
import { ref, onMounted, computed } from 'vue';
import { stationService } from '../services/api';
import StationCard from '../components/StationCard.vue';

const stations = ref([]);
const filteredStations = ref([]);
const loading = ref(true);
const error = ref(null);

// Filter states
const statusFilter = ref('All');
const connectorTypeFilter = ref('All');
const minPowerOutput = ref(0);
const searchQuery = ref('');

// Get unique values for filters
const statusOptions = computed(() => {
  const statuses = ['All', ...new Set(stations.value.map(s => s.status))];
  return statuses;
});

const connectorTypeOptions = computed(() => {
  const types = ['All', ...new Set(stations.value.map(s => s.connectorType))];
  return types;
});

const maxPowerOutput = computed(() => {
  if (stations.value.length === 0) return 100;
  return Math.max(...stations.value.map(s => s.powerOutput));
});

const fetchStations = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await stationService.getAll();
    stations.value = response.data;
    applyFilters();
  } catch (err) {
    console.error('Error fetching stations:', err);
    error.value = 'Failed to load charging stations. Please try again.';
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  filteredStations.value = stations.value.filter(station => {
    // Apply status filter
    if (statusFilter.value !== 'All' && station.status !== statusFilter.value) {
      return false;
    }
    
    // Apply connector type filter
    if (connectorTypeFilter.value !== 'All' && station.connectorType !== connectorTypeFilter.value) {
      return false;
    }
    
    // Apply power output filter
    if (station.powerOutput < minPowerOutput.value) {
      return false;
    }
    
    // Apply search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      const nameMatch = station.name.toLowerCase().includes(query);
      const addressMatch = station.location.address?.toLowerCase().includes(query) || false;
      if (!nameMatch && !addressMatch) {
        return false;
      }
    }
    
    return true;
  });
};

const handleDelete = async (stationId) => {
  if (!confirm('Are you sure you want to delete this station?')) {
    return;
  }
  
  try {
    await stationService.delete(stationId);
    fetchStations();
  } catch (err) {
    console.error('Error deleting station:', err);
    error.value = 'Failed to delete the station. Please try again.';
  }
};

// Watch for filter changes
const watchFilters = () => {
  applyFilters();
};

// Initialize component
onMounted(() => {
  fetchStations();
});
</script>

<template>
  <div class="stations-list">
    <div class="stations-header">
      <h1>Charging Stations</h1>
      <router-link to="/stations/new" class="add-btn">Add New Station</router-link>
    </div>
    
    <div class="filters">
      <div class="search-bar">
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Search by name or address..." 
          @input="watchFilters"
        />
      </div>
      
      <div class="filter-controls">
        <div class="filter-group">
          <label>Status:</label>
          <select v-model="statusFilter" @change="watchFilters">
            <option v-for="status in statusOptions" :key="status" :value="status">
              {{ status }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Connector Type:</label>
          <select v-model="connectorTypeFilter" @change="watchFilters">
            <option v-for="type in connectorTypeOptions" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label>Min Power Output: {{ minPowerOutput }}kW</label>
          <input 
            type="range" 
            v-model.number="minPowerOutput" 
            min="0" 
            :max="maxPowerOutput" 
            @input="watchFilters"
          />
        </div>
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      Loading stations...
    </div>
    
    <div v-else-if="error" class="error">
      {{ error }}
    </div>
    
    <div v-else-if="filteredStations.length === 0" class="no-results">
      No charging stations found matching your filters.
    </div>
    
    <div v-else class="stations-grid">
      <StationCard 
        v-for="station in filteredStations" 
        :key="station._id" 
        :station="station"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<style scoped>
.stations-list {
  padding: 1rem 0;
}

.stations-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.add-btn {
  background-color: #646cff;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.add-btn:hover {
  background-color: #535bf2;
}

.filters {
  background-color: #2a2a2a;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.search-bar {
  margin-bottom: 1rem;
}

.search-bar input {
  width: 100%;
  padding: 0.8rem;
  border-radius: 4px;
  background: #1a1a1a;
  border: 1px solid #444;
  color: #fff;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.filter-group {
  flex: 1;
  min-width: 150px;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.filter-group select,
.filter-group input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 4px;
  background: #1a1a1a;
  border: 1px solid #444;
  color: #fff;
}

.filter-group input[type="range"] {
  background: transparent;
}

.stations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.loading, .error, .no-results {
  text-align: center;
  padding: 2rem;
  background-color: #2a2a2a;
  border-radius: 8px;
}

.error {
  color: #ff6464;
}
</style>
