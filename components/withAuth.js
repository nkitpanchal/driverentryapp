// components/withAuth.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getSession } from '../utils/session'; // Utility function to get session from cookies

const withAuth = (WrappedComponent, allowedRoles = []) => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      const session = getSession();

      if (!session) {
        // Store the current path in localStorage to redirect back after login
        localStorage.setItem('redirectPath', router.asPath);
        router.replace('/login');
        return;
      }

      // Check if the user's role is allowed to access this page
      if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
        router.replace('/'); // Redirect to the home page if the role is not allowed
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
