package com.gdu.academix.controller;

import com.gdu.academix.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RequestMapping("/chatting")
@Controller
public class ChatController {

  private ChatService chatService;

  public ChatController(ChatService chatService) {
    super();
    this.chatService = chatService;
  }

  // 채팅 페이지 로드
  @GetMapping("/chat.page")
  public String chatPage() {
    return "chatting/chat";
  }
  
  // 1:1 채팅방 여부 확인 - 있으면 chatroom객체, 없으면 빈 chatroom객체
  @GetMapping(value="/isOneToOneChatroomExits.do", produces="application/json")
  public ResponseEntity<Map<String, Object>> isOneToOneChatroomExits(@RequestParam int loginUserNo, @RequestParam int chatUserNo) {
    return ResponseEntity.ok(Map.of("chatroom", chatService.isOneToOneChatroomExits(loginUserNo, chatUserNo)));
  }
  
  // 1:1 채팅방 생성
  @PostMapping(value="/insertNewOneToOneChatroom.do", produces="application/json")
  public ResponseEntity<Map<String, Object>> insertNewOneToOneChatroom(@RequestBody Map<String, Object> params) {
    return chatService.addOneToOneChatroom(params);
  }
  
  @PostMapping(value="/insertNewParticipateList.do", produces="application/json")
  public ResponseEntity<Map<String, Object>> insertNewParticipateList(@RequestBody Map<String, Object> params) {
    return ResponseEntity.ok(Map.of("insertNewParticipate", chatService.insertNewParticipateList(params)));
  }
  
  // 그룹 채팅방 생성
  @PostMapping(value="/insertNewGroupChatroom.do", produces="application/json")
  public ResponseEntity<Map<String, Object>> insertNewGroupChatroom(@RequestBody Map<String, Object> params) {
    return chatService.addGroupChatroom(params);
  }
  
  // 채팅 내역 가져오기
  @GetMapping(value="/getChatMessageList.do", produces="application/json")
  public ResponseEntity<Map<String, Object>> getChatMessageList(@RequestParam int chatroomNo, @RequestParam int page) {
    System.out.println("chatMessageList" + chatService.getChatMessageList(chatroomNo, page));
    return chatService.getChatMessageList(chatroomNo, page);
  }
  
  // 채팅방 목록 가져오기
  @GetMapping(value="/getChatList.do", produces="application/json")
  public ResponseEntity<Map<String, Object>> getChatList(@RequestParam int employeeNo) {
    return chatService.getChatList(employeeNo);
  }
  
  // 채팅방 번호로 채팅방 가져오기
  @GetMapping(value="/getChatroomByChatroomNo.do", produces="application/json")
  public ResponseEntity<Map<String, Object>> getChatroom(@RequestParam int chatroomNo) {
    return chatService.getChatroomByChatroomNo(chatroomNo);
  }
  
  // 채팅방 번호로 참여자 번호 리스트 가져오기
  @GetMapping(value="/getChatroomParticipantList.do", produces="application/json")
  public ResponseEntity<Map<String, Object>> getChatroomParticipantList(@RequestParam int chatroomNo) {
    return chatService.getChatroomParticipantList(chatroomNo);
  }
  
  // 채팅방 나가기 
  @DeleteMapping(value="/deleteParticipant.do", produces="application/json")
  public ResponseEntity<Map<String, Object>> deleteParticipant(@RequestParam int chatroomNo, @RequestParam int participantNo) {
    return chatService.deleteParticipant(chatroomNo, participantNo);
  }
  
  // 채팅방 이름 변경하기
  @PatchMapping(value="/updateChatroomTitle.do", produces="application/json")
  public ResponseEntity<Map<String, Object>> updateChatroomTitle(@RequestBody Map<String, Object> params) {
    return ResponseEntity.ok(Map.of("updateChatroomTitleCount", chatService.updateChatroomTitle(params)));  
  }
  
}
