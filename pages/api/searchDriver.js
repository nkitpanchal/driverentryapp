// pages/api/searchDriver.js
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  const { query } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Search for a driver by vehicle number or driver ID
    const { data: driver, error } = await supabase
      .from('drivers')
      .select('*')
      .or(`vehicle_number.eq.${query},driver_id.eq.${query}`)
      .maybeSingle(); // Changed from .single() to .maybeSingle()

    // Log the response for debugging
    console.log('Driver fetched:', driver, 'Error:', error);

    if (error) {
      console.error('Error fetching driver:', error);
      return res.status(500).json({ error: error.message || 'Error fetching driver.' });
    }

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found.' });
    }

    // Return the found driver data
    return res.status(200).json({ driver });
  } catch (e) {
    console.error('Unexpected error occurred:', e);
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
}
