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
  
  // 채팅방 참여자 넣기
  Map<String, Object> insertNewParticipateList(Map<String, Object> params);
  
  // 그룹 채팅방 생성
  ResponseEntity<Map<String, Object>> addGroupChatroom(Map<String, Object> params);
  
  // 채팅 내역 가져오기
  ResponseEntity<Map<String, Object>> getChatMessageList(int chatroomNo, int page);
  
  // 채팅방 목록 가져오기
  ResponseEntity<Map<String, Object>> getChatList(int employeeNo);
  
  // 채팅방 번호 - 채팅방 데이터 가져오기
  ResponseEntity<Map<String, Object>> getChatroomByChatroomNo(int chatroomNo);
  
  // 채팅방 - 참여자 번호 리스트 가져오기
  ResponseEntity<Map<String, Object>> getChatroomParticipantList(int chatroomNo);
  
  // 채팅방 - 참여자 상태 업데이트
  int updateParticipateStatus(Map<String, Object> params);
  
  // 채팅방 - 참여자 삭제
  ResponseEntity<Map<String, Object>> deleteParticipant(int chatroomNo, int participantNo);
  
  // 채팅방 - 참여자가 0명인 채팅방 삭제
  void deleteNoParticipateChatroom();
  
  // 채팅방 - 채팅방 이름 수정
  int updateChatroomTitle(Map<String, Object> params);

}
