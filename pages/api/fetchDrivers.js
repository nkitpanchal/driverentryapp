// pages/api/fetchDrivers.js
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Fetch data from the 'drivers' table
    const { data, error } = await supabase.from('drivers').select('*');

    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(200).json(data);
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
