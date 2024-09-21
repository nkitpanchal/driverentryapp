// components/withAuth.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';

const withAuth = (WrappedComponent) => {
  const AuthenticatedComponent = (props) => {
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        const user = supabase.auth.user();

        if (!user) {
          // If the user is not authenticated, redirect to the login page
          router.push('/login');
        }
      };

      checkAuth();
    }, [router]);

    // Render the wrapped component
    return <WrappedComponent {...props} />;
  };

  // Set display name for better debugging
  AuthenticatedComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthenticatedComponent;
};

export default withAuth;
