const fetch = require('node-fetch');

async function testInvestorDashboardAPI() {
  try {
    console.log('Testing Investor Dashboard API endpoint...');
    
    // First, let's get a list of projects to find a valid project ID
    const projectsResponse = await fetch('http://localhost:3001/api/projects');
    const projectsData = await projectsResponse.json();
    
    if (!projectsData.success || !projectsData.data || projectsData.data.length === 0) {
      console.log('No projects found. Creating a test project first...');
      
      // Create a test project
      const createResponse = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: 'Test Investment Project',
          legalProjectName: 'Test Investment Project LLC',
          unitCalculationPrecision: 2,
          targetAmount: 1000000,
          currency: 'USD',
          startDate: '2024-01-01',
          endDate: '2024-12-31'
        })
      });
      
      const createData = await createResponse.json();
      if (!createData.success) {
        throw new Error('Failed to create test project');
      }
      
      console.log('Created test project:', createData.data.id);
      var projectId = createData.data.id;
    } else {
      var projectId = projectsData.data[0].id;
      console.log('Using existing project:', projectId);
    }
    
    // Test the investor dashboard endpoint
    console.log('\nTesting investor dashboard endpoint...');
    const dashboardResponse = await fetch(`http://localhost:3001/api/projects/${projectId}/investor-dashboard`);
    const dashboardData = await dashboardResponse.json();
    
    console.log('Response status:', dashboardResponse.status);
    console.log('Response data:', JSON.stringify(dashboardData, null, 2));
    
    if (dashboardData.success) {
      console.log('\n✅ Investor Dashboard API endpoint is working correctly!');
      console.log('Data includes:');
      console.log('- Project:', dashboardData.data.project ? '✅' : '❌');
      console.log('- Deal Room:', dashboardData.data.dealRoom ? '✅' : '❌');
      console.log('- Company Profile:', dashboardData.data.companyProfile ? '✅' : '❌');
      console.log('- Investor Portal:', dashboardData.data.investorPortal ? '✅' : '❌');
      console.log('- Debt/Equity Classes:', Array.isArray(dashboardData.data.debtEquityClasses) ? '✅' : '❌');
      console.log('- KPIs:', dashboardData.data.kpis ? '✅' : '❌');
    } else {
      console.log('❌ API endpoint returned error:', dashboardData.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testInvestorDashboardAPI();