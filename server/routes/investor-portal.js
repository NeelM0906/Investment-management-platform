const express = require('express');
const router = express.Router();
const { InvestorPortalService } = require('../../dist/src/services/InvestorPortalService');

const investorPortalService = new InvestorPortalService();

// GET /api/investor-portal
router.get('/', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../../data/investor-portal.json');
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      const portal = JSON.parse(data);
      res.json({ success: true, data: portal });
    } else {
      const defaultPortal = {
        id: "default",
        loginPageAssets: {
          logoUrl: "",
          backgroundImageUrl: "",
          logoAltText: ""
        },
        branding: {
          primaryColor: "#007bff",
          secondaryColor: "#6c757d",
          accentColor: "#28a745",
          fontFamily: "Arial, sans-serif",
          logoUrl: ""
        },
        welcomeMessage: {
          title: "Welcome to Our Investor Portal",
          content: "Access your investment information and updates here.",
          showOnDashboard: true
        },
        metrics: {
          selectedMetrics: [],
          customMetrics: [],
          displayOrder: []
        },
        isPublished: false,
        portalUrl: ""
      };
      res.json({ success: true, data: defaultPortal });
    }
  } catch (error) {
    console.error('Error fetching investor portal:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/investor-portal
router.put('/', (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../../data/investor-portal.json');
    
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.json({ success: true, data: req.body });
  } catch (error) {
    console.error('Error updating investor portal:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;