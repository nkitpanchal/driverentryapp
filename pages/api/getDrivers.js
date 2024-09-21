// pages/api/getDrivers.js
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Fetch all drivers
    const { data: drivers, error } = await supabase.from('drivers').select('*');

    if (error) {
      console.error('Error fetching drivers:', error);
      return res.status(500).json({ error: error.message || 'Error fetching drivers.' });
    }

    return res.status(200).json({ drivers });
  } catch (e) {
    console.error('Unexpected error occurred:', e);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
