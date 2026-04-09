import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dfsewbhkwnqwoygynhlb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmc2V3Ymhrd25xd295Z3luaGxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNDY3OTksImV4cCI6MjA4MzgyMjc5OX0.laVBiQgU2526-08uPcXmFLzvybSqpRlO1OpCaUCeuZc';

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
};
