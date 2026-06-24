const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://aws-1-us-west-1.pooler.supabase.com', process.env.SUPABASE_SERVICE_KEY); // wait no I need the url
