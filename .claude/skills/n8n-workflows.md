# n8n Workflows Skill

## Overview

n8n is the automation backbone of PlumberPro, handling lead routing, notifications, and follow-ups. This skill documents all workflow patterns, webhook structures, and integration points.

## Webhook Payload Structures

### Lead Captured Event

```json
{
  "event": "lead_captured",
  "timestamp": "2025-01-15T10:30:00Z",

  "client": {
    "id": "uuid",
    "name": "Joe's Plumbing",
    "phone": "555-0100",
    "email": "joe@plumbing.com",
    "business_hours": {
      "monday": {"open": "08:00", "close": "18:00"},
      "tuesday": {"open": "08:00", "close": "18:00"}
    },
    "on_call_phone": "555-0199"
  },

  "lead": {
    "id": "uuid",
    "conversation_id": "uuid",
    "customer_name": "John Smith",
    "customer_phone": "555-1234",
    "customer_email": "john@email.com",
    "customer_address": "123 Main St, Springfield",
    "intent": "emergency_repair",
    "issue_type": "burst_pipe",
    "issue_description": "Burst pipe in basement causing active flooding. Customer has shut off main water valve.",
    "urgency_score": 9,
    "urgency_level": "critical",
    "lead_score": 95,
    "source": "website_widget",
    "created_at": "2025-01-15T10:30:00Z"
  },

  "urgency": "EMERGENCY"
}
```

### Voice Call Ended Event

```json
{
  "event": "call_ended",
  "timestamp": "2025-01-15T10:35:00Z",

  "client": {
    "id": "uuid",
    "name": "Joe's Plumbing"
  },

  "call": {
    "id": "uuid",
    "call_sid": "CA1234567890",
    "from_number": "+15551234567",
    "to_number": "+15559876543",
    "duration": 180,
    "status": "completed",
    "recording_url": "https://api.twilio.com/recordings/RE123",
    "transcript": "Full call transcript here...",
    "created_at": "2025-01-15T10:32:00Z"
  },

  "lead": {
    "id": "uuid",
    "customer_name": "Sarah Johnson",
    "customer_phone": "+15551234567",
    "intent": "quote_request",
    "issue_description": "Wants quote for water heater replacement",
    "urgency_score": 5
  }
}
```

### Lead Status Changed Event

```json
{
  "event": "lead_status_changed",
  "timestamp": "2025-01-15T11:00:00Z",

  "client_id": "uuid",
  "lead_id": "uuid",
  "customer_name": "John Smith",

  "old_status": "new",
  "new_status": "contacted",

  "changed_by": "plumber@email.com",
  "notes": "Called customer, scheduled for 2pm today"
}
```

## Main Lead Routing Workflow

### Workflow Structure

```
┌─────────────┐
│   Webhook   │ (Receives lead_captured event)
│   Trigger   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Function   │ (Parse and validate data)
│    Node     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Switch    │ (Branch by urgency_score)
│    Node     │
└──┬──┬──┬──┬┘
   │  │  │  │
   1  2  3  4
```

**Branches:**
1. Emergency (score >= 8)
2. Urgent (score 5-7)
3. Quote (score 3-4)
4. General (score 1-2)

### n8n Node Configurations

#### 1. Webhook Trigger Node

```json
{
  "name": "Lead Captured Webhook",
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "httpMethod": "POST",
    "path": "lead-captured",
    "responseMode": "onReceived",
    "responseData": "{ \"success\": true, \"message\": \"Lead received\" }",
    "authentication": "headerAuth",
    "options": {}
  }
}
```

#### 2. Function Node - Parse Data

