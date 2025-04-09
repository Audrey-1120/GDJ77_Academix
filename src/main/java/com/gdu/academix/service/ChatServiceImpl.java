package com.gdu.academix.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.gdu.academix.dto.ChatroomDto;
import com.gdu.academix.dto.ChatroomParticipateDto;
import com.gdu.academix.dto.EmployeesDto;
import com.gdu.academix.dto.MessageDto;
import com.gdu.academix.dto.MessageDto.MessageType;
import com.gdu.academix.mapper.ChatMapper;
import com.gdu.academix.mapper.UserMapper;
import com.gdu.academix.utils.MyPageUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Transactional
@Service
public class ChatServiceImpl implements ChatService {
  
  private final ChatMapper chatMapper;
  private final UserMapper userMapper;
  private final MyPageUtils myPageUtils;

  private static final Logger log = LoggerFactory.getLogger(ChatServiceImpl.class);

  public ChatServiceImpl(ChatMapper chatMapper, UserMapper userMapper, MyPageUtils myPageUtils) {
    super();
    this.chatMapper = chatMapper;
    this.userMapper = userMapper;
    this.myPageUtils = myPageUtils;
  }

  // 메시지 데이터 저장
  @Override
  public Map<String, Object> insertChatMessage(MessageDto message) {
    
    String replaceMessageContent = message.getMessageContent().replace("\n", "<br>").replace("\r\n", "<br>");
    
    MessageDto chatMessage = MessageDto.builder()
                                  .messageType(message.getMessageType())
                                  .messageContent(replaceMessageContent)
                                  .chatroomNo(message.getChatroomNo())
                                  .senderNo(message.getSenderNo()) 
                                .build();
    
    int insertMessageCount = chatMapper.insertChatMessage(chatMessage);
    
    long currentTimeMillis = System.currentTimeMillis();
    Timestamp currentTimestamp = new Timestamp(currentTimeMillis); 
    chatMessage.setSendDt(currentTimestamp);
    
    return Map.of("insertMessageCount", insertMessageCount,"chatMessage", chatMessage);

  }
  
  // 1:1 채팅방 여부 확인
  @Transactional(readOnly = true)
  @Override
  public ChatroomDto isOneToOneChatroomExits(int loginUserNo, int chatUserNo) {

    Map<String, Object> map = Map.of("loginUserNo", loginUserNo, "chatUserNo", chatUserNo);
    ChatroomDto chatroom = chatMapper.isOneToOneChatroomExits(map);

    if(chatroom == null) {
      chatroom = new ChatroomDto();
    }

    return chatroom;
  }
  
