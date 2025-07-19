import { databases, ID, Query } from "@/app/appwrite";
import { toast } from "sonner";
import { Models } from "appwrite";

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID!;
const RIDE_REQUESTS_ID = process.env.NEXT_PUBLIC_APPWRITE_RIDE_REQUESTS_COLLECTION_ID!;
const NOTIFICATIONS_ID = process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!;
const RIDES_ID = process.env.NEXT_PUBLIC_APPWRITE_RIDES_COLLECTION_ID!;

export interface RideRequest extends Models.Document {
  rideId: string;
  requesterId: string;
  requesterName: string;
  requesterPhone?: string;
  requesterEmail: string;
  driverId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  message?: string;
  seatsRequested: number;
  requestedAt: string;
  respondedAt?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
}

export interface Notification extends Models.Document {
  userId: string;
  type: 'ride_request' | 'request_accepted' | 'request_rejected' | 'ride_cancelled';
  title: string;
  message: string;
  data: any;
  read: boolean;
  createdAt: string;
  expiresAt?: string;
}

export class RideRequestService {

  // Create a new ride request
  static async createRideRequest(
    rideId: string,
    requesterId: string,
    requesterName: string,
    requesterPhone: string,
    requesterEmail: string,
    driverId: string,
    seatsRequested: number = 1,
    message?: string,
    pickupLocation?: string,
    dropoffLocation?: string
  ): Promise<RideRequest> {
    try {
      // Validate required fields
      if (!rideId || !requesterId || !requesterName || !requesterPhone || !requesterEmail || !driverId) {
        throw new Error("Missing required fields for ride request");
      }

      // Validate environment variables
      if (!DB_ID || !RIDE_REQUESTS_ID) {
        throw new Error("Missing database configuration");
      }

      console.log("Creating ride request with:", {
        rideId,
        requesterId,
        requesterName,
        requesterPhone,
        requesterEmail,
        driverId,
        seatsRequested
      });

      // Check if user already has a pending request for this ride
      const existingRequest = await this.getUserRideRequest(rideId, requesterId);
      if (existingRequest && existingRequest.status === 'pending') {
        throw new Error("You already have a pending request for this ride");
      }

      // Create the ride request
      const rideRequestData = {
        rideId,
        requesterId,
        requesterName,
        requesterPhone,
        requesterEmail,
        driverId,
        status: 'pending',
        message: message || '',
        seatsRequested,
        requestedAt: new Date().toISOString(),
        pickupLocation: pickupLocation || '',
        dropoffLocation: dropoffLocation || ''
      };

      console.log('Creating ride request with data:', rideRequestData);

      const result = await databases.createDocument(
        DB_ID,
        RIDE_REQUESTS_ID,
        ID.unique(),
        rideRequestData
      );

      console.log('Ride request created successfully:', result);

      // Create notification for the driver
      await this.createNotification(
        driverId,
        'ride_request',
        'New Ride Request',
        `${requesterName} has requested to join your ride`,
        {
          rideId,
          requestId: result.$id,
          requesterName,
          seatsRequested
        }
      );

      return result as RideRequest;
    } catch (error) {
      console.error('Error creating ride request:', error);
      throw error;
    }
  }

  // Get user's ride request for a specific ride
  static async getUserRideRequest(rideId: string, userId: string): Promise<RideRequest | null> {
    try {
      if (!DB_ID || !RIDE_REQUESTS_ID) {
        console.error("Missing database configuration");
        return null;
      }

      const result = await databases.listDocuments(
        DB_ID,
        RIDE_REQUESTS_ID,
        [
          Query.equal('rideId', rideId),
          Query.equal('requesterId', userId),
          Query.notEqual('status', 'cancelled')
        ]
      );

      return result.documents.length > 0 ? result.documents[0] as RideRequest : null;
    } catch (error) {
      console.error('Error fetching user ride request:', error);
      return null;
    }
  }

  // Get all requests for a specific ride (for drivers)
  static async getRideRequests(rideId: string): Promise<RideRequest[]> {
    try {
      if (!DB_ID || !RIDE_REQUESTS_ID) {
        console.error("Missing database configuration");
        return [];
      }

      const result = await databases.listDocuments(
        DB_ID,
        RIDE_REQUESTS_ID,
        [
          Query.equal('rideId', rideId),
          Query.notEqual('status', 'cancelled')
        ]
      );

      return result.documents as RideRequest[];
    } catch (error) {
      console.error('Error fetching ride requests:', error);
      return [];
    }
  }

