// app/api/auth/instagram/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code, redirect_uri } = await request.json();
    
    const formData = new URLSearchParams();
    formData.append('client_id', process.env.INSTAGRAM_APP_ID!);
    formData.append('client_secret', process.env.INSTAGRAM_APP_SECRET!);
    formData.append('grant_type', 'authorization_code');
    formData.append('redirect_uri', process.env.REDIRECT_URI!);
    formData.append('code', code);

    const response = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in Instagram auth:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}