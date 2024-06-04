package com.gdu.academix.service;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;

import com.gdu.academix.dto.ChatroomDto;
import com.gdu.academix.dto.MessageDto;

public interface ChatService {
  
  // 메시지 데이터 넣기
  Map<String, Object> insertChatMessage(MessageDto message);
  
  // 1:1 채팅방 여부 확인
  ChatroomDto isOneToOneChatroomExits(int loginUserNo, int chatUserNo);
  
  // 1:1 채팅방 생성
  ResponseEntity<Map<String, Object>> addOneToOneChatroom(Map<String, Object> params);
  
  // 채팅 내역 가져오기
  ResponseEntity<Map<String, Object>> getChatMessageList(int chatroomNo, int page);
  
  // 채팅방 목록 가져오기
  ResponseEntity<Map<String, Object>> getChatList(int employeeNo);
  
  // 채팅방 번호 - 채팅방 데이터 가져오기
  ResponseEntity<Map<String, Object>> getChatroomByChatroomNo(int chatroomNo);
  
  // 채팅방 - 참여자 번호 리스트 가져오기
  ResponseEntity<Map<String, Object>> getChatroomParticipantList(int chatroomNo);
  
  //ResponseEntity<Map<String, Object>> getChatTotalPageCount(int chatroomNo, int page);

}
