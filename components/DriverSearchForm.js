// components/DriverSearchForm.js
import { useState } from 'react';

export default function DriverSearchForm() {
  const [searchQuery, setSearchQuery] = useState('');
  const [driver, setDriver] = useState(null);
  const [message, setMessage] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/searchDriver?query=${searchQuery}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error || 'Failed to fetch driver'}`);
        setDriver(null);
        return;
      }

      const data = await response.json();

      if (data?.error) {
        setMessage(`Error: ${data.error}`);
        setDriver(null);
      } else if (data?.driver) {
        setDriver(data.driver);
        setMessage('');
      } else {
        setMessage('No driver found.');
        setDriver(null);
      }
    } catch (error) {
      setMessage(`Error: ${error.message || 'An error occurred during search.'}`);
      setDriver(null);
    }
  };

  return (
    <div>
      <h2>Search Driver</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by Vehicle Number or Driver ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          required
        />
        <button type="submit">Search</button>
      </form>

      {message && <p>{message}</p>}

      {driver && (
        <div>
          <h3>Driver Details</h3>
          <p>Name: {driver.name}</p>
          <p>Phone Number: {driver.phone_number}</p>
          <p>DL Number: {driver.dl_number}</p>
          <p>Vehicle Number: {driver.vehicle_number}</p>
          <p>Visit Count: {driver.visit_count}</p>
          <p>Last Paid At: {driver.last_paid_at || 'N/A'}</p>
        </div>
      )}
    </div>
  );
}