```javascript
// Parse and enrich webhook data
const payload = $json.body;

// Extract key fields
const client = payload.client;
const lead = payload.lead;

// Calculate time-based urgency boost
const hour = new Date().getHours();
const isAfterHours = hour < 8 || hour > 18;

// Determine routing priority
let priority = 'normal';
if (lead.urgency_score >= 8) {
  priority = 'emergency';
} else if (lead.urgency_score >= 5) {
  priority = 'urgent';
} else if (lead.intent === 'quote_request') {
  priority = 'quote';
} else {
  priority = 'general';
}

// Format phone numbers for SMS (remove formatting)
const formatPhone = (phone) => {
  if (!phone) return null;
  return phone.replace(/\D/g, ''); // Remove non-digits
};

// Calculate time ago
const timeAgo = (timestamp) => {
  const now = new Date();
  const then = new Date(timestamp);
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  return `${Math.floor(seconds / 3600)} hours ago`;
};

return {
  json: {
    // Original data
    client_id: client.id,
    client_name: client.name,
    client_phone: formatPhone(client.phone),
    client_email: client.email,
    on_call_phone: formatPhone(client.on_call_phone),

    lead_id: lead.id,
    customer_name: lead.customer_name,
    customer_phone: formatPhone(lead.customer_phone),
    customer_email: lead.customer_email,
    customer_address: lead.customer_address,

    issue_type: lead.issue_type,
    issue_description: lead.issue_description,
    urgency_score: lead.urgency_score,
    urgency_level: lead.urgency_level,
    source: lead.source,

    // Computed fields
    priority: priority,
    is_after_hours: isAfterHours,
    time_ago: timeAgo(lead.created_at),
    dashboard_link: `https://app.plumberpro.com/leads/${lead.id}`,

    // Formatted display
    urgency_emoji: lead.urgency_score >= 8 ? '🚨' : lead.urgency_score >= 5 ? '⚠️' : '📋',
    formatted_created_at: new Date(lead.created_at).toLocaleString()
  }
};
```

#### 3. Switch Node - Route by Priority

```json
{
  "name": "Route by Priority",
  "type": "n8n-nodes-base.switch",
  "parameters": {
    "mode": "rules",
    "rules": {
      "rules": [
        {
          "conditions": {
            "conditions": [
              {
                "value1": "={{ $json.priority }}",
                "operation": "equals",
                "value2": "emergency"
              }
            ]
          },
          "renameOutput": true,
          "outputKey": "emergency"
        },
        {
          "conditions": {
            "conditions": [
              {
                "value1": "={{ $json.priority }}",
                "operation": "equals",
                "value2": "urgent"
              }
            ]
          },
          "renameOutput": true,
          "outputKey": "urgent"
        },
        {
          "conditions": {
            "conditions": [
              {
                "value1": "={{ $json.priority }}",
                "operation": "equals",
                "value2": "quote"
              }
            ]
          },
          "renameOutput": true,
          "outputKey": "quote"
        }
      ]
    },
    "fallbackOutput": "general"
  }
}
```

## Workflow Branches

### Emergency Branch (Priority 1)

```
Emergency Switch Output
       │
       ▼
┌─────────────┐
│  Twilio SMS │ → Send to on-call plumber
│   (Urgent)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Twilio SMS │ → Confirmation to customer
│ (Customer)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Supabase   │ → Update lead status
│   Update    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Wait     │ → Wait 10 minutes
│   10 min    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│     IF      │ → Check if lead contacted
│  Contacted? │
└──┬──────┬───┘
  NO      YES
   │       │
   │       └──> End
   │
   ▼
┌─────────────┐
│  Twilio     │ → Escalate to backup
│ Voice Call  │
└─────────────┘
```

#### Emergency SMS to Plumber

```json
{
  "name": "SMS to On-Call Plumber",
  "type": "n8n-nodes-base.twilio",
  "parameters": {
    "resource": "sms",
    "operation": "send",
    "from": "={{ $env.TWILIO_PHONE }}",
    "to": "={{ $json.on_call_phone }}",
    "message": "={{ $json.urgency_emoji }} EMERGENCY LEAD\n{{ $json.customer_name }}\n{{ $json.customer_phone }}\n{{ $json.customer_address }}\n\nIssue: {{ $json.issue_description }}\n\nCaptured {{ $json.time_ago }}\n\nView: {{ $json.dashboard_link }}"
  },
  "credentials": {
    "twilioApi": {
      "name": "Twilio Account"
    }
  }
}
```

#### Confirmation SMS to Customer

```json
{
  "name": "SMS to Customer",
  "type": "n8n-nodes-base.twilio",
  "parameters": {
    "resource": "sms",
    "operation": "send",
    "from": "={{ $env.TWILIO_PHONE }}",
    "to": "={{ $json.customer_phone }}",
    "message": "Thanks for contacting {{ $json.client_name }}! We received your emergency request and will call you within 10 minutes.\n\n- {{ $json.client_name }}"
  }
}
```

#### Wait and Check Follow-up

```javascript
// Wait Node: 10 minutes

