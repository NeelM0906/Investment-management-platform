const express = require('express');
const router = express.Router();
const { DealRoomService } = require('../../dist/src/services/DealRoomService');

const dealRoomService = new DealRoomService();

// GET /api/deal-room/:projectId
router.get('/deal-room/:projectId', async (req, res) => {
  try {
    const dealRoom = await dealRoomService.getDealRoomByProjectId(req.params.projectId);
    res.json({ success: true, data: dealRoom });
  } catch (error) {
    console.error('Error fetching deal room:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/deal-room/:projectId
router.put('/deal-room/:projectId', async (req, res) => {
  try {
    const dealRoom = await dealRoomService.updateDealRoom(req.params.projectId, req.body);
    res.json({ success: true, data: dealRoom });
  } catch (error) {
    console.error('Error updating deal room:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;