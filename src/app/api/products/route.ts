import { NextRequest, NextResponse } from 'next/server'

// This route forwards to /api/storefront/products for backwards compatibility
export async function GET(req: NextRequest) {
  const url = req.nextUrl.clone()
  url.pathname = '/api/storefront/products'
  return NextResponse.redirect(url)
}
