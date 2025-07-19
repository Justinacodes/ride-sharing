import { account } from "../appwrite";

export const initializeGoogleAuth = () => {
  // This will be called when the component mounts
  if (typeof window !== 'undefined' && window.google) {
    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: true
    });
  }
};

export const handleGoogleResponse = async (response: any) => {
  try {
    // The response contains the JWT token from Google
    const credential = response.credential;
    
    // Decode the JWT to get user info (you can also verify it server-side)
    const payload = JSON.parse(atob(credential.split('.')[1]));
    
    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      credential: credential
    };
  } catch (error) {
    console.error('Error handling Google response:', error);
    throw error;
  }
};
