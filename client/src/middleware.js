import { NextResponse } from "next/server";

const REDIRECT_CACHE_TTL_MS = 30 * 1000; // 30 секунд, чтобы новые правила подхватывались быстрее

let redirectCache = { list: null, expires: 0 };

async function getRedirects(request) {
  const now = Date.now();
  if (redirectCache.list && redirectCache.expires > now) {
    return redirectCache.list;
  }
  const origin =
    process.env.NEXT_PUBLIC_API_ENDPOINT ||
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    (typeof request?.nextUrl?.origin !== "undefined"
      ? `${request.nextUrl.origin}/strapi`
      : "") ||
    "http://127.0.0.1:1337";
  const strapiBase = origin.replace(/\/$/, "");
  const listUrl = `${strapiBase}/api/redirects?pagination[pageSize]=1000`;
  try {
    const res = await fetch(listUrl, { next: { revalidate: 60 } });
    if (!res.ok) return redirectCache.list || [];
    const data = await res.json();
    const list = Array.isArray(data.data) ? data.data : [];
    redirectCache = {
      list: list.map((r) => ({
        from: normalizePath(r.attributes?.from),
        to: (r.attributes?.to ?? "").trim(),
      })),
      expires: now + REDIRECT_CACHE_TTL_MS,
    };
    return redirectCache.list;
  } catch {
    return redirectCache.list || [];
  }
}

function normalizePath(p) {
  if (typeof p !== "string") return "";
  const s = p.trim().replace(/\/+$/, ""); // убираем завершающие слэши
  return s.startsWith("/") ? s : `/${s}`;
}

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const redirects = await getRedirects(request);
  const fromNormalized = normalizePath(pathname);
  const rule = redirects.find((r) => r.from === fromNormalized);
  if (rule && rule.to) {
    const baseOrigin =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_APP_HOST ||
      request.nextUrl.origin;
    const destination = rule.to.startsWith("http")
      ? rule.to
      : new URL(rule.to, baseOrigin).toString();
    return NextResponse.redirect(destination, 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|api/|sitemap\\.xml).*)",
  ],
};
