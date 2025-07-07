// test-supabase.js
import { createClient } from '@supabase/supabase-js';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const supabase = createClient(
  'https://snskgnsnvnpsofbuglfo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuc2tnbnNudm5wc29mYnVnbGZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MTA1OTAsImV4cCI6MjA2NDE4NjU5MH0.7c97w3BSZQzWhVLxx6_QIrMo8557562bLnRbefUx0n8'
);

(async () => {
  try {
    const { data, error } = await supabase.from('Users').select('*');
    console.log('DATA:', data);
    console.log('ERROR:', error);
  } catch (err) {
    console.error('FALLO FETCH:', err);
  }
})();
