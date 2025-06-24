// import { NextResponse } from "next/server";
// import { Client, Databases, Query } from "node-appwrite";
// import fetch from "node-fetch";

// const config = {
//   endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
//   project: process.env.NEXT_PUBLIC_APPWRITE_PROJECT!,
//   apiKey: process.env.APPWRITE_API_KEY!,
//   databaseId: process.env.NEXT_PUBLIC_APPWRITE_DB_ID!,
//   collectionId: process.env.NEXT_PUBLIC_APPWRITE_RIDES_COLLECTION_ID!,
//   googleApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
// };

// export async function GET() {
//   const client = new Client()
//     .setEndpoint(config.endpoint)
//     .setProject(config.project)
//     .setKey(config.apiKey);

//   const databases = new Databases(client);

//   async function geocode(address: string) {
//     const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${config.googleApiKey}`;
//    const res = await fetch(url);
// const data = (await res.json()) as {
//   status: string;
//   results: Array<{
//     geometry: {
//       location: {
//         lat: number;
//         lng: number;
//       };
//     };
//   }>;
// };

//     if (data.status === "OK" && data.results[0]?.geometry?.location) {
//       return data.results[0].geometry.location;
//     }
//     return null;
//   }

//   try {
//     const result = await databases.listDocuments(
//       config.databaseId,
//       config.collectionId,
//       [Query.limit(100)]
//     );

//     const updated: string[] = [];
//     const skipped: { id: string; reason: string }[] = [];

//     for (const ride of result.documents) {
//       const { from, to, date, time, noOfSeats, $id, fromCoordinates, toCoordinates } = ride;

//       // Skip if essential fields are missing
//       if (!from || !to || !date || !time || typeof noOfSeats === "undefined") {
//         skipped.push({ id: $id, reason: "Missing required ride data fields" });
//         continue;
//       }

//       // Skip if already geocoded
//       if (fromCoordinates && toCoordinates) continue;

//       const fromCoords = await geocode(from);
//       const toCoords = await geocode(to);

//       if (!fromCoords || !toCoords) {
//         skipped.push({ id: $id, reason: "Geocoding failed" });
//         continue;
//       }

//       await databases.updateDocument(config.databaseId, config.collectionId, $id, {
//         from,
//         to,
//         date,
//         time,
//         noOfSeats,
//         fromArea: fromCoords,
//         toArea: toCoords,
//       });

//       updated.push($id);
//     }

//     return NextResponse.json({
//       message: "Backfill completed",
//       updatedCount: updated.length,
//       updated,
//       skipped,
//     });
//   } catch (err: any) {
//     console.error("Backfill error:", err);
//     return NextResponse.json(
//       { error: "Failed to backfill coordinates", detail: err.message },
//       { status: 500 }
//     );
//   }
// }