  // 1:1 채팅방 생성
  @Override
  public ResponseEntity<Map<String, Object>> addOneToOneChatroom(Map<String, Object> params) {

    int loginUserNo = Integer.parseInt(String.valueOf(params.get("loginUserNo")));
    int chatUserNo = Integer.parseInt(String.valueOf(params.get("chatUserNo")));
    
    EmployeesDto loginUser = userMapper.getUserProfileByNo(loginUserNo);
    EmployeesDto chatUser = userMapper.getUserProfileByNo(chatUserNo);

    ChatroomDto chatroomDto = ChatroomDto.builder()
                                  .chatroomTitle(loginUser.getName() + ", " + chatUser.getName())
                                  .chatroomType("OneToOne")
                                  .creatorNo(loginUserNo)
                                .build();
    
    int insertOneToOneChatroomCount = chatMapper.insertNewChatroom(chatroomDto);
    
    ChatroomParticipateDto chatroomParticipateDto1 = ChatroomParticipateDto.builder()
                                                              .chatroomNo(chatroomDto.getChatroomNo())
                                                              .participantNo(loginUserNo)
                                                          .build();

    ChatroomParticipateDto chatroomParticipateDto2 = ChatroomParticipateDto.builder()
                                                              .chatroomNo(chatroomDto.getChatroomNo())
                                                              .participantNo(chatUserNo)
                                                          .build();
    
    int insertOneToOneParticipantCount = chatMapper.insertNewParticipate(chatroomParticipateDto1);
    insertOneToOneParticipantCount += chatMapper.insertNewParticipate(chatroomParticipateDto2);
    
    Map<String, Object> map = Map.of("loginUserNo", loginUserNo, "chatUserNo", chatUserNo);
    ChatroomDto newChatroomDto = chatMapper.isOneToOneChatroomExits(map);
    
    if(insertOneToOneChatroomCount == 1 && insertOneToOneParticipantCount == 2) {
      return ResponseEntity.ok(Map.of("insertOneToOneCount", 1,
                                      "chatroom", newChatroomDto));
    } else {
      return ResponseEntity.ok(Map.of("insertOneToOneCount", 0));
    }
  }
  
  
  // 그룹 채팅방 추가
  @Override
  public ResponseEntity<Map<String, Object>> addGroupChatroom(Map<String, Object> params) {
    
      int loginUserNo = Integer.parseInt(String.valueOf(params.get("loginUserNo")));
      String chatroomTitle = String.valueOf(params.get("chatroomTitle"));
      
      String employeeNoListStr = (String) params.get("employeeNoList");
      employeeNoListStr = employeeNoListStr.replace("[", "").replace("]", "").replace("\"", "").replace(" ", "");
      List<Integer> employeeNoList = Arrays.stream(employeeNoListStr.split(","))
                                           .map(Integer::parseInt)
                                            .toList();
      
      ChatroomDto chatroomDto = ChatroomDto.builder()
                                      .chatroomTitle(chatroomTitle)
                                      .chatroomType("Group")
                                      .creatorNo(loginUserNo)
                                    .build();
      
      int insertGroupChatroomCount = chatMapper.insertNewChatroom(chatroomDto);
      List<EmployeesDto> employeeList = new ArrayList<>();
      
      int insertGroupParticipantCount = 0;
      for(int i = 0, size = employeeNoList.size(); i < size; i++) {
        
        ChatroomParticipateDto chatroomParticipateDto = ChatroomParticipateDto.builder()
                                                                  .chatroomNo(chatroomDto.getChatroomNo())
                                                                  .participantNo(employeeNoList.get(i))
                                                                .build();
        
        insertGroupParticipantCount += chatMapper.insertNewParticipate(chatroomParticipateDto);
        
        employeeList.add(userMapper.getUserProfileByNo(employeeNoList.get(i)));
      }
      
      ChatroomParticipateDto chatroomParticipateDto = ChatroomParticipateDto.builder()
                                                                .chatroomNo(chatroomDto.getChatroomNo())
                                                                .participantNo(loginUserNo)
                                                              .build();
      
      insertGroupParticipantCount += chatMapper.insertNewParticipate(chatroomParticipateDto);
      ChatroomDto newChatroomDto = chatMapper.getChatroomByChatroomNo(chatroomDto.getChatroomNo());
      
      EmployeesDto me = userMapper.getUserProfileByNo(loginUserNo);
      
      StringBuilder builder = new StringBuilder();
      builder.append(me.getName())
              .append(" ")
              .append(me.getRank().getRankTitle())
              .append("님이 ");

      for(int i = 0, size = employeeList.size(); i < size; i++) {

        builder.append(employeeList.get(i).getName())
                .append(" ")
                .append(employeeList.get(i).getRank().getRankTitle())
                .append("님");

        if (i < size - 1) {
          builder.append(", ");
        }
      }
      builder.append("을(를) 초대하였습니다.");
      
      String JoinMessage = builder.toString();
      
      MessageDto message = MessageDto.builder()
                                  .messageType(MessageType.JOIN)
                                  .messageContent(JoinMessage)
                                  .chatroomNo(newChatroomDto.getChatroomNo())
                                  .senderNo(loginUserNo)
                               .build();

      int insertMessageCount = chatMapper.insertChatMessage(message);
      
      if(insertGroupChatroomCount == 1 && insertGroupParticipantCount == employeeNoList.size() + 1 && insertMessageCount == 1) {
        return ResponseEntity.ok(Map.of("insertGroupCount", 1,
                                        "chatroom", newChatroomDto));
      } else {
        return ResponseEntity.ok(Map.of("insertGroupCount", 0));
      }
    }  
  
  
  // 채팅방 참여자 리스트로 받아서 추가하기
  @Override
  public Map<String, Object> insertNewParticipateList(Map<String, Object> params) {
    
    List<Integer> participantNoList = (List<Integer>) params.get("participantNoList");
    int chatroomNo = Integer.parseInt(String.valueOf(params.get("chatroomNo")));
    int employeeNo = Integer.parseInt(String.valueOf(params.get("employeeNo")));
    
    int addParticipantCount = chatMapper.insertNewParticipateList(Map.of("participantNoList", participantNoList, "chatroomNo", chatroomNo));
    
    int count = chatMapper.getChatroomParticipantCount(chatroomNo);
    if(count > 2) {
      chatMapper.updateChatroomType(Map.of("chatroomNo", chatroomNo, "chatroomType", "Group"));
    } 
    
    List<EmployeesDto> participantList = userMapper.getUserProfileList(participantNoList);
    
    StringBuilder builder = new StringBuilder();
    for(int i = 0, size = participantList.size(); i < size; i++) {
      builder.append(participantList.get(i).getName())
              .append(" ")
              .append(participantList.get(i).getRank().getRankTitle())
              .append("님");

      if (i < size - 1) {
        builder.append(", ");
      }
    }
    builder.append("이 초대되었습니다.");
    
    String JoinMessage = builder.toString();
    
    MessageDto message = MessageDto.builder()
                                .messageType(MessageType.ADD)
                                .messageContent(JoinMessage)
                                .chatroomNo(chatroomNo)
                                .senderNo(employeeNo)
                             .build();
    
    int insertMessageCount = chatMapper.insertChatMessage(message);
    
    if(addParticipantCount == participantNoList.size()) {
      return Map.of("addParticipantCount", addParticipantCount,
                    "participantList", participantList,
                    "insertMessageCount", insertMessageCount,
                    "JoinMessage", JoinMessage);
    } else {
      return Map.of("error", "error");
    }
  }
  
  
  // 채팅 내역 가져오기
  @Transactional(readOnly = true)
  @Override
  public ResponseEntity<Map<String, Object>> getChatMessageList(int chatroomNo, int page) {

    try {
      
      int total = chatMapper.getChatMessageCount(chatroomNo);
      int display = 20;
      
      myPageUtils.setPaging(total, display, page);
      
      Map<String, Object> map = Map.of("chatroomNo", chatroomNo,
                                       "begin", myPageUtils.getBegin(),
                                       "end", myPageUtils.getEnd());
      
      List<MessageDto> chatMessageList = chatMapper.getChatMessageList(map);
      
      return ResponseEntity.ok(Map.of("chatMessageList", chatMessageList,
                                      "chatMessageTotalPage", myPageUtils.getTotalPage()));
    } catch (Exception e) {
      log.error("채팅 내역 조회 실패: ", e);
    }
    
    return null;

  }
  
