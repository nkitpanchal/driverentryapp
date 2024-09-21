// components/LogoutButton.js
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Remove the session cookie
    Cookies.remove('admin_session');
    
    // Redirect to the login page
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '10px 20px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '20px',
      }}
    >
      Logout
    </button>
  );
}