// Then IF Node checks:
const lead = await fetch(`${baseUrl}/api/leads/${leadId}`, {
  headers: { 'Authorization': `Bearer ${apiKey}` }
}).then(r => r.json());

// If lead.status is still 'new', escalate
return lead.status === 'new' ? [{ json: $json }] : [];
```

#### Escalation Call

```json
{
  "name": "Escalation Voice Call",
  "type": "n8n-nodes-base.twilio",
  "parameters": {
    "resource": "call",
    "operation": "make",
    "from": "={{ $env.TWILIO_PHONE }}",
    "to": "={{ $json.on_call_phone }}",
    "twiml": "={{ '<Response><Say>Emergency lead not yet contacted. Customer ' + $json.customer_name + ' at ' + $json.customer_phone + '. Issue: ' + $json.issue_description + '</Say></Response>' }}"
  }
}
```

### Urgent Branch (Priority 2)

```
Urgent Switch Output
       │
       ▼
┌─────────────┐
│  Twilio SMS │ → SMS to plumber
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Email    │ → Detailed email
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Supabase   │ → Log notification
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Schedule  │ → 2-hour follow-up
│  Follow-up  │
└─────────────┘
```

#### SMS to Plumber (Urgent)

```
⚠️ URGENT LEAD
{customer_name}
{customer_phone}
{customer_address}

Issue: {issue_description}
Urgency: {urgency_score}/10

View: {dashboard_link}
```

#### Email to Plumber

```json
{
  "name": "Email Notification",
  "type": "n8n-nodes-base.emailSend",
  "parameters": {
    "fromEmail": "={{ $env.FROM_EMAIL }}",
    "toEmail": "={{ $json.client_email }}",
    "subject": "⚠️ Urgent Lead - {{ $json.customer_name }}",
    "text": "",
    "html": "=<html><body><h2>Urgent Lead Captured</h2><table><tr><td><strong>Customer:</strong></td><td>{{ $json.customer_name }}</td></tr><tr><td><strong>Phone:</strong></td><td><a href='tel:{{ $json.customer_phone }}'>{{ $json.customer_phone }}</a></td></tr><tr><td><strong>Email:</strong></td><td>{{ $json.customer_email }}</td></tr><tr><td><strong>Address:</strong></td><td>{{ $json.customer_address }}</td></tr><tr><td><strong>Issue:</strong></td><td>{{ $json.issue_description }}</td></tr><tr><td><strong>Urgency:</strong></td><td>{{ $json.urgency_score }}/10 ({{ $json.urgency_level }})</td></tr><tr><td><strong>Source:</strong></td><td>{{ $json.source }}</td></tr><tr><td><strong>Time:</strong></td><td>{{ $json.formatted_created_at }}</td></tr></table><br><a href='{{ $json.dashboard_link }}' style='display:inline-block;padding:10px 20px;background:#3B82F6;color:white;text-decoration:none;border-radius:5px;'>View in Dashboard</a></body></html>"
  }
}
```

### Quote Branch (Priority 3)

```
Quote Switch Output
       │
       ▼
┌─────────────┐
│    Email    │ → Email to plumber
└──────┬──────┬─┘
       │      │
       │      └──────────┐
       ▼                 ▼
┌─────────────┐   ┌─────────────┐
│  Auto-reply │   │   Slack     │ (Optional)
│ to Customer │   │Notification │
└─────────────┘   └─────────────┘
       │
       ▼
