import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

/**
 * Helper function to check if user is authenticated admin
 * Use in API routes that require admin access
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any)?.role !== 'admin') {
    return {
      authenticated: false,
      session: null,
    };
  }

  return {
    authenticated: true,
    session,
  };
}
