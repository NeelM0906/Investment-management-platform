const express = require('express');
const router = express.Router();
const { CompanyProfileService } = require('../../dist/src/services/CompanyProfileService');

const companyProfileService = new CompanyProfileService();

// GET /api/company-profile
router.get('/', async (req, res) => {
  try {
    const profile = await companyProfileService.getCompanyProfile();
    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/company-profile
router.put('/', async (req, res) => {
  try {
    const profile = await companyProfileService.updateCompanyProfile(req.body);
    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error updating company profile:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;