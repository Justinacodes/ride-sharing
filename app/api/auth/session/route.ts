// import { NextRequest, NextResponse } from 'next/server';
// import { account } from '@/app/appwrite';

// // Get current user session
// export async function GET(request: NextRequest) {
//   try {
//     const user = await account.get();
    
//     return NextResponse.json({
//       success: true,
//       user: user
//     });
    
//   } catch (error: any) {
//     return NextResponse.json(
//       { error: "No active session" },
//       { status: 401 }
//     );
//   }
// }

// // Delete current session (logout)
// export async function DELETE(request: NextRequest) {
//   try {
//     await account.deleteSession('current');
    
//     return NextResponse.json({
//       success: true,
//       message: "Session deleted successfully"
//     });
    
//   } catch (error: any) {
//     console.error("Session deletion error:", error);
    
//     return NextResponse.json(
//       { error: "Failed to delete session" },
//       { status: 500 }
//     );
//   }
// }