┌─────────────┐
│   Schedule  │ → 24-hour follow-up
│  Follow-up  │
└─────────────┘
```

#### Auto-reply to Customer

```json
{
  "name": "Auto-reply Email",
  "type": "n8n-nodes-base.emailSend",
  "parameters": {
    "fromEmail": "={{ $json.client_email }}",
    "toEmail": "={{ $json.customer_email }}",
    "subject": "Thanks for your quote request - {{ $json.client_name }}",
    "html": "=<html><body><p>Hi {{ $json.customer_name }},</p><p>Thanks for reaching out to {{ $json.client_name }}! We received your request for a quote:</p><blockquote>{{ $json.issue_description }}</blockquote><p>Someone from our team will reach out within 2-4 hours to discuss your needs and schedule a free estimate if needed.</p><p>If this is urgent, feel free to call us at {{ $json.client_phone }}.</p><p>Best regards,<br>{{ $json.client_name }}</p></body></html>"
  }
}
```

### General Branch (Priority 4)

```
General Switch Output
       │
       ▼
┌─────────────┐
│  Supabase   │ → Log lead
│   Insert    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Append    │ → Add to daily digest
│  to Sheet   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Schedule  │ → 3-day follow-up
│  Follow-up  │
└─────────────┘
```

## Follow-up Workflows

### Daily Digest Email

**Trigger:** Cron (every day at 8am)

```
┌─────────────┐
│    Cron     │ → 8:00 AM daily
│   Trigger   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Supabase   │ → Get leads from yesterday
│    Query    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Function   │ → Format as HTML table
│    Node     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Email    │ → Send digest
└─────────────┘
```

#### Query Yesterday's Leads

```sql
SELECT
  id,
  customer_name,
  customer_phone,
  issue_type,
  issue_description,
  urgency_score,
  status,
  created_at
FROM leads
WHERE client_id = '{{ $json.client_id }}'
  AND created_at >= CURRENT_DATE - INTERVAL '1 day'
  AND created_at < CURRENT_DATE
ORDER BY urgency_score DESC, created_at DESC;
```

#### Format Digest Email

```javascript
const leads = $json.data;

if (leads.length === 0) {
  return [{
    json: {
      subject: 'Daily Lead Digest - No New Leads',
      html: '<p>No new leads were captured yesterday.</p>'
    }
  }];
}

const tableRows = leads.map(lead => `
  <tr>
    <td>${lead.customer_name}</td>
    <td>${lead.customer_phone}</td>
    <td>${lead.issue_type}</td>
    <td>${lead.urgency_score}/10</td>
    <td>${lead.status}</td>
    <td>${new Date(lead.created_at).toLocaleString()}</td>
  </tr>
`).join('');

const html = `
<html>
<body>
  <h2>Daily Lead Digest - ${new Date().toLocaleDateString()}</h2>
  <p>You received <strong>${leads.length}</strong> lead(s) yesterday.</p>
  <table border="1" cellpadding="8" style="border-collapse: collapse;">
    <thead>
      <tr style="background: #f3f4f6;">
        <th>Customer</th>
        <th>Phone</th>
        <th>Issue Type</th>
        <th>Urgency</th>
        <th>Status</th>
        <th>Time</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>
  <br>
  <a href="https://app.plumberpro.com/leads">View All Leads</a>
</body>
</html>
`;

return [{
  json: {
    subject: `Daily Lead Digest - ${leads.length} New Lead(s)`,
    html: html
  }
}];
```

### Scheduled Follow-ups

**Trigger:** Database Poll (every 5 minutes)

```
┌─────────────┐
│  Supabase   │ → Poll for due follow-ups
│    Poll     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Switch    │ → Branch by follow-up type
│    Node     │
└──┬──┬──┬───┘
   │  │  │
   1  2  3
```

**Query for Due Follow-ups:**
```sql
SELECT
  l.*,
  c.name as client_name,
  c.phone as client_phone,
  c.email as client_email
