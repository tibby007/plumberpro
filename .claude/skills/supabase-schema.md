# Supabase Schema Skill

## Complete Database Schema

### Core Tables

```sql
-- Clients table (plumbing businesses using PlumberPro)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Business info
  business_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,

  -- Configuration
  service_area JSONB, -- {"zip_codes": ["12345", "12346"], "radius_miles": 25}
  business_hours JSONB, -- {"monday": {"open": "08:00", "close": "18:00"}, ...}
  on_call_phone TEXT,

  -- Subscription
  plan_type TEXT DEFAULT 'trial', -- 'trial', 'basic', 'pro', 'enterprise'
  subscription_status TEXT DEFAULT 'active', -- 'active', 'past_due', 'canceled'
  trial_ends_at TIMESTAMPTZ,

  -- Settings
  settings JSONB DEFAULT '{}', -- Custom settings, notification preferences, etc.

  -- Auth
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Leads table (potential customers)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Relationships
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  conversation_id UUID, -- Links to conversations table

  -- Customer info
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  customer_address TEXT,

  -- Lead classification
  intent TEXT NOT NULL, -- 'emergency_repair', 'quote_request', 'scheduling', 'general_inquiry', 'payment_billing'
  issue_type TEXT, -- 'water_heater', 'drain', 'leak', 'install', 'maintenance', 'other'
  issue_description TEXT,
  urgency_score INTEGER CHECK (urgency_score >= 1 AND urgency_score <= 10),
  urgency_level TEXT, -- 'critical', 'high', 'medium', 'low'

  -- Lead scoring and routing
  lead_score INTEGER DEFAULT 50 CHECK (lead_score >= 0 AND lead_score <= 100),
  assigned_to TEXT, -- Team member name or ID
  assigned_at TIMESTAMPTZ,

  -- Status tracking
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'scheduled', 'completed', 'closed', 'lost'
  substatus TEXT, -- 'awaiting_response', 'info_needed', 'quote_sent', 'appointment_set'
  contacted_at TIMESTAMPTZ,
  qualified_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Source tracking
  source TEXT NOT NULL, -- 'website_widget', 'phone_call', 'phone_call_live', 'email', 'referral'
  device TEXT, -- 'mobile', 'desktop', 'tablet'
  referrer TEXT,
  utm_params JSONB,

  -- Additional data
  notes TEXT,
  metadata JSONB DEFAULT '{}',

  -- Indexes
  CONSTRAINT leads_client_id_idx CHECK (client_id IS NOT NULL)
);

-- Conversations table (chat message history)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Relationships
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

  -- Conversation state
  status TEXT DEFAULT 'active', -- 'active', 'closed', 'archived'
  last_message_at TIMESTAMPTZ,
  message_count INTEGER DEFAULT 0,

  -- Context
  context JSONB DEFAULT '{}', -- Stores conversation state, collected info, etc.

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Messages table (individual chat messages)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Relationships
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,

  -- Message content
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,

  -- AI metadata
  intent TEXT, -- Classified intent for this message
  confidence REAL, -- 0.0 to 1.0
  function_call JSONB, -- If AI called a function

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Call logs table (voice call records)
CREATE TABLE call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Relationships
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,

  -- Call details
  call_sid TEXT UNIQUE, -- Twilio call SID
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  status TEXT, -- 'completed', 'busy', 'no-answer', 'failed', 'canceled'
  duration INTEGER, -- Seconds

  -- Recording
  recording_url TEXT,
  transcript TEXT,

  -- Classification
  intent TEXT,
  urgency TEXT,
  sentiment TEXT, -- 'positive', 'neutral', 'negative'

  -- Outcome
  lead_created BOOLEAN DEFAULT false,
  call_outcome TEXT, -- 'customer-ended-call', 'assistant-ended-call', 'transferred', 'voicemail'

  -- Performance
  first_response_time INTEGER, -- Milliseconds

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Team members table (plumber's staff)
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Relationships
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,

  -- Member info
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  role TEXT NOT NULL, -- 'plumber', 'sales', 'csr', 'manager', 'owner'

  -- Availability
  is_available BOOLEAN DEFAULT true,
  current_load INTEGER DEFAULT 0, -- Number of active leads
  max_load INTEGER DEFAULT 5,

  -- Specialization
  specialties TEXT[], -- ['water_heater', 'drain', 'emergency', 'commercial']
  service_area JSONB, -- Geographic area they cover

  -- Schedule
  schedule JSONB, -- Weekly schedule, on-call rotation

  -- Tracking
  last_assigned_at TIMESTAMPTZ,
  total_leads_assigned INTEGER DEFAULT 0,

  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- Widget settings table (customization per client)
CREATE TABLE widget_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Relationships
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Appearance
  primary_color TEXT DEFAULT '#3B82F6',
  greeting_message TEXT DEFAULT 'Hi! How can we help you today?',
  company_logo_url TEXT,

  -- Behavior
  enable_text_widget BOOLEAN DEFAULT true,
  enable_voice_widget BOOLEAN DEFAULT false,
  show_hours BOOLEAN DEFAULT true,

  -- AI configuration
  system_prompt TEXT,
  voice_persona TEXT DEFAULT 'Sarah', -- Voice AI persona name

  -- Settings
  settings JSONB DEFAULT '{}'
);

-- Analytics table (daily metrics)
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,

  -- Lead metrics
  total_leads INTEGER DEFAULT 0,
  leads_by_intent JSONB DEFAULT '{}', -- {"emergency": 5, "quote": 10, ...}
  leads_by_source JSONB DEFAULT '{}', -- {"website": 10, "phone": 5, ...}

  -- Conversion metrics
  leads_contacted INTEGER DEFAULT 0,
  leads_qualified INTEGER DEFAULT 0,
  leads_scheduled INTEGER DEFAULT 0,
  leads_completed INTEGER DEFAULT 0,
  leads_lost INTEGER DEFAULT 0,

  -- Response metrics
  avg_response_time INTEGER, -- Seconds
  avg_lead_score REAL,

  -- Call metrics
  total_calls INTEGER DEFAULT 0,
  avg_call_duration INTEGER, -- Seconds
  calls_converted_to_leads INTEGER DEFAULT 0,

  -- Revenue (if tracked)
  estimated_revenue REAL,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  UNIQUE(client_id, date)
);
```

