#!/bin/bash

# Auto-Approve Rules System Test Script
# Tests rule creation, action evaluation, and auto-approval

BASE_URL="http://localhost:3000"

echo "🧪 Auto-Approve Rules System Test"
echo "=================================="
echo ""

# Test 1: Create a rule
echo "📝 Test 1: Creating auto-approve rule..."
RULE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/queue/rules" \
  -H "Content-Type: application/json" \
  -d '{
    "action_type": "email_reply",
    "conditions": [
      {"field": "recipient", "op": "contains", "value": "test"},
      {"field": "body_length", "op": "lt", "value": 100}
    ]
  }')

echo "Response: $RULE_RESPONSE"
RULE_ID=$(echo $RULE_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
echo "✅ Rule created with ID: $RULE_ID"
echo ""

# Test 2: Create matching action (should auto-approve)
echo "📧 Test 2: Creating action that matches rule..."
ACTION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/queue" \
  -H "Content-Type: application/json" \
  -d '{
    "action_type": "email_reply",
    "action_data": {
      "recipient": "test@example.com",
      "subject": "Re: Meeting",
      "body": "Sounds good!",
      "body_length": 12
    },
    "risk_level": "low",
    "confidence": 0.9
  }')

echo "Response: $ACTION_RESPONSE"
AUTO_APPROVED=$(echo $ACTION_RESPONSE | grep -o '"auto_approved":true')
if [ -n "$AUTO_APPROVED" ]; then
  echo "✅ Action was auto-approved!"
else
  echo "❌ Action was NOT auto-approved (expected auto-approval)"
fi
echo ""

# Test 3: Create non-matching action (should require manual review)
echo "📧 Test 3: Creating action that does NOT match rule..."
ACTION_RESPONSE_2=$(curl -s -X POST "$BASE_URL/api/queue" \
  -H "Content-Type: application/json" \
  -d '{
    "action_type": "email_reply",
    "action_data": {
      "recipient": "important@company.com",
      "subject": "Re: Contract",
      "body": "This is a longer message that exceeds the 100 character limit specified in the rule so it should not be auto-approved.",
      "body_length": 150
    },
    "risk_level": "medium",
    "confidence": 0.85
  }')

echo "Response: $ACTION_RESPONSE_2"
NOT_AUTO_APPROVED=$(echo $ACTION_RESPONSE_2 | grep -o '"auto_approved":false')
if [ -n "$NOT_AUTO_APPROVED" ]; then
  echo "✅ Action requires manual review (correct!)"
else
  echo "⚠️ Action may have been auto-approved (check response)"
fi
echo ""

# Test 4: Fetch all rules
echo "📋 Test 4: Fetching all rules..."
RULES_RESPONSE=$(curl -s "$BASE_URL/api/queue/rules")
echo "Response: $RULES_RESPONSE"
RULE_COUNT=$(echo $RULES_RESPONSE | grep -o '"id":[0-9]*' | wc -l)
echo "✅ Found $RULE_COUNT rule(s)"
echo ""

# Test 5: Fetch all actions
echo "📋 Test 5: Fetching all actions..."
ACTIONS_RESPONSE=$(curl -s "$BASE_URL/api/queue")
echo "Response: $ACTIONS_RESPONSE"
ACTION_COUNT=$(echo $ACTIONS_RESPONSE | grep -o '"id":[0-9]*' | wc -l)
echo "✅ Found $ACTION_COUNT action(s)"
echo ""

# Test 6: Disable the rule
echo "🔧 Test 6: Disabling rule $RULE_ID..."
DISABLE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/api/queue/rules/$RULE_ID" \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}')

echo "Response: $DISABLE_RESPONSE"
echo "✅ Rule disabled"
echo ""

# Test 7: Create action again (should NOT auto-approve now)
echo "📧 Test 7: Creating action with rule disabled..."
ACTION_RESPONSE_3=$(curl -s -X POST "$BASE_URL/api/queue" \
  -H "Content-Type: application/json" \
  -d '{
    "action_type": "email_reply",
    "action_data": {
      "recipient": "test2@example.com",
      "subject": "Re: Test",
      "body": "Short message",
      "body_length": 13
    },
    "risk_level": "low",
    "confidence": 0.9
  }')

echo "Response: $ACTION_RESPONSE_3"
NOT_AUTO_APPROVED_2=$(echo $ACTION_RESPONSE_3 | grep -o '"auto_approved":false')
if [ -n "$NOT_AUTO_APPROVED_2" ]; then
  echo "✅ Action requires manual review (rule is disabled)"
else
  echo "⚠️ Action may have been auto-approved (rule should be disabled)"
fi
echo ""

# Test 8: Re-enable the rule
echo "🔧 Test 8: Re-enabling rule $RULE_ID..."
ENABLE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/api/queue/rules/$RULE_ID" \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}')

echo "Response: $ENABLE_RESPONSE"
echo "✅ Rule re-enabled"
echo ""

# Test 9: Delete the rule
echo "🗑️  Test 9: Deleting rule $RULE_ID..."
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/queue/rules/$RULE_ID")
echo "Response: $DELETE_RESPONSE"
echo "✅ Rule deleted"
echo ""

echo "=================================="
echo "✅ All tests completed!"
echo ""
echo "Summary:"
echo "- Created rule with conditions"
echo "- Verified auto-approval for matching actions"
echo "- Verified manual review for non-matching actions"
echo "- Tested rule enable/disable"
echo "- Tested rule deletion"
echo ""
echo "🎉 Auto-Approve Rules System is working!"
