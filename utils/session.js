// utils/session.js
import Cookies from 'js-cookie';

export const getSession = () => {
  const session = Cookies.get('admin_session');
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
};