  // Respond to a ride request (accept/reject)
  static async respondToRideRequest(
    requestId: string,
    response: 'accepted' | 'rejected',
    driverId: string
  ): Promise<void> {
    try {
      if (!DB_ID || !RIDE_REQUESTS_ID) {
        throw new Error("Missing database configuration");
      }

      // Get the current request to validate ownership and get details
      const currentRequest = await databases.getDocument(
        DB_ID,
        RIDE_REQUESTS_ID,
        requestId
      );

      const request = currentRequest as RideRequest;

      // Verify the driver owns this ride request
      if (request.driverId !== driverId) {
        throw new Error("You can only respond to requests for your own rides");
      }

      // Check if request is still pending
      if (request.status !== 'pending') {
        throw new Error("This request has already been responded to");
      }

      // Update the ride request
      const updatedRequest = await databases.updateDocument(
        DB_ID,
        RIDE_REQUESTS_ID,
        requestId,
        {
          status: response,
          respondedAt: new Date().toISOString()
        }
      );

      // If accepted, update the ride's available seats
      if (response === 'accepted') {
        await this.updateRideAvailableSeats(request.rideId, -request.seatsRequested);
      }

      // Create notification for the requester
      await this.createNotification(
        request.requesterId,
        response === 'accepted' ? 'request_accepted' : 'request_rejected',
        `Ride Request ${response === 'accepted' ? 'Accepted' : 'Rejected'}`,
        `Your ride request has been ${response}`,
        {
          rideId: request.rideId,
          requestId: requestId,
          response
        }
      );

      // If accepted, reject all other pending requests for this ride
      if (response === 'accepted') {
        await this.rejectOtherPendingRequests(request.rideId, requestId);
      }

    } catch (error) {
      console.error('Error responding to ride request:', error);
      throw error;
    }
  }

  // Cancel a ride request
  static async cancelRideRequest(requestId: string, userId: string): Promise<void> {
    try {
      if (!DB_ID || !RIDE_REQUESTS_ID) {
        throw new Error("Missing database configuration");
      }

      const requestDoc = await databases.getDocument(
        DB_ID,
        RIDE_REQUESTS_ID,
        requestId
      );

      const request = requestDoc as RideRequest;

      // Verify the user owns this request
      if (request.requesterId !== userId) {
        throw new Error("You can only cancel your own requests");
      }

      // Check if request can be cancelled
      if (request.status === 'cancelled') {
        throw new Error("This request has already been cancelled");
      }

      // Update the request status
      await databases.updateDocument(
        DB_ID,
        RIDE_REQUESTS_ID,
        requestId,
        {
          status: 'cancelled'
        }
      );

      // If it was accepted, restore the available seats
      if (request.status === 'accepted') {
        await this.updateRideAvailableSeats(request.rideId, request.seatsRequested);
      }

    } catch (error) {
      console.error('Error cancelling ride request:', error);
      throw error;
    }
  }

  // Update ride available seats
  private static async updateRideAvailableSeats(rideId: string, seatChange: number): Promise<void> {
    try {
      if (!DB_ID || !RIDES_ID) {
        throw new Error("Missing database configuration");
      }

      const ride = await databases.getDocument(DB_ID, RIDES_ID, rideId);
      const newAvailableSeats = Math.max(0, ride.availableSeats + seatChange);

      await databases.updateDocument(
        DB_ID,
        RIDES_ID,
        rideId,
        {
          availableSeats: newAvailableSeats,
          status: newAvailableSeats === 0 ? 'full' : 'active'
        }
      );
    } catch (error) {
      console.error('Error updating ride available seats:', error);
      throw error;
    }
  }

