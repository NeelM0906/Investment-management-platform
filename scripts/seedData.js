const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

async function seedSampleProjects() {
  const dataDir = path.join(process.cwd(), 'data');
  const projectsFile = path.join(dataDir, 'projects.json');

  // Sample projects data
  const sampleProjects = [
    {
      id: uuidv4(),
      projectName: 'Green Energy Fund',
      legalProjectName: 'Green Energy Investment Fund LLC',
      unitCalculationPrecision: 4,
      targetAmount: 5000000,
      currency: 'USD',
      timeframe: {
        startDate: '2024-03-01T00:00:00.000Z',
        endDate: '2025-02-28T00:00:00.000Z'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      projectName: 'Tech Startup Portfolio',
      legalProjectName: 'Technology Startup Investment Portfolio Inc.',
      unitCalculationPrecision: 2,
      targetAmount: 2500000,
      currency: 'USD',
      timeframe: {
        startDate: '2024-06-01T00:00:00.000Z',
        endDate: '2025-05-31T00:00:00.000Z'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      projectName: 'Real Estate Development',
      legalProjectName: 'Prime Real Estate Development Fund LP',
      unitCalculationPrecision: 2,
      targetAmount: 10000000,
      currency: 'USD',
      timeframe: {
        startDate: '2024-01-15T00:00:00.000Z',
        endDate: '2026-01-14T00:00:00.000Z'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  try {
    // Check if projects already exist
    const existingData = await fs.readFile(projectsFile, 'utf-8');
    const existingProjects = JSON.parse(existingData);
    
    if (existingProjects.length > 0) {
      console.log('Projects already exist. Skipping seed data.');
      return;
    }
  } catch (error) {
    // File doesn't exist or is empty, continue with seeding
  }

  // Write sample projects
  await fs.writeFile(projectsFile, JSON.stringify(sampleProjects, null, 2));
  console.log(`Seeded ${sampleProjects.length} sample projects successfully.`);
}

// Run the seeding
seedSampleProjects().catch(console.error);