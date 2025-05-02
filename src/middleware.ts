import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const publicPaths = ['/', '/login', '/validate', '/api/certificates/validate'];
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith('/validate/') || path.startsWith('/api/auth/')
  );
  
  // Check if the path is for admin routes
  const isAdminPath = path.startsWith('/admin') || 
                      path.startsWith('/api/certificates/create') || 
                      path.startsWith('/api/certificates/list');
  
  if (!isAdminPath) {
    return NextResponse.next();
  }
  
  // Get the session token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "your-secret-for-hackathon-demo"
  });
  
  // Redirect to login if trying to access admin path without authentication
  if (!token && isAdminPath) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Match all paths except for static files, api routes we want to exclude, etc.
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
