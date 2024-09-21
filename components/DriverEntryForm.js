// components/DriverEntryForm.js
import { useState } from 'react';
import styles from './DriverEntryForm.module.css'; // Import the CSS module

export default function DriverEntryForm() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dlNumber, setDlNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [message, setMessage] = useState('');

  const generateDriverId = () => {
    return `DRIVER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const driverId = generateDriverId();

    try {
      const response = await fetch('/api/driverEntry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phoneNumber,
          dlNumber,
          vehicleNumber,
          driverId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(`Error: ${data.error || 'Failed to submit entry'}`);
      } else if (data.message === 'Pay the driver') {
        setMessage('Driver needs to be paid. Count reset.');
      } else {
        setMessage(`Driver added/updated. Current visits: ${data.visit_count}`);
      }

      setName('');
      setPhoneNumber('');
      setDlNumber('');
      setVehicleNumber('');
    } catch (error) {
      setMessage(`Error: ${error.message || 'An error occurred during submission.'}`);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h2>Driver Entry</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.inputField}
          placeholder="Driver Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          className={styles.inputField}
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        <input
          type="text"
          className={styles.inputField}
          placeholder="Driving License Number"
          value={dlNumber}
          onChange={(e) => setDlNumber(e.target.value)}
          required
        />
        <input
          type="text"
          className={styles.inputField}
          placeholder="Enter Vehicle Number"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          required
        />
        <button type="submit" className={styles.submitButton}>
          Submit Entry
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
