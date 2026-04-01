export type Profile = {
  id: string;
  full_name: string;
  email: string;
  university: string;
  bio: string | null;
  is_looking: boolean;
  created_at: string;
};

export type RequestStatus = "pending" | "accepted" | "declined";

export type RoomRequest = {
  id: string;
  from_id: string;
  to_id: string;
  status: RequestStatus;
  created_at: string;
};

export type Room = {
  id: string;
  room_number: string | null;
  capacity: number;
  created_at: string;
};

export type RoomMember = {
  room_id: string;
  profile_id: string;
  joined_at: string;
};

export type PendingAttendee = {
  id: string;
  full_name: string;
  email: string;
  university: string;
  imported_at: string;
};

// Note: join-result types (MembershipWithRoom, RoommateRow, RequestRow, RoomMemberRow, MemberRow)
// are local to their respective pages since they represent Supabase query shapes, not base table types.
