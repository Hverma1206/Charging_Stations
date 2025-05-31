const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const stationRoutes = require('./routes/stations');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

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