### Indexes for Performance

```sql
-- Leads indexes
CREATE INDEX leads_client_id_idx ON leads(client_id);
CREATE INDEX leads_status_idx ON leads(status);
CREATE INDEX leads_intent_idx ON leads(intent);
CREATE INDEX leads_created_at_idx ON leads(created_at DESC);
CREATE INDEX leads_urgency_score_idx ON leads(urgency_score DESC);
CREATE INDEX leads_assigned_to_idx ON leads(assigned_to) WHERE assigned_to IS NOT NULL;

-- Conversations indexes
CREATE INDEX conversations_client_id_idx ON conversations(client_id);
CREATE INDEX conversations_lead_id_idx ON conversations(lead_id);
CREATE INDEX conversations_status_idx ON conversations(status);
CREATE INDEX conversations_last_message_at_idx ON conversations(last_message_at DESC);

-- Messages indexes
CREATE INDEX messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX messages_created_at_idx ON messages(created_at DESC);

-- Call logs indexes
CREATE INDEX call_logs_client_id_idx ON call_logs(client_id);
CREATE INDEX call_logs_lead_id_idx ON call_logs(lead_id);
CREATE INDEX call_logs_created_at_idx ON call_logs(created_at DESC);
CREATE INDEX call_logs_call_sid_idx ON call_logs(call_sid);

-- Team members indexes
CREATE INDEX team_members_client_id_idx ON team_members(client_id);
CREATE INDEX team_members_is_available_idx ON team_members(is_available) WHERE is_available = true;

-- Analytics indexes
CREATE INDEX analytics_client_id_date_idx ON analytics(client_id, date DESC);
```

