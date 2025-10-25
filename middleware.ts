// middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// ✅ A matcher úgy van beállítva, hogy NE fusson /api, _next, favicon stb. alatt.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};

export function middleware(req: NextRequest) {
  // Ha nincs zárt mód, engedjük tovább
  const closed = process.env.NEXT_PUBLIC_CLOSED_TEST === '1';
  if (!closed) return NextResponse.next();

  // Egyszerű invite-kulcs ellenőrzés példa (igazítsd, ha más logikát használsz)
  const hasKey =
    req.cookies.get('invite')?.value === process.env.NEXT_PUBLIC_INVITE_MASTER_KEY;

  // Ha nincs kulcs és nem az /access oldalra megy, tereljük oda
  if (!hasKey && req.nextUrl.pathname !== '/access') {
    const url = req.nextUrl.clone();
    url.pathname = '/access';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
