export async function POST(request) {
  // REDIRECT TO V4 - Old version with fake URLs
  return fetch(new URL('/api/analysis-v4', request.url).toString(), {
    method: 'POST',
    headers: request.headers,
    body: await request.text()
  })
}