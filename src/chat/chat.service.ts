// src/chat/chat.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../database/supabase.provider';

@Injectable()
export class ChatService {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  // 1) 유저가 속한 채팅방 목록
  async getUserRooms(userId: string) {
    // chat_participants 테이블에서 room_id 찾고,
    // chat_rooms 조인하거나, second query로 room_type, created_at 가져올 수 있음
    const { data, error } = await this.supabase
      .from('chatroomparticipants')
      .select('room_id, room:chatrooms(*)')  // room:chat_rooms(*) => join
      .eq('user_id', userId);
    if (error) throw error;
    // data 형태 예: [ { room_id, room: { id, room_type, created_at } }, ... ]
    return data;
  }

  // 2) 특정 방의 메시지 목록 (본인이 참여 중인지도 체크)
  async getRoomMessages(roomId: string, userId: string) {
    // 먼저 참여 여부 체크
    const { data: partData, error: partError } = await this.supabase
      .from('chatroomparticipants')
      .select('*')
      .eq('room_id', roomId)
      .eq('user_id', userId)
      .single();

    if (partError || !partData) {
      throw new Error('User not participating in this room or room not found');
    }

    // 참여 중이면 메시지 조회
    const { data: msgData, error: msgError } = await this.supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (msgError) throw msgError;
    return msgData;
  }

  // 3) 메시지 저장
  async saveMessage(roomId: string, senderId: string, content: string) {
    // 예: 서버에서 sender가 room참여 중인지 확인할 수도 있고, 생략도 가능
    const { data, error } = await this.supabase
      .from('messages')
      .insert([{ room_id: roomId, sender_id: senderId, content }])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  // (옵션) 새 채팅방 생성(1:1 예시)
  async createRoom(roomId: string, userA: string, userB: string) {
    // chat_rooms 테이블에 insert
    let { data, error } = await this.supabase
      .from('chatrooms')
      .insert([{ id: roomId, room_type: 'single' }])
      .select('*')
      .single();

    if (error) throw error;

    // chat_participants 테이블에 두 사람 추가
    const participants = [
      { room_id: roomId, user_id: userA },
      { room_id: roomId, user_id: userB },
    ];
    const { error: partError } = await this.supabase
      .from('chatroomparticipants')
      .insert(participants);

    if (partError) throw partError;
    return data; // 새로운 방 정보 반환
  }
}

// import { Injectable, Inject } from '@nestjs/common';
// import { SUPABASE_CLIENT } from '../database/supabase.provider';
// import { SupabaseClient } from '@supabase/supabase-js';

// @Injectable()
// export class ChatService {
//   constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

//   // Chats 테이블에 메시지 저장
//   async saveMessage(roomId: string, senderId: string, content: string) {
//     const { data, error } = await this.supabase
//       .from('Chatting')  // 테이블 이름: Chats
//       .insert([{ room_id: roomId, sender_id: senderId, content }])
//       .select('*')
//       .single(); // 새로 추가된 한 건의 레코드를 반환

//     if (error) {
//       throw error;
//     }
//     return data;
//   }

//   // 특정 채팅방(room_id)에 해당하는 메시지 조회 (오름차순 정렬)
//   async getMessages(roomId: string) {
//     const { data, error } = await this.supabase
//       .from('Chatting')
//       .select('*')
//       .eq('room_id', roomId)
//       .order('created_at', { ascending: true });

//     if (error) {
//       throw error;
//     }
//     return data;
//   }
// }