### Triggers

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-increment message count
CREATE OR REPLACE FUNCTION increment_message_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET
    message_count = message_count + 1,
    last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_conversation_message_count AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION increment_message_count();
```

## Common Queries

### Get client with leads
```sql
SELECT
  c.*,
  COUNT(l.id) as total_leads,
  COUNT(CASE WHEN l.status = 'new' THEN 1 END) as new_leads,
  COUNT(CASE WHEN l.status = 'contacted' THEN 1 END) as contacted_leads,
  COUNT(CASE WHEN l.urgency_score >= 8 THEN 1 END) as urgent_leads
FROM clients c
LEFT JOIN leads l ON l.client_id = c.id
WHERE c.id = $1
GROUP BY c.id;
```

### Get leads with conversation
```sql
SELECT
  l.*,
  c.id as conversation_id,
  c.message_count,
  c.last_message_at,
  (
    SELECT json_agg(
      json_build_object(
        'role', m.role,
        'content', m.content,
        'created_at', m.created_at
      ) ORDER BY m.created_at ASC
    )
    FROM messages m
    WHERE m.conversation_id = c.id
  ) as messages
FROM leads l
LEFT JOIN conversations c ON c.lead_id = l.id
WHERE l.client_id = $1
ORDER BY l.created_at DESC
LIMIT 50;
```

### Get dashboard summary
```sql
SELECT
  COUNT(*) as total_leads,
  COUNT(CASE WHEN status = 'new' THEN 1 END) as new_leads,
  COUNT(CASE WHEN urgency_score >= 8 THEN 1 END) as urgent_leads,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as leads_today,
  AVG(lead_score) as avg_lead_score,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_leads
FROM leads
WHERE client_id = $1
  AND created_at > NOW() - INTERVAL '30 days';
```

### Get leads by status (for Kanban board)
```sql
SELECT
  status,
  json_agg(
    json_build_object(
      'id', id,
      'customer_name', customer_name,
      'customer_phone', customer_phone,
      'intent', intent,
      'issue_description', issue_description,
      'urgency_score', urgency_score,
      'lead_score', lead_score,
      'created_at', created_at
    ) ORDER BY urgency_score DESC, created_at DESC
  ) as leads
FROM leads
WHERE client_id = $1
  AND status IN ('new', 'contacted', 'qualified', 'scheduled')
GROUP BY status;
```

### Update lead status
```sql
UPDATE leads
SET
  status = $2,
  contacted_at = CASE WHEN $2 = 'contacted' THEN NOW() ELSE contacted_at END,
  qualified_at = CASE WHEN $2 = 'qualified' THEN NOW() ELSE qualified_at END,
  completed_at = CASE WHEN $2 = 'completed' THEN NOW() ELSE completed_at END,
  notes = COALESCE($3, notes)
WHERE id = $1
RETURNING *;
```

### Assign lead to team member
```sql
WITH updated_lead AS (
  UPDATE leads
  SET
    assigned_to = $2,
    assigned_at = NOW()
  WHERE id = $1
  RETURNING *
)
UPDATE team_members
SET
  current_load = current_load + 1,
  last_assigned_at = NOW(),
  total_leads_assigned = total_leads_assigned + 1
WHERE name = $2
RETURNING (SELECT * FROM updated_lead);
```

### Get next available team member (round-robin)
```sql
SELECT *
FROM team_members
WHERE client_id = $1
  AND is_available = true
  AND current_load < max_load
  AND role = $2  -- 'plumber', 'sales', 'csr'
