// import { NextRequest, NextResponse } from 'next/server';
// import { account, ID } from '@/app/appwrite';
// import { z } from 'zod';

// // Phone number validation regex (supports international formats)
// const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

// // Registration schema
// const registerSchema = z.object({
//   name: z.string().min(2, "Name must be at least 2 characters"),
//   email: z.string().email("Invalid email format"),
//   phone: z.string().regex(phoneRegex, "Please enter a valid phone number"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
// });

// // POST - Handle user registration
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
    
//     // Validate request body
//     const validationResult = registerSchema.safeParse(body);
//     if (!validationResult.success) {
//       return NextResponse.json(
//         { 
//           error: 'Validation failed', 
//           details: validationResult.error.issues 
//         }, 
//         { status: 400 }
//       );
//     }

//     const { name, email, phone, password } = validationResult.data;

//     try {
//       // Create the user account
//       const user = await account.create(ID.unique(), email, password, name);
      
//       // Create email password session (log user in immediately)
//       const session = await account.createEmailPasswordSession(email, password);
      
//       // Store phone number in user preferences
//       try {
//         await account.updatePrefs({ phone: phone });
//       } catch (prefErr) {
//         console.warn("Could not save phone number to preferences:", prefErr);
//       }
      
//       // Send email verification
//       try {
//         const origin = request.nextUrl.origin;
//         await account.createVerification(`${origin}/verify-email`);
//       } catch (verificationError) {
//         console.error("Email verification error:", verificationError);
//         // Continue even if verification fails
//       }
      
//       // Return success response
//       return NextResponse.json({
//         success: true,
//         message: "Account created successfully",
//         user: {
//           $id: user.$id,
//           name: user.name,
//           email: user.email,
//           emailVerification: user.emailVerification,
//           prefs: user.prefs
//         },
//         session: {
//           $id: session.$id,
//           expire: session.expire
//         }
//       }, { status: 201 });

//     } catch (error: any) {
//       console.error("Registration error:", error);
      
//       if (error.code === 409) {
//         return NextResponse.json(
//           { 
//             error: "An account with this email already exists",
//             code: "USER_ALREADY_EXISTS"
//           }, 
//           { status: 409 }
//         );
//       }
      
//       // Handle other Appwrite errors
//       return NextResponse.json(
//         { 
//           error: "Registration failed", 
//           message: error.message || "Unknown error occurred",
//           code: error.code || "REGISTRATION_FAILED"
//         }, 
//         { status: 500 }
//       );
//     }

//   } catch (error) {
//     console.error("Request processing error:", error);
//     return NextResponse.json(
//       { error: "Invalid request format" }, 
//       { status: 400 }
//     );
//   }
// }

// // GET - Check registration status or get user info
// export async function GET(request: NextRequest) {
//   try {
//     // Get current user session
//     const user = await account.get();
    
//     return NextResponse.json({
//       success: true,
//       user: {
//         $id: user.$id,
//         name: user.name,
//         email: user.email,
//         emailVerification: user.emailVerification,
//         prefs: user.prefs
//       }
//     });

//   } catch (error: any) {
//     // No active session
//     return NextResponse.json(
//       { 
//         error: "No active session", 
//         authenticated: false 
//       }, 
//       { status: 401 }
//     );
//   }
// }

// // PUT - Update user registration details
// export async function PUT(request: NextRequest) {
//   try {
//     const body = await request.json();
    
//     // Check if user is authenticated
//     try {
//       const user = await account.get();
      
//       // Update user name if provided
//       if (body.name) {
//         await account.updateName(body.name);
//       }
      
//       // Update phone number in preferences if provided
//       if (body.phone && phoneRegex.test(body.phone)) {
//         const currentPrefs = user.prefs || {};
//         await account.updatePrefs({ 
//           ...currentPrefs, 
//           phone: body.phone 
//         });
//       }
      
//       // Get updated user data
//       const updatedUser = await account.get();
      
//       return NextResponse.json({
//         success: true,
//         message: "Profile updated successfully",
//         user: {
//           $id: updatedUser.$id,
//           name: updatedUser.name,
//           email: updatedUser.email,
//           emailVerification: updatedUser.emailVerification,
//           prefs: updatedUser.prefs
//         }
//       });

//     } catch (error: any) {
//       return NextResponse.json(
//         { 
//           error: "Authentication required", 
//           code: "UNAUTHORIZED"
//         }, 
//         { status: 401 }
//       );
//     }

//   } catch (error) {
//     console.error("Update error:", error);
//     return NextResponse.json(
//       { error: "Update failed" }, 
//       { status: 500 }
//     );
//   }
// }

// // DELETE - Delete user account
// export async function DELETE(request: NextRequest) {
//   try {
//     // Check if user is authenticated
//     const user = await account.get();
    
//     // Delete current session
//     await account.deleteSession('current');
    
//     // Note: Appwrite doesn't provide direct user deletion from client SDK
//     // This would typically require admin SDK or server-side implementation
    
//     return NextResponse.json({
//       success: true,
//       message: "Session terminated successfully"
//     });

//   } catch (error: any) {
//     console.error("Delete error:", error);
//     return NextResponse.json(
//       { 
//         error: "Failed to terminate session", 
//         code: "DELETE_FAILED" 
//       }, 
//       { status: 500 }
//     );
//   }
// }