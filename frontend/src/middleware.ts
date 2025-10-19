import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/forgot-password'];

// Define role-based route permissions
const roleRoutes = {
  admin: ['/admin'],
  doctor: ['/doctor'],
  patient: ['/patient'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies or localStorage (via request headers)
  const token = request.cookies.get('auth_token')?.value;
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  
  // Allow access to public routes and static files
  if (isPublicRoute || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (token && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
      // Try to decode the token to get user role
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role;
        
        // Redirect to appropriate dashboard
        if (role === 'admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        } else if (role === 'doctor') {
          return NextResponse.redirect(new URL('/doctor', request.url));
        } else if (role === 'patient') {
          return NextResponse.redirect(new URL('/patient', request.url));
        }
      } catch (error) {
        // If token is invalid, allow access to auth pages
        return NextResponse.next();
      }
    }
    
    return NextResponse.next();
  }
  
  // Check if user is authenticated
  if (!token) {
    // Redirect to login if trying to access protected route
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Verify token and check role-based access
  try {
    // Decode JWT token (basic validation)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.role as 'admin' | 'doctor' | 'patient';
    
    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      // Token expired, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('expired', 'true');
      
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('auth_token');
      return response;
    }
    
    // Check role-based access
    let hasAccess = false;
    
    if (pathname.startsWith('/admin') && role === 'admin') {
      hasAccess = true;
    } else if (pathname.startsWith('/doctor') && role === 'doctor') {
      hasAccess = true;
    } else if (pathname.startsWith('/patient') && role === 'patient') {
      hasAccess = true;
    }
    
    if (!hasAccess) {
      // User doesn't have permission, redirect to their dashboard
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else if (role === 'doctor') {
        return NextResponse.redirect(new URL('/doctor', request.url));
      } else if (role === 'patient') {
        return NextResponse.redirect(new URL('/patient', request.url));
      }
    }
    
    // User is authenticated and has permission
    return NextResponse.next();
  } catch (error) {
    // Invalid token, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth_token');
    return response;
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
