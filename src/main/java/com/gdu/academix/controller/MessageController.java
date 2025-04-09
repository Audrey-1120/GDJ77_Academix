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
import org.springframework.messaging.handler.annotation.DestinationVariable;
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
  public MessageDto OneToOneChat(@DestinationVariable int chatroomNo, MessageDto message) {
    
    try {
      MessageType messageType = message.getMessageType();

      if(messageType.equals(MessageType.CHAT)) {

        Map<String, Object> map = chatService.insertChatMessage(message);
        return (MessageDto) map.get("chatMessage");
        
      } else if(messageType.equals(MessageType.LEAVE)){

        return message;

      } else if(messageType.equals(MessageType.UPDATE)){

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
  public MessageDto GroupChat(@DestinationVariable int chatroomNo, MessageDto message) {
    
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
  public void notifyUser(MessageDto message, CustomPrincipal customPrincipal) {
    
    if(message.getRecipientNoList() == null) {
      message.setRecipientNoList(new ArrayList<>());
    }

    Set<Integer> recipientNoSet = new HashSet<>(message.getRecipientNoList());

    int notifierNo = message.getSenderNo();
    EmployeesDto employee = userService.getUserProfileByNo(notifierNo);

    for(Integer recipientNo : recipientNoSet) {
      if(!recipientNo.equals(message.getSenderNo())) {

        try {

          String messageContent = message.getMessageContent();
          String result;

          if (messageContent.length() > 20) {
              result = messageContent.substring(0, 20) + "...";
          } else {
              result = messageContent;
          }

          NotificationsDto notification = NotificationsDto.builder()
                                                 .message(result)
                                                 .notificationType("CHAT")
                                                 .notifierNo(notifierNo)
                                                 .seenStatus(0)
                                                 .employeeNo(recipientNo)
                                                 .chatroomNo(message.getChatroomNo())
                                               .build();

          int insertNotificationCount = notifyService.insertNotification(notification);

          List<NotificationsDto> notificationList = notifyService.getNotificationList(recipientNo);

          String username = "user-" + recipientNo;
          messagingTemplate.convertAndSendToUser(username, "/queue/notifications", notificationList.get(0));

        } catch (Exception e) {
          log.error("메시지 알림 전송 실패: ", e);
        }

      }
    }
  }
}
