import { Injectable, Inject } from '@nestjs/common';
import { SUPABASE_CLIENT } from '../database/supabase.provider';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class ChatService {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  // Chats 테이블에 메시지 저장
  async saveMessage(roomId: string, senderId: string, content: string) {
    const { data, error } = await this.supabase
      .from('Chats')  // 테이블 이름: Chats
      .insert([{ room_id: roomId, sender_id: senderId, content }])
      .select('*')
      .single(); // 새로 추가된 한 건의 레코드를 반환

    if (error) {
      throw error;
    }
    return data;
  }

  // 특정 채팅방(room_id)에 해당하는 메시지 조회 (오름차순 정렬)
  async getMessages(roomId: string) {
    const { data, error } = await this.supabase
      .from('Chats')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }
    return data;
  }
}
