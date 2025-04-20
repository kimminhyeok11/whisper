import { createClient } from '@supabase/supabase-js';

// 환경 변수가 있으면 사용하고, 없으면 하드코딩된 값 사용
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ikrfupamzbidbvixapsw.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrcmZ1cGFtemJpZGJ2aXhhcHN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NjkyMzMsImV4cCI6MjA2MDU0NTIzM30.FD-RX7wa61prUOJFriJd_mvXySRym5YOeNBgcfAYHNE';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 