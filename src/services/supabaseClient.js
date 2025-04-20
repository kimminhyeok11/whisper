import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ikrfupamzbidbvixapsw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrcmZ1cGFtemJpZGJ2aXhhcHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NjkyMzMsImV4cCI6MjA2MDU0NTIzM30.FD-RX7wa61prUOJFriJd_mvXySRym5YOeNBgcfAYHNE';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 