  // 채팅방 목록 가져오기
  @Transactional(readOnly = true)
  @Override
  public ResponseEntity<Map<String, Object>> getChatList(int employeeNo) {
    List<ChatroomDto> chatroomList = chatMapper.getChatList(employeeNo);
    
    for(int i = 0; i < chatroomList.size(); i++) {
      int chatroomNo = chatroomList.get(i).getChatroomNo();
      int participantCount = chatMapper.getChatroomParticipantCount(chatroomNo);
      chatroomList.get(i).setParticipantCount(participantCount);
    }
    
    return ResponseEntity.ok(Map.of("chatroomList", chatroomList));
  }
  
  // 채팅방 번호로 채팅방 가져오기
  @Transactional(readOnly = true)
  @Override
  public ResponseEntity<Map<String, Object>> getChatroomByChatroomNo(int chatroomNo) {
    return ResponseEntity.ok(Map.of("chatroom", chatMapper.getChatroomByChatroomNo(chatroomNo)));
  }
  
  // 채팅방 참여자 정보 가져오기
  @Transactional(readOnly = true)
  @Override
  public ResponseEntity<Map<String, Object>> getChatroomParticipantList(int chatroomNo) {
    List<ChatroomParticipateDto> employeeNoList = chatMapper.getChatroomParticipantList(chatroomNo);
    return ResponseEntity.ok(Map.of("employeeNoList", employeeNoList));
  }
  
  // 채팅방 참여자 상태 변경
  @Override
  public int updateParticipateStatus(Map<String, Object> params) {
    return chatMapper.updateParticipateStatus(params);
  }
  
  // 채팅방 나가기
  @Override
  public ResponseEntity<Map<String, Object>> deleteParticipant(int chatroomNo, int participantNo) {

    Map<String, Object> map = Map.of("chatroomNo", chatroomNo,
                                     "participantNo", participantNo);
    
    int deleteCount = chatMapper.deleteParticipant(map);
    
    int count = chatMapper.getChatroomParticipantCount(chatroomNo);
    if(count < 2) {
      chatMapper.updateChatroomType(Map.of("chatroomNo", chatroomNo, "chatroomType", "OneToOne"));
    }
    
    EmployeesDto me = userMapper.getUserProfileByNo(participantNo);

    String LeaveMessage = me.getName() + " " + me.getRank().getRankTitle() + "님이 채팅방을 나갔습니다.";
    
    ChatroomDto chatroom = chatMapper.getChatroomByChatroomNo(chatroomNo);
    
    return ResponseEntity.ok(Map.of("deleteCount", deleteCount,
                                    "chatroom", chatroom,
                                    "LeaveMessage", LeaveMessage));

  }
  
  // 채팅인원 0명인 채팅방 삭제
  @Override
  public void deleteNoParticipateChatroom() {
    
    chatMapper.deleteNoParticipateMessage();
    chatMapper.deleteNoParticipateChatroom();
  }
  
  // 채팅방 이름 변경하기
  @Override
  public int updateChatroomTitle(Map<String, Object> params) {
    
    try {
        int chatroomNo =  Integer.parseInt(String.valueOf(params.get("chatroomNo")));
        String chatroomTitle = (String) params.get("chatroomTitle");

        Map<String, Object> map = Map.of("chatroomNo", chatroomNo
                                       , "chatroomTitle", chatroomTitle);

        return chatMapper.updateChatroomTitle(map);

    } catch (Exception e) {
      log.error("채팅방 이름 변경 실패: ", e);
    }

    return 0;
  }
}
