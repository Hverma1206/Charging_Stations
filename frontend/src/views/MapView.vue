<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { stationService } from '../services/api';
import 'leaflet/dist/leaflet.css';

const route = useRoute();
const selectedStationId = computed(() => route.query.id);

const stations = ref([]);
const selectedStation = ref(null);
const loading = ref(true);
const error = ref(null);
const map = ref(null);
const markers = ref({});
let L = null;

// Get station details when a station is selected
const getStationDetails = async (id) => {
  try {
    const response = await stationService.getById(id);
    selectedStation.value = response.data;
    
    // Center map on selected station
    if (map.value && selectedStation.value) {
      const { latitude, longitude } = selectedStation.value.location;
      map.value.setView([latitude, longitude], 15);
      
      // Highlight the marker
      if (markers.value[id]) {
        markers.value[id].openPopup();
      }
    }
  } catch (err) {
    console.error('Error fetching station details:', err);
    error.value = 'Failed to load station details';
  }
};

// Fetch all stations
const fetchStations = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await stationService.getAll();
    stations.value = response.data;
  } catch (err) {
    console.error('Error fetching stations:', err);
    error.value = 'Failed to load charging stations';
  } finally {
    loading.value = false;
  }
};

// Add markers for stations
const addStationMarkers = () => {
  if (!L || !map.value) return;
  
  // Clear existing markers
  Object.values(markers.value).forEach(marker => {
    map.value.removeLayer(marker);
  });
  markers.value = {};
  
  // Add markers for each station
  stations.value.forEach(station => {
    const { latitude, longitude } = station.location;
    
    // Create marker
    const marker = L.marker([latitude, longitude]).addTo(map.value);
    
    // Create popup
    marker.bindPopup(`
      <div class="popup-content">
        <h3>${station.name}</h3>
        <p><strong>Status:</strong> ${station.status}</p>
        <p><strong>Power:</strong> ${station.powerOutput}kW</p>
        <button class="popup-btn" onclick="window.selectStation('${station._id}')">View Details</button>
      </div>
    `);
    
    // Store marker reference
    markers.value[station._id] = marker;
    
    // Open popup if this is the selected station
    if (selectedStationId.value === station._id) {
      marker.openPopup();
    }
  });
};

// Initialize the map
const initMap = async () => {
  if (map.value) return; // Map already initialized
  
  try {
    // Import Leaflet dynamically to avoid SSR issues
    const leaflet = await import('leaflet');
    L = leaflet.default;
    
    // Fix Leaflet icon paths
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });
    
    // Create map
    const mapElement = document.getElementById('map');
    if (mapElement) {
      map.value = L.map('map').setView([40.7128, -74.0060], 10);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map.value);
      
      // Add markers for all stations
      addStationMarkers();
      
      // Check if a specific station is selected from the URL
      if (selectedStationId.value) {
        getStationDetails(selectedStationId.value);
      }
    } else {
      console.error("Map element not found");
    }
  } catch (error) {
    console.error("Error initializing map:", error);
    error.value = "Failed to load map. Please try again.";
  }
};

// Function to select a station from the map
const selectStation = (id) => {
  selectedStation.value = stations.value.find(s => s._id === id);
};

// Watch for stations changes to update markers
watch(stations, () => {
  addStationMarkers();
});

// Make the function available to the window object
onMounted(() => {
  window.selectStation = selectStation;
  
  fetchStations().then(() => {
    // Wait a moment for the DOM to update
    setTimeout(initMap, 100);
  });
});

// Clean up on component unmount
onUnmounted(() => {
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
  delete window.selectStation;
});
</script>

<template>
  <div class="map-view">
    <div class="map-container">
      <div id="map"></div>
      
      <div v-if="loading" class="map-overlay loading">
        Loading map and stations...
      </div>
      
      <div v-if="error" class="map-overlay error">
        {{ error }}
      </div>
    </div>
    
    <div class="station-details" v-if="selectedStation">
      <div class="details-header">
        <h2>{{ selectedStation.name }}</h2>
        <span class="station-status" :class="`status-${selectedStation.status.toLowerCase()}`">
          {{ selectedStation.status }}
        </span>
        <button class="close-btn" @click="selectedStation = null">&times;</button>
      </div>
      
      <div class="details-content">
        <p class="address" v-if="selectedStation.location.address">
          <strong>Address:</strong> {{ selectedStation.location.address }}
        </p>
        <p class="coordinates">
          <strong>Coordinates:</strong> 
          {{ selectedStation.location.latitude.toFixed(6) }}, 
          {{ selectedStation.location.longitude.toFixed(6) }}
        </p>
        <p class="power">
          <strong>Power Output:</strong> {{ selectedStation.powerOutput }}kW
        </p>
        <p class="connector">
          <strong>Connector Type:</strong> {{ selectedStation.connectorType }}
        </p>
      </div>
    </div>
  </div>
</template>

<style>
.map-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
}

.map-container {
  flex: 1;
  position: relative;
  min-height: 400px;
}

#map {
  height: 100%;
  width: 100%;
  border-radius: 8px;
  z-index: 1;
}

.map-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.7);
  padding: 1rem 2rem;
  border-radius: 8px;
  z-index: 2;
}

.loading {
  color: white;
}

.error {
  color: #ff6464;
}

.station-details {
  background-color: #2a2a2a;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #444;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.details-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.station-status {
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

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #888;
}

.details-content p {
  margin: 0.5rem 0;
}

/* Leaflet popup styling */
.popup-content {
  padding: 0.5rem;
}

.popup-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.popup-content p {
  margin: 0.2rem 0;
  font-size: 0.9rem;
}

.popup-btn {
  margin-top: 0.5rem;
  padding: 0.3rem 0.5rem;
  background-color: #646cff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

/* Fix for Leaflet controls z-index issues */
.leaflet-top, .leaflet-bottom {
  z-index: 2 !important;
}
</style>
