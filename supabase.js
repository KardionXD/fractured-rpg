const SUPABASE_URL = 'https://dgwvyovwlwrjkqgoutzm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnd3Z5b3Z3bHdyamtxZ291dHptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4OTc5MDksImV4cCI6MjA5NzQ3MzkwOX0._DOAK7K902X7y3XnSMKyRBGlc8w8ZYwzwSNjkaUERHo';
const { createClient } = window.supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);
