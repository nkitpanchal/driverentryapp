// pages/api/driverEntry.js
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { name, phoneNumber, dlNumber, vehicleNumber, driverId } = req.body;

    try {
      // Attempt to find the driver by vehicle number or driver ID
      let { data: driver, error } = await supabase
        .from('drivers')
        .select('*')
        .or(`vehicle_number.eq.${vehicleNumber},driver_id.eq.${driverId}`)
        .single();

      console.log('Fetched driver:', driver, 'Error:', error);

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching driver:', error);
        return res.status(500).json({ error: error.message || 'Error fetching driver.' });
      }

      if (!driver) {
        // Insert a new driver if none is found
        const { data: newDriver, error: createError } = await supabase
          .from('drivers')
          .insert([
            {
              name,
              phone_number: phoneNumber,
              dl_number: dlNumber,
              vehicle_number: vehicleNumber,
              driver_id: driverId,
              visit_count: 1,
            },
          ])
          .select() // Ensure data is returned
          .single(); // Expecting exactly one record

        console.log('Inserted new driver:', newDriver, 'Error:', createError);

        if (createError || !newDriver) {
          console.error('Error creating driver:', createError);
          return res.status(500).json({ error: createError?.message || 'Error creating driver.' });
        }

        return res.status(200).json({ visit_count: newDriver.visit_count });
      } else {
        // Check visit count logic
        if (driver.visit_count >= 4) {
          // Reset the visit count after payment
          const { data: updatedDriver, error: updateError } = await supabase
            .from('drivers')
            .update({ visit_count: 0, last_paid_at: new Date() })
            .eq('id', driver.id)
            .select() // Ensure data is returned
            .single();

          console.log('Reset visit count:', updatedDriver, 'Error:', updateError);

          if (updateError || !updatedDriver) {
            console.error('Error resetting visit count:', updateError);
            return res.status(500).json({ error: updateError?.message || 'Error resetting visit count.' });
          }

          return res.status(200).json({ message: 'Pay the driver', visit_count: 0 });
        } else {
          // Increment the visit count
          const { data: updatedDriver, error: incrementError } = await supabase
            .from('drivers')
            .update({ visit_count: driver.visit_count + 1 })
            .eq('id', driver.id)
            .select() // Ensure data is returned
            .single();

          console.log('Updated visit count:', updatedDriver, 'Error:', incrementError);

          if (incrementError || !updatedDriver) {
            console.error('Error updating visit count:', incrementError);
            return res.status(500).json({ error: incrementError?.message || 'Error updating visit count.' });
          }

          return res.status(200).json({ visit_count: updatedDriver.visit_count });
        }
      }
    } catch (e) {
      console.error('Unexpected error occurred:', e);
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
}