FROM leads l
JOIN clients c ON c.id = l.client_id
WHERE l.status = 'new'
  AND l.created_at < NOW() - INTERVAL '2 hours'
  AND l.contacted_at IS NULL
ORDER BY urgency_score DESC;
```

## Advanced Patterns

### Conditional Routing by Business Hours

```javascript
// Function Node: Check Business Hours
const lead = $json;
const clientHours = lead.client.business_hours;
const now = new Date();
const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
const currentTime = now.toTimeString().substring(0, 5); // "HH:MM"

const todayHours = clientHours[dayOfWeek];

let isOpen = false;
if (todayHours) {
  isOpen = currentTime >= todayHours.open && currentTime <= todayHours.close;
}

// Emergency override - always route immediately
if (lead.urgency_score >= 8) {
  isOpen = true;
}

return [{
  json: {
    ...lead,
    is_business_hours: isOpen,
    routing_method: isOpen ? 'immediate' : 'queue'
  }
}];
```

### SMS Rate Limiting

```javascript
// Function Node: Check SMS Rate Limit
const customerPhone = $json.customer_phone;
const cacheKey = `sms_count_${customerPhone}`;

// Check cache (using n8n's built-in cache or external Redis)
let smsCount = await $getWorkflowStaticData('global')[cacheKey] || 0;
const lastReset = await $getWorkflowStaticData('global')[`${cacheKey}_reset`] || 0;

// Reset counter if more than 1 hour has passed
if (Date.now() - lastReset > 3600000) {
  smsCount = 0;
}

// Rate limit: max 3 SMS per hour per customer
if (smsCount >= 3) {
  return [{
    json: {
      ...$json,
      skip_sms: true,
      skip_reason: 'Rate limit exceeded'
    }
  }];
}

// Increment counter
smsCount += 1;
$getWorkflowStaticData('global')[cacheKey] = smsCount;
$getWorkflowStaticData('global')[`${cacheKey}_reset`] = Date.now();

return [{
  json: {
    ...$json,
    skip_sms: false
  }
}];
```

### Error Handling & Retry Logic

```javascript
// Wrap critical nodes in error workflow

// In main workflow, add error trigger:
{
  "name": "Error Trigger",
  "type": "n8n-nodes-base.errorTrigger",
  "parameters": {}
}

// Then log error to Supabase
{
  "name": "Log Error",
  "type": "n8n-nodes-base.supabase",
  "parameters": {
    "operation": "insert",
    "table": "workflow_errors",
    "fields": {
      "workflow_id": "={{ $workflow.id }}",
      "execution_id": "={{ $execution.id }}",
      "error_message": "={{ $json.error.message }}",
      "node_name": "={{ $json.node.name }}",
      "input_data": "={{ JSON.stringify($json.data) }}",
      "created_at": "={{ new Date().toISOString() }}"
    }
  }
}

