#!/bin/bash

# Test script for auto-save functionality using curl
BASE_URL="http://localhost:3001/api"
PROJECT_ID="md6meit9vmnneh5u5vg"
SESSION_ID="test_session_$(date +%s)"

echo "Testing Auto-save and Draft Management..."
echo "Project ID: $PROJECT_ID"
echo "Session ID: $SESSION_ID"
echo ""

# 1. Test creating a draft
echo "1. Creating a draft..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/projects/$PROJECT_ID/deal-room/draft" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"draftData\": {
      \"investmentBlurb\": \"This is a test investment blurb for auto-save functionality.\",
      \"investmentSummary\": \"# Test Investment Summary\\n\\nThis is a test summary with markdown formatting.\"
    },
    \"isAutoSave\": true
  }")

echo "Response: $CREATE_RESPONSE"
echo ""

# 2. Test getting save status
echo "2. Getting save status..."
STATUS_RESPONSE=$(curl -s "$BASE_URL/projects/$PROJECT_ID/deal-room/save-status?sessionId=$SESSION_ID")
echo "Response: $STATUS_RESPONSE"
echo ""

# 3. Test updating the draft
echo "3. Updating draft..."
UPDATE_RESPONSE=$(curl -s -X POST "$BASE_URL/projects/$PROJECT_ID/deal-room/draft" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"draftData\": {
      \"investmentBlurb\": \"Updated test investment blurb for auto-save functionality.\",
      \"investmentSummary\": \"# Updated Test Investment Summary\\n\\nThis is an updated test summary.\",
      \"keyInfo\": [
        {\"name\": \"Financial Projections\", \"link\": \"https://example.com/financials.pdf\", \"order\": 0},
        {\"name\": \"Market Analysis\", \"link\": \"https://example.com/market.pdf\", \"order\": 1}
      ]
    },
    \"isAutoSave\": true
  }")

echo "Response: $UPDATE_RESPONSE"
echo ""

# 4. Test getting the draft
echo "4. Retrieving draft..."
GET_DRAFT_RESPONSE=$(curl -s "$BASE_URL/projects/$PROJECT_ID/deal-room/draft?sessionId=$SESSION_ID")
echo "Response: $GET_DRAFT_RESPONSE"
echo ""

# 5. Test publishing the draft
echo "5. Publishing draft..."
PUBLISH_RESPONSE=$(curl -s -X POST "$BASE_URL/projects/$PROJECT_ID/deal-room/draft/publish" \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"changeDescription\": \"Test auto-save functionality\"
  }")

echo "Response: $PUBLISH_RESPONSE"
echo ""

# 6. Test version history
echo "6. Getting version history..."
VERSIONS_RESPONSE=$(curl -s "$BASE_URL/projects/$PROJECT_ID/deal-room/versions")
echo "Response: $VERSIONS_RESPONSE"
echo ""

echo "✅ Auto-save functionality test completed!"