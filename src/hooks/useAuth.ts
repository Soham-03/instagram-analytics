import { useState, useEffect } from 'react';
import { InstagramAuthResponse } from '@/types/instagram';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loginWithInstagram = () => {
    if (!process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID) {
      console.error("Instagram App ID not configured");
      return false;
    }

    const authUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish`;
    
    window.location.href = authUrl;
    return true;
  };

  const handleLogout = () => {
    localStorage.removeItem("instagram_token");
    setIsLoggedIn(false);
  };

  const exchangeCodeForToken = async (code: string): Promise<string> => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI,
        }),
      });

      const data: InstagramAuthResponse = await response.json();
      
      if (data.access_token) {
        localStorage.setItem("instagram_token", data.access_token);
        setIsLoggedIn(true);
        return data.access_token;
      }
      throw new Error("No access token received");
    } catch (error) {
      console.error("Authentication failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("instagram_token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return {
    isLoggedIn,
    isLoading,
    loginWithInstagram,
    handleLogout,
    exchangeCodeForToken,
  };
};