const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const stationRoutes = require('./routes/stations');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization'],
  credentials: true 
})
);

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('connected to db'))
  .catch(err => console.error('could not connect to db', err));

  app.get('/', (req,res) => {
    res.send('server is running');
  })

  app.use('/api/auth', authRoutes);
app.use('/api/stations', stationRoutes);



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
