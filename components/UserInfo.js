// components/UserInfo.js
import { useEffect, useState } from 'react';
import { getSession } from '../utils/session'; // Utility to get session data

function UserInfo() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
    }
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8f9fa', width: '200px' }}>
      <h4>User Information</h4>
      <p>
        <strong>Username:</strong> {user.username}
      </p>
      <p>
        <strong>Role:</strong> {user.role}
      </p>
    </div>
  );
}

export default UserInfo;
