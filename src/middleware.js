import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = !!token;

  // Get the pathname of the request
  const path = req.nextUrl.pathname;

  // Define public paths that don't require authentication
  const publicPaths = ['/', '/auth/signin'];
  const isPublicPath = publicPaths.includes(path);

  // If the path is public or it's an API route, allow the request
  if (isPublicPath || path.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // If the user is not authenticated and trying to access a protected route, redirect to signin
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  // If the user is authenticated and trying to access a protected route, allow the request
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