ORDER BY current_load ASC, last_assigned_at ASC NULLS FIRST
LIMIT 1;
```

### Get recent call logs with lead info
```sql
SELECT
  cl.*,
  l.customer_name,
  l.intent as lead_intent,
  l.status as lead_status
FROM call_logs cl
LEFT JOIN leads l ON l.id = cl.lead_id
WHERE cl.client_id = $1
ORDER BY cl.created_at DESC
LIMIT 50;
```

### Get analytics for date range
```sql
SELECT
  date,
  total_leads,
  leads_by_intent,
  leads_contacted,
  leads_completed,
  avg_response_time,
  total_calls
FROM analytics
WHERE client_id = $1
  AND date BETWEEN $2 AND $3
ORDER BY date DESC;
```

### Search leads
```sql
SELECT *
FROM leads
WHERE client_id = $1
  AND (
    customer_name ILIKE '%' || $2 || '%'
    OR customer_phone ILIKE '%' || $2 || '%'
    OR customer_email ILIKE '%' || $2 || '%'
    OR issue_description ILIKE '%' || $2 || '%'
  )
ORDER BY created_at DESC
LIMIT 50;
```

## Row Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE widget_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Clients can only see their own data
CREATE POLICY "Clients see own data"
ON clients FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Clients update own data"
ON clients FOR UPDATE
USING (user_id = auth.uid());

-- Leads policies
CREATE POLICY "Clients see own leads"
ON leads FOR SELECT
USING (client_id IN (
  SELECT id FROM clients WHERE user_id = auth.uid()
));

CREATE POLICY "Clients insert own leads"
ON leads FOR INSERT
WITH CHECK (client_id IN (
  SELECT id FROM clients WHERE user_id = auth.uid()
));

CREATE POLICY "Clients update own leads"
ON leads FOR UPDATE
USING (client_id IN (
  SELECT id FROM clients WHERE user_id = auth.uid()
));

-- Conversations policies
CREATE POLICY "Clients see own conversations"
ON conversations FOR SELECT
USING (client_id IN (
  SELECT id FROM clients WHERE user_id = auth.uid()
));

CREATE POLICY "Clients insert own conversations"
ON conversations FOR INSERT
WITH CHECK (client_id IN (
  SELECT id FROM clients WHERE user_id = auth.uid()
));

-- Messages policies
CREATE POLICY "Clients see own messages"
ON messages FOR SELECT
USING (client_id IN (
  SELECT id FROM clients WHERE user_id = auth.uid()
));

CREATE POLICY "Clients insert own messages"
ON messages FOR INSERT
WITH CHECK (client_id IN (
  SELECT id FROM clients WHERE user_id = auth.uid()
));

-- Call logs policies
CREATE POLICY "Clients see own call logs"
ON call_logs FOR SELECT
USING (client_id IN (
  SELECT id FROM clients WHERE user_id = auth.uid()
));

-- Team members policies
CREATE POLICY "Clients see own team"
ON team_members FOR ALL
USING (client_id IN (
  SELECT id FROM clients WHERE user_id = auth.uid()
));

-- Widget settings policies
CREATE POLICY "Clients see own widget settings"
ON widget_settings FOR ALL
USING (client_id IN (
  SELECT id FROM clients WHERE user_id = auth.uid()
));

-- Analytics policies
CREATE POLICY "Clients see own analytics"
ON analytics FOR SELECT
USING (client_id IN (
  SELECT id FROM clients WHERE user_id = auth.uid()
));

-- Service role bypasses RLS (for API routes)
-- No additional policies needed - service role has full access
```

## Real-Time Subscriptions

### Subscribe to new leads
```typescript
// Subscribe to new leads for current client
const subscription = supabase
  .channel('leads_channel')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'leads',
      filter: `client_id=eq.${clientId}`
    },
    (payload) => {
      console.log('New lead:', payload.new);
      // Trigger notification, update UI, play sound, etc.
      showNotification({
        title: 'New Lead',
        message: `${payload.new.customer_name} - ${payload.new.intent}`,
        urgency: payload.new.urgency_score >= 8 ? 'high' : 'normal'
      });
    }
  )
  .subscribe();
```

