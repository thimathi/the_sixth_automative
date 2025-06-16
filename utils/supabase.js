import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lvseutkmlxexzpdwqjkn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2c2V1dGttbHhleHpwZHdxamtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MDcxMDEsImV4cCI6MjA2NTE4MzEwMX0.5rKTjK7xISNLnZR2sqRj3N7AsfV5SEjmIu28t2u_Yd8';

export const supabase = createClient(supabaseUrl, supabaseKey);