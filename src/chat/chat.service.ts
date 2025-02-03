// chat.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { SUPABASE_CLIENT } from 'src/database/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class ChatService {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  // 메시지 저장
  async saveMessage(roomId: string, senderId: string, content: string) {
    const { data, error } = await this.supabase
      .from('messages')
      .insert([{ room_id: roomId, sender_id: senderId, content }])
      .select('*')
      .single(); // 추가된 레코드 1개만 반환

    if (error) {
      throw error;
    }
    return data;
  }

  // 특정 채팅방의 이전 메시지 불러오기
  async getMessages(roomId: string) {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }
    return data;
  }

  // 추가로 채팅방 목록, 유저 정보 등도 관리 가능//
}
