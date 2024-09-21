// pages/index.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // Ensure you have the correct path
import withAuth from '../components/withAuth'; // Import the withAuth component
import LogoutButton from '../components/LogoutButton'; // Import the LogoutButton component
import { saveAs } from 'file-saver'; // For exporting CSV
import UserInfo from '../components/UserInfo'; // Import the UserInfo component to show logged-in user details

function IndexPage() {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [driverName, setDriverName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dlNumber, setDlNumber] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Validation patterns
  const phonePattern = /^[6-9]\d{9}$/; // Matches Indian mobile numbers starting with 6-9 and having 10 digits
  const dlPattern = /^[A-Z]{2}\d{2}\s?\d{4}\s?\d{7}$/; // Matches the Indian driving license pattern
  const vehicleNumberPattern = /^([A-Z]{2}\d{2}[A-Z]{1,2}\d{4})|(\d{2}BH\d{4}[A-Z]{2})$/; // Matches vehicle number formats

  // Function to handle driver entry submission
  const handleDriverEntry = async (e) => {
    e.preventDefault();

    // Validate phone number
    if (!phonePattern.test(phoneNumber)) {
      setMessage('Invalid phone number. Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    // Validate driving license number
    if (!dlPattern.test(dlNumber)) {
      setMessage(
        'Invalid driving license number. The correct format is SS RR YYYY NNNNNNN (e.g., MH12 2001 1234567).'
      );
      return;
    }

    // Validate vehicle number
    if (!vehicleNumberPattern.test(vehicleNumber.replace(/\s+/g, ''))) {
      setMessage(
        'Invalid vehicle number. Please ensure it matches the correct format (e.g., MH XX AB 1234 or 23BH2222XX).'
      );
      return;
    }

    // Check if the driving license number already exists
    const { data: existingDriver, error: fetchError } = await supabase
      .from('drivers')
      .select('*')
      .eq('dl_number', dlNumber)
      .single(); // Get a single result if exists

    if (fetchError && fetchError.code !== 'PGRST116') {
      // 'PGRST116' indicates no rows found; ignore this error as it means no matching driver
      setMessage(`Error checking existing driver: ${fetchError.message}`);
      return;
    }

    if (existingDriver) {
      // If DL number exists, update the visit count of the existing driver
      const updatedVisitCount = existingDriver.visit_count + 1;
      const { error: updateError } = await supabase
        .from('drivers')
        .update({ visit_count: updatedVisitCount })
        .eq('id', existingDriver.id);

      if (updateError) {
        setMessage(`Error updating visit count: ${updateError.message}`);
      } else {
        setMessage(`Visit count updated for DL: ${dlNumber}. New count: ${updatedVisitCount}.`);
        setDriverName('');
        setPhoneNumber('');
        setDlNumber('');
        setVehicleNumber('');
        fetchDrivers(); // Refresh the drivers list
      }
    } else {
      // Insert a new driver if the DL number does not exist
      const { error } = await supabase.from('drivers').insert([
        {
          vehicle_number: vehicleNumber,
          name: driverName,
          phone_number: phoneNumber,
          dl_number: dlNumber,
          visit_count: 1,
        },
      ]);

      if (error) {
        setMessage(`Error adding entry: ${error.message}`);
      } else {
        setMessage('Driver entry added successfully!');
        setDriverName('');
        setPhoneNumber('');
        setDlNumber('');
        setVehicleNumber('');
        fetchDrivers(); // Refresh the drivers list
      }
    }
  };

  // Function to fetch all drivers
  const fetchDrivers = async () => {
    const { data, error } = await supabase.from('drivers').select('*');

    if (error) {
      setMessage(`Error fetching drivers: ${error.message}`);
    } else {
      setDrivers(data); // Make sure to use the data fetched here
    }
  };

  // Function to search drivers by vehicle number
  const handleSearch = () => {
    const filteredDrivers = drivers.filter((driver) =>
      driver.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setDrivers(filteredDrivers);
  };

  // Function to export driver data as CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Name', 'Phone Number', 'DL Number', 'Vehicle Number', 'Visit Count', 'Last Paid At'],
      ...drivers.map((driver) => [
        driver.name,
        driver.phone_number,
        driver.dl_number,
        driver.vehicle_number,
        driver.visit_count,
        driver.last_paid_at ? new Date(driver.last_paid_at).toLocaleString() : 'N/A',
      ]),
    ]
      .map((e) => e.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'drivers.csv');
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  return (
    <div style={{ display: 'flex' }}>
      <UserInfo /> {/* Display logged-in user information */}
      <div style={{ padding: '20px', flex: 1 }}>
        <h2>Driver Entry App</h2>

        {/* Driver Entry Form */}
        <form onSubmit={handleDriverEntry} style={{ maxWidth: '600px', margin: 'auto', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Driver Name"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            required
            style={{ padding: '10px', marginBottom: '10px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            style={{ padding: '10px', marginBottom: '10px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="Driving License Number (DL No.)"
            value={dlNumber}
            onChange={(e) => setDlNumber(e.target.value)}
            required
            style={{ padding: '10px', marginBottom: '10px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="Enter Vehicle Number"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            required
            style={{ padding: '10px', marginBottom: '10px', width: '100%' }}
          />
          <button
            type="submit"
            style={{
              padding: '10px',
              width: '100%',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Submit Entry
          </button>
        </form>

        {/* Message Display */}
        {message && <p style={{ color: 'red' }}>{message}</p>}

        {/* Search Driver Section */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search by Vehicle Number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '10px', marginRight: '10px' }}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: '10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </div>

        {/* Show Drivers and Export CSV Buttons */}
        <button
          onClick={fetchDrivers}
          style={{
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px',
          }}
        >
          Show All Drivers
        </button>

        <button
          onClick={exportToCSV}
          style={{
            padding: '10px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Export to CSV
        </button>

        <LogoutButton /> {/* Include the logout button */}

        {/* Display Driver List */}
        {drivers.length > 0 && (
          <table style={{ marginTop: '20px', width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Phone Number</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>DL Number</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Vehicle Number</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Visit Count</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Last Paid At</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{driver.name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{driver.phone_number}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{driver.dl_number}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{driver.vehicle_number}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{driver.visit_count}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {driver.last_paid_at ? new Date(driver.last_paid_at).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default withAuth(IndexPage); // Wrap the IndexPage with withAuth to protect it
