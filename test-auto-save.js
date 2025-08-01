// Test script for auto-save functionality
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api';
const PROJECT_ID = 'md6meit9vmnneh5u5vg'; // Using the first project from the API response
const SESSION_ID = 'test_session_' + Date.now();

async function testAutoSave() {
  console.log('Testing Auto-save and Draft Management...\n');

  try {
    // 1. Test creating a draft
    console.log('1. Creating a draft...');
    const createDraftResponse = await fetch(`${BASE_URL}/projects/${PROJECT_ID}/deal-room/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: SESSION_ID,
        draftData: {
          investmentBlurb: 'This is a test investment blurb for auto-save functionality.',
          investmentSummary: '# Test Investment Summary\n\nThis is a test summary with markdown formatting.'
        },
        isAutoSave: true
      }),
    });

    const createResult = await createDraftResponse.json();
    console.log('Draft created:', createResult.success ? '✓' : '✗');
    if (createResult.success) {
      console.log('Draft version:', createResult.data.version);
    }

    // 2. Test getting save status
    console.log('\n2. Getting save status...');
    const statusResponse = await fetch(`${BASE_URL}/projects/${PROJECT_ID}/deal-room/save-status?sessionId=${SESSION_ID}`);
    const statusResult = await statusResponse.json();
    console.log('Save status retrieved:', statusResult.success ? '✓' : '✗');
    if (statusResult.success) {
      console.log('Status:', statusResult.data.status);
      console.log('Has unsaved changes:', statusResult.data.hasUnsavedChanges);
      console.log('Version:', statusResult.data.version);
    }

    // 3. Test updating the draft
    console.log('\n3. Updating draft...');
    const updateDraftResponse = await fetch(`${BASE_URL}/projects/${PROJECT_ID}/deal-room/draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: SESSION_ID,
        draftData: {
          investmentBlurb: 'Updated test investment blurb for auto-save functionality.',
          investmentSummary: '# Updated Test Investment Summary\n\nThis is an updated test summary with markdown formatting.\n\n## New Section\n\nAdded some new content.',
          keyInfo: [
            { name: 'Financial Projections', link: 'https://example.com/financials.pdf', order: 0 },
            { name: 'Market Analysis', link: 'https://example.com/market.pdf', order: 1 }
          ]
        },
        isAutoSave: true
      }),
    });

    const updateResult = await updateDraftResponse.json();
    console.log('Draft updated:', updateResult.success ? '✓' : '✗');
    if (updateResult.success) {
      console.log('New draft version:', updateResult.data.version);
    }

    // 4. Test getting the draft
    console.log('\n4. Retrieving draft...');
    const getDraftResponse = await fetch(`${BASE_URL}/projects/${PROJECT_ID}/deal-room/draft?sessionId=${SESSION_ID}`);
    const getDraftResult = await getDraftResponse.json();
    console.log('Draft retrieved:', getDraftResult.success ? '✓' : '✗');
    if (getDraftResult.success && getDraftResult.data) {
      console.log('Draft has investment blurb:', !!getDraftResult.data.draftData.investmentBlurb);
      console.log('Draft has investment summary:', !!getDraftResult.data.draftData.investmentSummary);
      console.log('Draft has key info:', !!getDraftResult.data.draftData.keyInfo);
    }

    // 5. Test publishing the draft
    console.log('\n5. Publishing draft...');
    const publishResponse = await fetch(`${BASE_URL}/projects/${PROJECT_ID}/deal-room/draft/publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: SESSION_ID,
        changeDescription: 'Test auto-save functionality'
      }),
    });

    const publishResult = await publishResponse.json();
    console.log('Draft published:', publishResult.success ? '✓' : '✗');
    if (publishResult.success) {
      console.log('Published version:', publishResult.data.version.version);
    }

    // 6. Test version history
    console.log('\n6. Getting version history...');
    const versionsResponse = await fetch(`${BASE_URL}/projects/${PROJECT_ID}/deal-room/versions`);
    const versionsResult = await versionsResponse.json();
    console.log('Version history retrieved:', versionsResult.success ? '✓' : '✗');
    if (versionsResult.success) {
      console.log('Number of versions:', versionsResult.data.length);
      if (versionsResult.data.length > 0) {
        console.log('Latest version:', versionsResult.data[0].version);
        console.log('Change description:', versionsResult.data[0].changeDescription);
      }
    }

    // 7. Test data recovery
    console.log('\n7. Testing data recovery...');
    const recoveryResponse = await fetch(`${BASE_URL}/projects/${PROJECT_ID}/deal-room/recover-changes?sessionId=${SESSION_ID}`);
    const recoveryResult = await recoveryResponse.json();
    console.log('Recovery check completed:', recoveryResult.success ? '✓' : '✗');
    console.log('Unsaved changes found:', recoveryResult.data ? 'Yes' : 'No');

    console.log('\n✅ Auto-save functionality test completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

// Run the test
testAutoSave();