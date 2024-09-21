// pages/admin-dashboard.js
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient'; // Make sure the path to your supabase client is correct
import bcrypt from 'bcryptjs';
import withAuth from '../components/withAuth'; // Import the withAuth component
import LogoutButton from '../components/LogoutButton'; // Import the LogoutButton component
import UserInfo from '../components/UserInfo'; // Import the UserInfo component to show logged-in user details

function AdminDashboard() {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [message, setMessage] = useState('');
  const [admins, setAdmins] = useState([]);
  const [editingAdmin, setEditingAdmin] = useState(null);

  // Fetch all admins
  const fetchAdmins = async () => {
    const { data, error } = await supabase.from('admins').select('*');
    if (error) {
      setMessage(`Error fetching admins: ${error.message}`);
    } else {
      setAdmins(data);
    }
  };

  // Add or update admin
  const handleAddOrUpdateAdmin = async (e) => {
    e.preventDefault();
    const passwordHash = bcrypt.hashSync(password, 10);
    if (editingAdmin) {
      // Update existing admin
      const { error } = await supabase
        .from('admins')
        .update({
          username,
          full_name: fullName,
          password_hash: passwordHash,
          role,
        })
        .eq('id', editingAdmin.id);

      if (error) {
        setMessage(`Error updating admin: ${error.message}`);
      } else {
        setMessage('Admin updated successfully!');
        setEditingAdmin(null);
      }
    } else {
      // Add new admin
      const { error } = await supabase
        .from('admins')
        .insert([{ username, full_name: fullName, password_hash: passwordHash, role }]);

      if (error) {
        setMessage(`Error adding admin: ${error.message}`);
      } else {
        setMessage('New admin added successfully!');
      }
    }

    setUsername('');
    setFullName('');
    setPassword('');
    fetchAdmins(); // Refresh the list after adding or updating
  };

  // Edit admin
  const handleEditAdmin = (admin) => {
    setEditingAdmin(admin);
    setUsername(admin.username);
    setFullName(admin.full_name);
    setRole(admin.role);
    setMessage('');
  };

  // Delete admin
  const handleDeleteAdmin = async (adminId) => {
    const { error } = await supabase.from('admins').delete().eq('id', adminId);
    if (error) {
      setMessage(`Error deleting admin: ${error.message}`);
    } else {
      setMessage('Admin deleted successfully!');
      fetchAdmins(); // Refresh the list after deletion
    }
  };

  // Reset the form and cancel editing
  const handleCancelEdit = () => {
    setEditingAdmin(null);
    setUsername('');
    setFullName('');
    setPassword('');
    setRole('admin');
    setMessage('');
  };

  return (
    <div style={{ display: 'flex' }}>
      <UserInfo /> {/* Display logged-in user information */}
      <div style={{ padding: '20px', flex: 1 }}>
        <h2>Super Admin Dashboard</h2>
        <form onSubmit={handleAddOrUpdateAdmin} style={{ maxWidth: '400px', margin: 'auto' }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ padding: '10px', marginBottom: '10px', width: '100%' }}
          />
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={{ padding: '10px', marginBottom: '10px', width: '100%' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!editingAdmin} // Make password optional when editing
            style={{ padding: '10px', marginBottom: '10px', width: '100%' }}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ padding: '10px', marginBottom: '10px', width: '100%' }}
          >
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
          <button
            type="submit"
            style={{
              padding: '10px',
              width: '100%',
              backgroundColor: editingAdmin ? '#ffc107' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            {editingAdmin ? 'Update Admin' : 'Add Admin'}
          </button>
          {editingAdmin && (
            <button
              type="button"
              onClick={handleCancelEdit}
              style={{
                padding: '10px',
                width: '100%',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '10px',
              }}
            >
              Cancel Edit
            </button>
          )}
          {message && <p>{message}</p>}
        </form>
        
        <button
          onClick={fetchAdmins}
          style={{
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px',
          }}
        >
          Show All Admins
        </button>

        {/* Display list of admins */}
        {admins.length > 0 && (
          <table style={{ marginTop: '20px', width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Username</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Full Name</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Role</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{admin.username}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{admin.full_name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{admin.role}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <button
                      onClick={() => handleEditAdmin(admin)}
                      style={{
                        padding: '5px 10px',
                        marginRight: '5px',
                        backgroundColor: '#ffc107',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAdmin(admin.id)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <LogoutButton /> {/* Add the Logout button here */}
      </div>
    </div>
  );
}

// Wrap the component with withAuth and restrict access to superadmin only
export default withAuth(AdminDashboard, ['superadmin']);
