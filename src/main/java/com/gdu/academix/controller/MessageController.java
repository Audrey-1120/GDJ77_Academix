package com.gdu.academix.controller;

import com.gdu.academix.dto.CustomPrincipal;
import com.gdu.academix.dto.EmployeesDto;
import com.gdu.academix.dto.MessageDto;
import com.gdu.academix.dto.MessageDto.MessageType;
import com.gdu.academix.dto.NotificationsDto;
import com.gdu.academix.service.ChatService;
import com.gdu.academix.service.NotifyService;
import com.gdu.academix.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.*;

@Controller
public class MessageController {
  
  private final ChatService chatService;
  private final UserService userService;
  private final NotifyService notifyService;
  private final SimpMessagingTemplate messagingTemplate;

  private static final Logger log = LoggerFactory.getLogger(MessageController.class);
  
  public MessageController(ChatService chatService, UserService userService, NotifyService notifyService, SimpMessagingTemplate messagingTemplate) {
    super();
    this.chatService = chatService;
    this.userService = userService;
    this.notifyService = notifyService;
    this.messagingTemplate = messagingTemplate;
  }

  // 1:1
  @MessageMapping("/one/{chatroomNo}")
  @SendTo("/queue/{chatroomNo}")
  public MessageDto OneToOneChat(MessageDto message) {
    
    try {

      MessageType messageType = message.getMessageType();

      if(messageType.equals(MessageType.CHAT)) { // 일반 메시지 전송

        Map<String, Object> map = chatService.insertChatMessage(message);
        return (MessageDto) map.get("chatMessage");
        
      } else if(messageType.equals(MessageType.LEAVE)) { // 퇴장 메시지일 경우

        return message;

      } else if(messageType.equals(MessageType.UPDATE)) { // 상태 접속 메시지일 경우

        // participateStatus 값은 1혹은 0이다.
        Map<String, Object> params = Map.of("chatroomNo", message.getChatroomNo(),
                                            "participantNo", message.getSenderNo(),
                                            "participateStatus", Integer.parseInt(message.getMessageContent()));
        
        chatService.updateParticipateStatus(params);

        return message;

      } else {

        return message;
      }
    } catch (Exception e) {
      log.error("1:1 채팅 메시지 전송 실패: ", e);

      throw new RuntimeException("1:1 채팅 중 에러가 발생하였습니다.");
    }
  }
  
  // 단체
  @MessageMapping("/group/{chatroomNo}")
  @SendTo("/topic/{chatroomNo}")
  public MessageDto GroupChat(MessageDto message) {
    
    try {

      MessageType messageType = message.getMessageType();
      MessageDto chatMessage;
      
      if(messageType.equals(MessageType.CHAT)) {

        Map<String, Object> map = chatService.insertChatMessage(message);
        chatMessage = (MessageDto) map.get("chatMessage");
        return chatMessage;
        
      } else if(messageType.equals(MessageType.JOIN)){

        Map<String, Object> map = chatService.insertChatMessage(message);
        chatMessage = (MessageDto) map.get("chatMessage");
        return chatMessage;
       
      } else if(messageType.equals(MessageType.LEAVE)){
        
        Map<String, Object> map = chatService.insertChatMessage(message);
        return message;
      
      } else if(messageType.equals(MessageType.UPDATE)){
        
        Map<String, Object> params = Map.of("chatroomNo", message.getChatroomNo(), "participantNo", message.getSenderNo(), "participateStatus", Integer.parseInt(message.getMessageContent()));
        int updateCount = chatService.updateParticipateStatus(params);
        return message;

      } else {

        return message;
      }
      
    } catch (Exception e) {
      log.error("단체 채팅 메시지 전송 실패: ", e);
      throw new RuntimeException("단체 채팅 중 에러가 발생하였습니다.");
    }
  }

  @MessageMapping("/notify")
  public void notifyUser(MessageDto message) {
    
    if(message.getRecipientNoList() == null) {
      message.setRecipientNoList(new ArrayList<>());
    }

    // 중복 제거
    Set<Integer> recipientNoSet = new HashSet<>(message.getRecipientNoList());

    // 메시지 송신자 번호
//    int notifierNo = ;
//    EmployeesDto employee = userService.getUserProfileByNo(notifierNo);

    for(Integer recipientNo : recipientNoSet) {
      if(!recipientNo.equals(message.getSenderNo())) { // 채팅방 참여 인원 중 송신자 번호는 제외

        try {

          String messageContent = message.getMessageContent();
          String result;

          if (messageContent.length() > 20) { // 알림창에 보여지는 메시지 미리보기는 20자까지
              result = messageContent.substring(0, 20) + "...";
          } else {
              result = messageContent;
          }

          NotificationsDto notification = NotificationsDto.builder()
                                                 .message(result)
                                                 .notificationType("CHAT")
                                                 .notifierNo(message.getSenderNo())
                                                 .seenStatus(0) // 확인 여부
                                                 .employeeNo(recipientNo) // 받는 직원 번호
                                                 .chatroomNo(message.getChatroomNo()) // 채팅방 번호
                                               .build();

          int insertNotificationCount = notifyService.insertNotification(notification);

          // 아직 안읽은 알림 리스트 조회
          List<NotificationsDto> notificationList = notifyService.getNotificationList(recipientNo);

          // CustomUserPrincipal - employeeNo
          String username = "user-" + recipientNo;

          // username에 CustomUserPrincipal의 employeeNo에 저장한 이름 추가
          // /queue/notifications
          messagingTemplate.convertAndSendToUser(username, "/queue/notifications", notificationList.get(0));

        } catch (Exception e) {
          log.error("메시지 알림 전송 실패: ", e);
        }

      }
    }
  }
}
