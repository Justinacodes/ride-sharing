// import { NextRequest, NextResponse } from 'next/server';
// import { account } from '@/app/appwrite';
// import { OAuthProvider } from 'appwrite';

// export async function POST(request: NextRequest) {
//   try {
//     const origin = request.headers.get('origin') || 'http://localhost:3000';
    
//     // Create OAuth2 session with Google
//     const redirectUrl = await account.createOAuth2Session(
//       OAuthProvider.Google,
//       `${origin}/dashboard`, // Success redirect
//       `${origin}/register?error=google_auth_failed` // Failure redirect
//     );
    
//     return NextResponse.json({
//       success: true,
//       redirectUrl: redirectUrl
//     });
    
//   } catch (error: any) {
//     console.error("Google OAuth error:", error);
    
//     return NextResponse.json(
//       { 
//         error: "Google authentication failed. Please try again.",
//         details: error.message 
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function OPTIONS(request: NextRequest) {
//   return new NextResponse(null, {
//     status: 200,
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'POST, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//     },
//   });
// }
