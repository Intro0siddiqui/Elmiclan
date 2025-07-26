import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // const sessionCookie = request.cookies.get('elmiclan-user'); // A placeholder for your actual session cookie

  // Protect all dashboard routes
  // if (request.nextUrl.pathname.startsWith('/dashboard')) {
  //   if (!sessionCookie) {
  //     // Redirect unauthenticated users to the login page
  //     return NextResponse.redirect(new URL('/', request.url));
  //   }

    // Add more complex, rank-based logic here in the future
    // For example, decode the session cookie/token to get the user's rank
    // and redirect if they don't have access to a specific path.
  // }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/dashboard/:path*',
};
