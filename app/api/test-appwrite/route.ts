// import { NextRequest, NextResponse } from 'next/server';
// import { account } from '@/app/appwrite'; // Adjust path as needed

// export async function GET() {
//   try {
//     console.log("Testing Appwrite connection...");
    
//     // Test basic connection by trying to get account info
//     // This will fail if not authenticated, but that's expected
//     try {
//       const user = await account.get();
//       console.log("Current user found:", user.$id);
//       return NextResponse.json({
//         success: true,
//         message: "Appwrite connected and user authenticated",
//         user: user.$id
//       });
//     } catch (error: any) {
//       // This is expected if no user is logged in
//       if (error.code === 401) {
//         console.log("No authenticated user (expected)");
//         return NextResponse.json({
//           success: true,
//           message: "Appwrite connection OK, no authenticated user",
//           appwriteConnected: true
//         });
//       }
//       throw error;
//     }
//   } catch (error: any) {
//     console.error("Appwrite test error:", {
//       message: error.message,
//       code: error.code,
//       type: error.type
//     });
    
//     return NextResponse.json({
//       success: false,
//       error: "Appwrite connection failed",
//       details: error.message
//     }, { status: 500 });
//   }
// }