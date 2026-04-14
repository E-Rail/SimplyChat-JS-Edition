// SimplyChat Configuration
const SUPABASE_URL = 'https://xcshpvtjlegnyovbzjfe.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjc2hwdnRqbGVnbnlvdmJ6amZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0MTYxNjEsImV4cCI6MjA4MDk5MjE2MX0.nWvHwrzGxsClh_LTht1KHO9chLaRbaQWo92jXDCH30A';

// Initialize Supabase client
function initSupabase() {
    if (window.supabaseClient) {
        return window.supabaseClient;
    }
    if (window.supabase) {
        window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        return window.supabaseClient;
    }
    return null;
}
