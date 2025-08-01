const express = require('express');
const cors = require('cors');

// Create a test app
const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const projectsRouter = require('./server/routes/projects');
const debtEquityClassesRouter = require('./server/routes/debt-equity-classes');
const customUnitClassesRouter = require('./server/routes/custom-unit-classes');

app.use('/api/projects', projectsRouter);
app.use('/api/debt-equity-classes', debtEquityClassesRouter);
app.use('/api/custom-unit-classes', customUnitClassesRouter);

// Test the endpoints
async function testEndpoints() {
  const server = app.listen(3002, () => {
    console.log('Test server running on port 3002');
  });

  let projectId = null;

  // Test creating a project first
  try {
    const response = await fetch('http://localhost:3002/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectName: 'Test Project ' + Date.now(),
        legalProjectName: 'Test Legal Project ' + Date.now(),
        targetAmount: 1000000,
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        unitCalculationPrecision: 2
      })
    });
    const data = await response.json();
    console.log('POST /api/projects:', response.status, data);
    if (data.success) {
      projectId = data.data.id;
    }
  } catch (error) {
    console.error('Error creating project:', error.message);
  }

  if (projectId) {
    // Test getting debt equity classes for the project
    try {
      const response = await fetch(`http://localhost:3002/api/projects/${projectId}/debt-equity-classes`);
      const data = await response.json();
      console.log('GET /api/projects/:id/debt-equity-classes:', response.status, data);
    } catch (error) {
      console.error('Error getting debt equity classes:', error.message);
    }

    // Test creating a debt equity class
    let classId = null;
    try {
      const response = await fetch(`http://localhost:3002/api/projects/${projectId}/debt-equity-classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          unitClass: 'Class A',
          unitPrice: 100,
          isOpenToInvestments: true,
          investmentIncrementAmount: 1000,
          minInvestmentAmount: 5000,
          maxInvestmentAmount: 100000
        })
      });
      const data = await response.json();
      console.log('POST /api/projects/:id/debt-equity-classes:', response.status, data);
      if (data.success) {
        classId = data.data.id;
      }
    } catch (error) {
      console.error('Error creating debt equity class:', error.message);
    }

    if (classId) {
      // Test updating a debt equity class
      try {
        const response = await fetch(`http://localhost:3002/api/debt-equity-classes/${classId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            unitPrice: 150,
            isOpenToInvestments: false
          })
        });
        const data = await response.json();
        console.log('PUT /api/debt-equity-classes/:classId:', response.status, data);
      } catch (error) {
        console.error('Error updating debt equity class:', error.message);
      }

      // Test deleting a debt equity class
      try {
        const response = await fetch(`http://localhost:3002/api/debt-equity-classes/${classId}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        console.log('DELETE /api/debt-equity-classes/:classId:', response.status, data);
      } catch (error) {
        console.error('Error deleting debt equity class:', error.message);
      }
    }
  }

  // Test custom unit classes endpoint
  try {
    const response = await fetch('http://localhost:3002/api/custom-unit-classes');
    const data = await response.json();
    console.log('GET /api/custom-unit-classes:', response.status, data);
  } catch (error) {
    console.error('Error testing custom unit classes:', error.message);
  }

  // Test creating a custom unit class
  try {
    const response = await fetch('http://localhost:3002/api/custom-unit-classes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: 'Test Class ' + Date.now() })
    });
    const data = await response.json();
    console.log('POST /api/custom-unit-classes:', response.status, data);
  } catch (error) {
    console.error('Error creating custom unit class:', error.message);
  }

  server.close();
  console.log('Test completed');
}

// Run tests
testEndpoints().catch(console.error);