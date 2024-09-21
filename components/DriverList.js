// components/DriverList.js
import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';
import styles from './DriverList.module.css'; // Import the CSS module

export default function DriverList() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showList, setShowList] = useState(false);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch('/api/getDrivers', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(`Error: ${errorData.error || 'Failed to fetch drivers'}`);
          setDrivers([]);
          setLoading(false);
          return;
        }

        const data = await response.json();
        setDrivers(data.drivers || []);
        setLoading(false);
      } catch (error) {
        setError(`Error: ${error.message || 'An error occurred during fetching.'}`);
        setDrivers([]);
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const exportToCSV = () => {
    const headers = ['Name', 'Phone Number', 'DL Number', 'Vehicle Number', 'Visit Count', 'Last Paid At'];
    const csvContent = [
      headers.join(','),
      ...drivers.map((driver) =>
        [
          driver.name,
          driver.phone_number,
          driver.dl_number,
          driver.vehicle_number,
          driver.visit_count,
          driver.last_paid_at || 'N/A',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'drivers_list.csv');
  };

  return (
    <div className={styles.listContainer}>
      <h2>Driver List</h2>
      <button className={styles.toggleButton} onClick={() => setShowList(!showList)}>
        {showList ? 'Hide Driver List' : 'Show Driver List'}
      </button>

      {showList && (
        <div>
          {loading ? (
            <p>Loading drivers...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : (
            <>
              <button onClick={exportToCSV} className={styles.exportButton}>
                Export to CSV
              </button>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone Number</th>
                    <th>DL Number</th>
                    <th>Vehicle Number</th>
                    <th>Visit Count</th>
                    <th>Last Paid At</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver) => (
                    <tr key={driver.driver_id}>
                      <td>{driver.name}</td>
                      <td>{driver.phone_number}</td>
                      <td>{driver.dl_number}</td>
                      <td>{driver.vehicle_number}</td>
                      <td>{driver.visit_count}</td>
                      <td>{driver.last_paid_at || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
}
