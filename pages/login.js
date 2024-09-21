// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import bcrypt from 'bcryptjs';
import Cookies from 'js-cookie'; // For handling cookies

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Fetch the admin user by username
    const { data: admin, error: fetchError } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    if (fetchError || !admin) {
      setError('Login failed. Incorrect username or password.');
      return;
    }

    // Compare the hashed password
    const isPasswordCorrect = bcrypt.compareSync(password, admin.password_hash);
    if (!isPasswordCorrect) {
      setError('Login failed. Incorrect username or password.');
      return;
    }

    // Save the session
    Cookies.set('admin_session', JSON.stringify({ username: admin.username, role: admin.role }), {
      expires: 1, // Cookie expires in 1 day
    });

    // Redirect based on role or previous destination
    const intendedDestination = localStorage.getItem('redirectPath') || '/'; // Default to home if no redirectPath is stored
    if (admin.role === 'superadmin') {
      router.push(intendedDestination === '/login' ? '/admin-dashboard' : intendedDestination);
    } else {
      router.push(intendedDestination === '/login' ? '/' : intendedDestination); // Redirect to home for regular admins
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: '10px', marginBottom: '10px', width: '100%' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          Login
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}
