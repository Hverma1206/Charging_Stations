const express = require('express');
const router = express.Router();
const ChargingStation = require('../models/ChargingStation');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const stations = await ChargingStation.find().sort({ createdAt: -1 });
    res.json(stations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


router.get('/:id', async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id);
    
    if (!station) {
      return res.status(404).json({ msg: 'Charging station not found' });
    }
    
    res.json(station);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Charging station not found' });
    }
    res.status(500).send('Server error');
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      location,
      status,
      powerOutput,
      connectorType
    } = req.body;

    const newStation = new ChargingStation({
      name,
      location,
      status,
      powerOutput,
      connectorType,
      owner: req.user.id
    });

    const station = await newStation.save();
    res.json(station);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


router.put('/:id', auth, async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id);
    
    if (!station) {
      return res.status(404).json({ msg: 'Charging station not found' });
    }
    
    if (station.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    const {
      name,
      location,
      status,
      powerOutput,
      connectorType
    } = req.body;
    
    if (name) station.name = name;
    if (location) station.location = location;
    if (status) station.status = status;
    if (powerOutput) station.powerOutput = powerOutput;
    if (connectorType) station.connectorType = connectorType;
    
    station.updatedAt = Date.now();
    
    await station.save();
    res.json(station);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Charging station not found' });
    }
    res.status(500).send('Server error');
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const station = await ChargingStation.findById(req.params.id);
    
    if (!station) {
      return res.status(404).json({ msg: 'Charging station not found' });
    }
    
    if (station.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    await station.deleteOne();
    res.json({ msg: 'Charging station removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Charging station not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
