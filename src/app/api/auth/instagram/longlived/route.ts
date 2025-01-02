import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { access_token } = await request.json();
    
    const url = new URL('https://graph.instagram.com/access_token');
    url.searchParams.append('grant_type', 'ig_exchange_token');
    url.searchParams.append('client_secret', process.env.INSTAGRAM_APP_SECRET!);
    url.searchParams.append('access_token', access_token);

    const response = await fetch(url.toString(), {
      method: 'GET'
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting long-lived token:', error);
    return NextResponse.json({ error: 'Token exchange failed' }, { status: 500 });
  }
}