  // Reject all other pending requests for a ride
  private static async rejectOtherPendingRequests(rideId: string, acceptedRequestId: string): Promise<void> {
    try {
      if (!DB_ID || !RIDE_REQUESTS_ID) {
        console.error("Missing database configuration");
        return;
      }

      const pendingRequests = await databases.listDocuments(
        DB_ID,
        RIDE_REQUESTS_ID,
        [
          Query.equal('rideId', rideId),
          Query.equal('status', 'pending'),
          Query.notEqual('$id', acceptedRequestId)
        ]
      );

      const updatePromises = pendingRequests.documents.map(async (request) => {
        const rideRequest = request as RideRequest;
        
        // Update request status
        await databases.updateDocument(
          DB_ID,
          RIDE_REQUESTS_ID,
          request.$id,
          {
            status: 'rejected',
            respondedAt: new Date().toISOString()
          }
        );

        // Notify the requester
        await this.createNotification(
          rideRequest.requesterId,
          'request_rejected',
          'Ride Request Rejected',
          'Your ride request has been rejected as the ride is now full',
          {
            rideId: rideRequest.rideId,
            requestId: request.$id,
            reason: 'ride_full'
          }
        );
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error rejecting other pending requests:', error);
    }
  }

  // Create a notification
  private static async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data: any
  ): Promise<void> {
    try {
      // Validate required fields
      if (!userId || !type || !title || !message) {
        console.error('Missing required notification fields:', { userId, type, title, message });
        return;
      }

      if (!DB_ID || !NOTIFICATIONS_ID) {
        console.error('Missing notification database configuration');
        return;
      }

      const notification = {
        userId,
        type,
        title,
        message,
        data: data || {},
        read: false,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };

      console.log('Creating notification with data:', notification);

      await databases.createDocument(
        DB_ID,
        NOTIFICATIONS_ID,
        ID.unique(),
        notification
      );
    } catch (error) {
      console.error('Error creating notification:', error);
      // Don't throw error to prevent breaking the main flow
    }
  }

  // Get user notifications
  static async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      if (!DB_ID || !NOTIFICATIONS_ID) {
        console.error("Missing database configuration");
        return [];
      }

      const result = await databases.listDocuments(
        DB_ID,
        NOTIFICATIONS_ID,
        [
          Query.equal('userId', userId),
          Query.greaterThanEqual('expiresAt', new Date().toISOString()),
          Query.orderDesc('createdAt')
        ]
      );

      return result.documents as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Get user's ride requests (for profile/history)
  static async getUserRideRequests(userId: string): Promise<RideRequest[]> {
    try {
      if (!DB_ID || !RIDE_REQUESTS_ID) {
        console.error("Missing database configuration");
        return [];
      }

      const result = await databases.listDocuments(
        DB_ID,
        RIDE_REQUESTS_ID,
        [
          Query.equal('requesterId', userId),
          Query.orderDesc('requestedAt')
        ]
      );

      return result.documents as RideRequest[];
    } catch (error) {
      console.error('Error fetching user ride requests:', error);
      return [];
    }
  }

  // Get ride requests for driver's rides
  static async getDriverRideRequests(driverId: string): Promise<RideRequest[]> {
    try {
      if (!DB_ID || !RIDE_REQUESTS_ID) {
        console.error("Missing database configuration");
        return [];
      }

      const result = await databases.listDocuments(
        DB_ID,
        RIDE_REQUESTS_ID,
        [
          Query.equal('driverId', driverId),
          Query.orderDesc('requestedAt')
        ]
      );

      return result.documents as RideRequest[];
    } catch (error) {
      console.error('Error fetching driver ride requests:', error);
      return [];
    }
  }
}

// Updated handleRideRequest function for your component
export const handleRideRequest = async (
  rideId: string,
  userId: string,
  userName: string,
  userPhone: string,
  userEmail: string,
  driverId: string,
  seatsRequested: number = 1
): Promise<void> => {
  try {
    console.log("handleRideRequest called with:", {
      rideId,
      userId,
      userName,
      userPhone,
      userEmail,
      driverId,
      seatsRequested
    });

    // Validate inputs
    if (!rideId || !userId || !userName || !userPhone || !userEmail || !driverId) {
      throw new Error("Missing required information: rideId, userId, userName, userPhone, userEmail, or driverId.");
    }

    if (seatsRequested <= 0) {
      throw new Error("Number of seats must be greater than 0");
    }

    if (userId === driverId) {
      throw new Error("You cannot request your own ride");
    }

    await RideRequestService.createRideRequest(
      rideId,
      userId,
      userName,
      userPhone,
      userEmail,
      driverId,
      seatsRequested,
      `Hi, I would like to join your ride. Thank you!`
    );

    toast.success("Ride request sent successfully! The driver will be notified.");
  } catch (error) {
    console.error('Error requesting ride:', error);
    if (error instanceof Error) {
      toast.error(error.message);
    } else {
      toast.error("Failed to send ride request. Please try again.");
    }
    throw error; // Re-throw to let the calling component handle it
  }
};