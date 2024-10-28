import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cdocklzrlqrtlvzhfcqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkb2NrbHpybHFydGx2emhmY3FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwOTk0ODUsImV4cCI6MjA0NDY3NTQ4NX0.O6iJDDv6TzQ8osTzKlZlLUaovFUamniGb_v7MZ1vIss';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

