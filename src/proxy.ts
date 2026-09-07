import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { routing } from "@/i18n/routing";

const handleI18n = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === "/" && !request.cookies.has("examio_session")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${routing.defaultLocale}/login`;
    return NextResponse.redirect(loginUrl);
  }

  const localeMatch = pathname.match(/^\/(th|en)(\/.*)?$/);
  const locale = localeMatch?.[1];
  const isProtectedRoute = locale && (pathname === `/${locale}` || pathname.startsWith(`/${locale}/exam`));

  if (isProtectedRoute && !request.cookies.has("examio_session")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = `/${locale}/login`;
    loginUrl.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(loginUrl);
  }

  return handleI18n(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