// Then send alert
{
  "name": "Send Error Alert",
  "type": "n8n-nodes-base.emailSend",
  "parameters": {
    "toEmail": "admin@plumberpro.com",
    "subject": "n8n Workflow Error",
    "text": "={{ 'Workflow: ' + $workflow.name + '\nError: ' + $json.error.message }}"
  }
}
```

## Integration Patterns

### Slack Notifications

```json
{
  "name": "Slack Notification",
  "type": "n8n-nodes-base.slack",
  "parameters": {
    "resource": "message",
    "operation": "post",
    "channel": "#plumber-leads",
    "text": "",
    "attachments": [
      {
        "color": "={{ $json.urgency_score >= 8 ? 'danger' : $json.urgency_score >= 5 ? 'warning' : 'good' }}",
        "title": "={{ $json.urgency_emoji + ' New Lead - ' + $json.customer_name }}",
        "fields": [
          {
            "title": "Phone",
            "value": "={{ $json.customer_phone }}",
            "short": true
          },
          {
            "title": "Urgency",
            "value": "={{ $json.urgency_score + '/10' }}",
            "short": true
          },
          {
            "title": "Issue",
            "value": "={{ $json.issue_description }}",
            "short": false
          }
        ],
        "actions": [
          {
            "type": "button",
            "text": "View Lead",
            "url": "={{ $json.dashboard_link }}"
          }
        ]
      }
    ]
  }
}
```

### Google Calendar Integration

```json
{
  "name": "Create Calendar Event",
  "type": "n8n-nodes-base.googleCalendar",
  "parameters": {
    "operation": "create",
    "calendar": "primary",
    "summary": "={{ 'Lead: ' + $json.customer_name + ' - ' + $json.issue_type }}",
    "description": "={{ 'Customer: ' + $json.customer_name + '\nPhone: ' + $json.customer_phone + '\nAddress: ' + $json.customer_address + '\n\nIssue: ' + $json.issue_description }}",
    "start": "={{ new Date() }}",
    "end": "={{ new Date(Date.now() + 3600000) }}",
    "attendees": "={{ $json.client_email }}"
  }
}
```

### CRM Integration (Generic Webhook)

```json
{
  "name": "Send to CRM",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://crm.example.com/api/leads",
    "authentication": "headerAuth",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Authorization",
          "value": "Bearer {{ $env.CRM_API_KEY }}"
        }
      ]
    },
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "name",
          "value": "={{ $json.customer_name }}"
        },
        {
          "name": "phone",
          "value": "={{ $json.customer_phone }}"
        },
        {
          "name": "email",
          "value": "={{ $json.customer_email }}"
        },
        {
          "name": "address",
          "value": "={{ $json.customer_address }}"
        },
        {
          "name": "source",
          "value": "PlumberPro Widget"
        },
        {
          "name": "notes",
          "value": "={{ $json.issue_description }}"
        },
        {
          "name": "urgency",
          "value": "={{ $json.urgency_score }}"
        }
      ]
    }
  }
}
```

## Testing Workflows

### Manual Test Data

```json
{
  "event": "lead_captured",
  "timestamp": "2025-01-15T10:30:00Z",
  "client": {
    "id": "test-client-123",
    "name": "Test Plumbing Co",
    "phone": "+15555551234",
    "email": "test@plumbing.com",
    "on_call_phone": "+15555555678"
  },
  "lead": {
    "id": "test-lead-456",
    "customer_name": "Test Customer",
    "customer_phone": "+15555559999",
    "customer_email": "customer@test.com",
    "customer_address": "123 Test Street",
    "intent": "emergency_repair",
    "issue_description": "Test emergency issue",
    "urgency_score": 9,
    "source": "test"
  }
}
```

### Validation Checklist

- [ ] Emergency leads route within 30 seconds
- [ ] SMS delivered successfully (check Twilio logs)
- [ ] Email formatting looks good (test in multiple clients)
- [ ] Links in notifications work correctly
- [ ] Follow-up timers trigger at correct times
- [ ] Error handling catches failures gracefully
- [ ] Rate limiting prevents spam
- [ ] Business hours logic works correctly
- [ ] After-hours routing goes to on-call
- [ ] Escalation triggers when lead not contacted

## Best Practices

### 1. Use Environment Variables
- Store API keys in n8n environment variables
- Never hardcode credentials in workflows
- Use `{{ $env.VARIABLE_NAME }}` syntax

### 2. Add Error Handling
- Use Error Trigger workflow for all critical workflows
- Log errors to database for debugging
- Send alerts to admin on failures

### 3. Monitor Performance
- Set up workflow execution time alerts
- Track success/failure rates
- Monitor SMS/email delivery rates

### 4. Version Control
- Export workflows as JSON regularly
- Store in Git repository
- Document changes in commit messages

### 5. Test Thoroughly
- Use test data before going live
- Test all branches of Switch nodes
- Verify SMS/email formatting on actual devices
- Test with real phone numbers (but mark as test)

### 6. Optimize for Cost
- Batch low-priority notifications
- Use rate limiting to prevent spam
- Consider cheaper alternatives for non-urgent communications

### 7. Keep It Simple
- Don't over-engineer workflows
- Start with basic routing, add complexity as needed
- Document complex logic with comments in Function nodes
