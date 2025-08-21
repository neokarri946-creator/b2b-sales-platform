export async function POST(request) {
  // REDIRECT TO V4 - This old endpoint should not be used
  // It contains hardcoded generic URLs
  const v4Response = await fetch(new URL('/api/analysis-v4', request.url).toString(), {
    method: 'POST',
    headers: request.headers,
    body: await request.text()
  })
  return v4Response
}