### Subscribe to lead status changes
```typescript
// Watch for status updates on specific lead
const subscription = supabase
  .channel('lead_updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'leads',
      filter: `id=eq.${leadId}`
    },
    (payload) => {
      console.log('Lead updated:', payload.new);
      // Update UI with new status
    }
  )
  .subscribe();
```

### Subscribe to new messages in conversation
```typescript
// Real-time chat messages
const subscription = supabase
  .channel(`conversation_${conversationId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    },
    (payload) => {
      console.log('New message:', payload.new);
      // Append to chat UI
      appendMessage(payload.new);
    }
  )
  .subscribe();
```

### Subscribe to incoming calls
```typescript
// Watch for new phone calls
const subscription = supabase
  .channel('calls_channel')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'call_logs',
      filter: `client_id=eq.${clientId}`
    },
    (payload) => {
      console.log('Incoming call:', payload.new);
      // Show call notification
      if (payload.new.status === 'in-progress') {
        showCallAlert({
          from: payload.new.from_number,
          duration: 0
        });
      }
    }
  )
  .subscribe();
```

## TypeScript Types

```typescript
// Auto-generated from Supabase
export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          business_name: string;
          owner_name: string;
          email: string;
          phone: string | null;
          address: string | null;
          service_area: Json | null;
          business_hours: Json | null;
          on_call_phone: string | null;
          plan_type: string;
          subscription_status: string;
          trial_ends_at: string | null;
          settings: Json;
          user_id: string;
        };
        Insert: {
          id?: string;
          business_name: string;
          owner_name: string;
          email: string;
          phone?: string;
          // ... other fields
        };
        Update: {
          business_name?: string;
          owner_name?: string;
          // ... other fields
        };
      };
      leads: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          client_id: string;
          conversation_id: string | null;
          customer_name: string;
          customer_phone: string | null;
          customer_email: string | null;
          customer_address: string | null;
          intent: string;
          issue_type: string | null;
          issue_description: string | null;
          urgency_score: number | null;
          urgency_level: string | null;
          lead_score: number;
          assigned_to: string | null;
          assigned_at: string | null;
          status: string;
          substatus: string | null;
          contacted_at: string | null;
          qualified_at: string | null;
          completed_at: string | null;
          source: string;
          device: string | null;
          referrer: string | null;
          utm_params: Json | null;
          notes: string | null;
          metadata: Json;
        };
        // ... Insert and Update types
      };
      // ... other tables
    };
  };
};
```

## Best Practices

### 1. Always Use Indexes
- Query by client_id frequently → indexed
- Query by status and created_at → indexed
- Full-text search → use `tsvector` for large text fields

### 2. Use Transactions for Complex Operations
```typescript
const { data, error } = await supabase.rpc('create_lead_with_conversation', {
  p_client_id: clientId,
  p_customer_name: 'John Doe',
  p_customer_phone: '555-1234',
  p_intent: 'emergency_repair'
});
```

### 3. Batch Updates When Possible
```sql
-- Update multiple leads at once
UPDATE leads
SET status = 'contacted', contacted_at = NOW()
WHERE id = ANY($1::uuid[]);
```

### 4. Use Materialized Views for Heavy Analytics
```sql
CREATE MATERIALIZED VIEW client_dashboard_stats AS
SELECT
  client_id,
  COUNT(*) as total_leads,
  AVG(lead_score) as avg_score,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count
FROM leads
GROUP BY client_id;

-- Refresh periodically
REFRESH MATERIALIZED VIEW client_dashboard_stats;
```

### 5. Partition Large Tables (if needed)
```sql
-- Partition leads by created_at (monthly)
CREATE TABLE leads_2024_01 PARTITION OF leads
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```
