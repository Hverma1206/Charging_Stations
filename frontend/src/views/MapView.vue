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

const getStationDetails = async (id) => {
  try {
    const response = await stationService.getById(id);
    selectedStation.value = response.data;
    
    if (map.value && selectedStation.value) {
      const { latitude, longitude } = selectedStation.value.location;
      map.value.setView([latitude, longitude], 15);
      
      if (markers.value[id]) {
        markers.value[id].openPopup();
      }
    }
  } catch (err) {
    console.error('Error fetching station details:', err);
    error.value = 'Failed to load station details';
  }
};

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

const addStationMarkers = () => {
  if (!L || !map.value) return;
  
  Object.values(markers.value).forEach(marker => {
    map.value.removeLayer(marker);
  });
  markers.value = {};
  
  stations.value.forEach(station => {
    const { latitude, longitude } = station.location;
    
    if (!latitude || !longitude) return;
    
    const markerIcon = getMarkerIcon(station.status);
    
    const marker = L.marker([latitude, longitude], { icon: markerIcon }).addTo(map.value);
    
    const popupContent = `
      <div class="popup-content">
        <h3>${station.name}</h3>
        <p class="status status-${station.status.toLowerCase()}">${station.status}</p>
        <p><strong>Power:</strong> ${station.powerOutput}kW</p>
        <p><strong>Connector:</strong> ${station.connectorType}</p>
        <button class="popup-btn" onclick="window.selectStation('${station._id}')">View Details</button>
      </div>
    `;
    
    marker.bindPopup(popupContent);
    
    markers.value[station._id] = marker;
  });
  
  if (!selectedStationId.value && stations.value.length > 0) {
    const markerGroup = L.featureGroup(Object.values(markers.value));
    map.value.fitBounds(markerGroup.getBounds(), { padding: [50, 50] });
  }
};

const getMarkerIcon = (status) => {
  if (!L) return null;
  
  const iconUrl = status === 'Active' 
    ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
    : status === 'Maintenance'
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png'
      : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
  
  return L.icon({
    iconUrl,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const initMap = async () => {
  if (map.value) return;
  
  try {
    const leaflet = await import('leaflet');
    L = leaflet.default;
    
    const mapElement = document.getElementById('map');
    if (mapElement) {
      map.value = L.map('map').setView([40.7128, -74.0060], 10);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map.value);
      
      addStationMarkers();
      
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

const selectStation = (id) => {
  selectedStation.value = stations.value.find(s => s._id === id);
};

watch(stations, () => {
  addStationMarkers();
});

watch(selectedStationId, (newId) => {
  if (newId) {
    getStationDetails(newId);
  } else {
    selectedStation.value = null;
  }
});

onMounted(() => {
  window.selectStation = selectStation;
  
  fetchStations().then(() => {
    setTimeout(initMap, 100);
  });
});

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
      
      <div class="details-actions" v-if="selectedStation">
        <router-link 
          v-if="selectedStation.owner === $auth?.state?.user?._id" 
          :to="`/stations/${selectedStation._id}/edit`" 
          class="edit-btn"
        >
          Edit Station
        </router-link>
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
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

#map {
  height: 100%;
  width: 100%;
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

.details-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
}

.edit-btn {
  background-color: #646cff;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
}

.edit-btn:hover {
  background-color: #535bf2;
}

.leaflet-popup-content-wrapper {
  background-color: #2a2a2a;
  color: white;
  border-radius: 8px;
}

.leaflet-popup-tip {
  background-color: #2a2a2a;
}

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

.popup-content .status {
  display: inline-block;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
}

.popup-content .status-active {
  background-color: rgba(0, 255, 0, 0.2);
  color: #4caf50;
}

.popup-content .status-inactive {
  background-color: rgba(255, 0, 0, 0.2);
  color: #f44336;
}

.popup-content .status-maintenance {
  background-color: rgba(255, 165, 0, 0.2);
  color: #ff9800;
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

.popup-btn:hover {
  background-color: #535bf2;
}

.leaflet-top, .leaflet-bottom {
  z-index: 2 !important;
}
</style>
