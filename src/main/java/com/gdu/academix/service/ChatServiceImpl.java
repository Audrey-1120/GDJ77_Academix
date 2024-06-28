package com.gdu.academix.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.gdu.academix.dto.ChatroomDto;
import com.gdu.academix.dto.ChatroomParticipateDto;
import com.gdu.academix.dto.EmployeesDto;
import com.gdu.academix.dto.MessageDto;
import com.gdu.academix.dto.MessageDto.MessageType;
import com.gdu.academix.mapper.ChatMapper;
import com.gdu.academix.mapper.UserMapper;
import com.gdu.academix.utils.MyPageUtils;

@Service
public class ChatServiceImpl implements ChatService {
  
  private ChatMapper chatMapper;
  private UserMapper userMapper;
  
  private MyPageUtils myPageUtils;

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
    
    // DB에 메시지 저장
    int insertMessageCount = chatMapper.insertChatMessage(chatMessage);
    
    // 현재 시간만 추가해서 message에 넣기
    long currentTimeMillis = System.currentTimeMillis();
    Timestamp currentTimestamp = new Timestamp(currentTimeMillis); 
    chatMessage.setSendDt(currentTimestamp);
    
      // 최종 반환 map 생성
      Map<String, Object> map = Map.of("insertMessageCount", insertMessageCount,
                                       "chatMessage", chatMessage);
      return map;

  }
  
  // 1:1 채팅방 여부 확인
  @Override
  public ChatroomDto isOneToOneChatroomExits(int loginUserNo, int chatUserNo) {
    Map<String, Object> map = Map.of("loginUserNo", loginUserNo, "chatUserNo", chatUserNo);
    
    ChatroomDto chatroom = chatMapper.isOneToOneChatroomExits(map);
    if(chatroom == null) {
      chatroom = new ChatroomDto();
    }
    return chatroom;
  }
  
  @Override
  public ResponseEntity<Map<String, Object>> addOneToOneChatroom(Map<String, Object> params) {

    int loginUserNo = Integer.parseInt(String.valueOf(params.get("loginUserNo")));
    int chatUserNo = Integer.parseInt(String.valueOf(params.get("chatUserNo")));
    
    // 해당 유저 데이터 가져오기
    EmployeesDto loginUser = userMapper.getUserProfileByNo(loginUserNo);
    EmployeesDto chatUser = userMapper.getUserProfileByNo(chatUserNo);
    
    
    // 1. chatroomDto 생성.
    ChatroomDto chatroomDto = ChatroomDto.builder()
                                  .chatroomTitle(loginUser.getName() + ", " + chatUser.getName())
                                  .chatroomType("OneToOne")
                                  .creatorNo(loginUserNo)
                                .build();
    
    // 2. 생성한 chatroomDto를 chatMapper에 보냄.
    int insertOneToOneChatroomCount = chatMapper.insertNewChatroom(chatroomDto);
    

    
    
    // 3. ChatroomParticipateDto 생성
    ChatroomParticipateDto chatroomParticipateDto1 = ChatroomParticipateDto.builder()
                                                              .chatroomNo(chatroomDto.getChatroomNo())
                                                              .participantNo(loginUserNo)
                                                          .build();
    ChatroomParticipateDto chatroomParticipateDto2 = ChatroomParticipateDto.builder()
                                                              .chatroomNo(chatroomDto.getChatroomNo())
                                                              .participantNo(chatUserNo)
                                                          .build();
    
    
    // 4. 순서대로 chatroom_participate_t 삽입
    int insertOneToOneParticipantCount = 0;
    insertOneToOneParticipantCount = chatMapper.insertNewParticipate(chatroomParticipateDto1);
    insertOneToOneParticipantCount += chatMapper.insertNewParticipate(chatroomParticipateDto2);
    
    // 5. 채팅방 여부 메소드를 통해 새로 넣은 객체 가져옴.
    Map<String, Object> map = Map.of("loginUserNo", loginUserNo, "chatUserNo", chatUserNo);
    ChatroomDto newChatroomDto = chatMapper.isOneToOneChatroomExits(map);
    
    // 6. 삽입 성공 여부를 담은 값과 새로 생성한 chatroomDto 객체를 보낸다.
    if(insertOneToOneChatroomCount == 1 && insertOneToOneParticipantCount == 2) {
      return ResponseEntity.ok(Map.of("insertOneToOneCount", 1,
                                      "chatroom", newChatroomDto));
    } else {
      return ResponseEntity.ok(Map.of("insertOneToOneCount", 0));
    }
    
  }
  
  
  
  @Override
    public ResponseEntity<Map<String, Object>> addGroupChatroom(Map<String, Object> params) {
    
      // 보낸 데이터 가져오기
      int loginUserNo = Integer.parseInt(String.valueOf(params.get("loginUserNo")));
      //List<Integer> employeeNoList = (List<Integer>) params.get("employeeNoList");
      String chatroomTitle = String.valueOf(params.get("chatroomTitle"));
      
      // employeeNoList 받아오기
      // 1. 문자열을 리스트로 변환한다.
      String employeeNoListStr = (String) params.get("employeeNoList");
      employeeNoListStr = employeeNoListStr.replace("[", "").replace("]", "").replace("\"", "").replace(" ", "");
      List<Integer> employeeNoList = Arrays.stream(employeeNoListStr.split(","))
                                           .map(Integer::parseInt)
                                           .collect(Collectors.toList());
      
      // 1. chatroomDto 생성
      ChatroomDto chatroomDto = ChatroomDto.builder()
                                      .chatroomTitle(chatroomTitle)
                                      .chatroomType("Group")
                                      .creatorNo(loginUserNo)
                                    .build();
      
      // 2. 생성한 chatroomDto를 chatMapper에 보냄.
      int insertGroupChatroomCount = chatMapper.insertNewChatroom(chatroomDto);
      
      // 메시지 만들때 사용할 회원 리스트
      List<EmployeesDto> employeeList = new ArrayList<>();
      
      // 3. ChatroomParticipateDto 생성 후 순서대로 chatroom_participate_t 삽입
      int insertGroupParticipantCount = 0;
      for(int i = 0, size = employeeNoList.size(); i < size; i++) {
        
        // for문 돌면서 객체 생성
        ChatroomParticipateDto chatroomParticipateDto = ChatroomParticipateDto.builder()
                                                                  .chatroomNo(chatroomDto.getChatroomNo())
                                                                  .participantNo(employeeNoList.get(i))
                                                                .build();
        
        insertGroupParticipantCount += chatMapper.insertNewParticipate(chatroomParticipateDto);
        
        // 회원 객체 가져와서 리스트에 담기
        employeeList.add(userMapper.getUserProfileByNo(employeeNoList.get(i)));
      }
      
      // 4. 내것도 넣기
      ChatroomParticipateDto chatroomParticipateDto = ChatroomParticipateDto.builder()
                                                                .chatroomNo(chatroomDto.getChatroomNo())
                                                                .participantNo(loginUserNo)
                                                              .build();
      
      insertGroupParticipantCount += chatMapper.insertNewParticipate(chatroomParticipateDto);
      
      // 5. 채팅방 여부 메소드를 통해 새로 넣은 객체 가져옴. (프론트에서 띄워야 하기 때문에)
      ChatroomDto newChatroomDto = chatMapper.getChatroomByChatroomNo(chatroomDto.getChatroomNo());
      
      // +++ 처음 환영 메시지 추가
      // 1.1 내 객체 가져오기 - 이름 필요
      EmployeesDto me = userMapper.getUserProfileByNo(loginUserNo);
      
      StringBuilder builder = new StringBuilder();
      builder.append(me.getName() + " " + me.getRank().getRankTitle() + "님이 ");
      for(int i = 0, size = employeeList.size(); i < size; i++) {
        builder.append(employeeList.get(i).getName() + " " + employeeList.get(i).getRank().getRankTitle() + "님");
        if (i < size - 1) {
          builder.append(", ");
        }
      }
      builder.append("을(를) 초대하였습니다.");
      
      String JoinMessage = builder.toString();
      
      // 1.2 메시지 객체 생성 후 추가하기
      MessageDto message = MessageDto.builder()
                                  .messageType(MessageType.JOIN)
                                  .messageContent(JoinMessage)
                                  .chatroomNo(newChatroomDto.getChatroomNo())
                                  .senderNo(loginUserNo)
                               .build();
      int insertMessageCount = chatMapper.insertChatMessage(message);
      
      // 6. 삽입 성공 여부를 담은 값과 새로 생성한 chatroomDto 객체를 보낸다.
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
    
    // 추가 참여자 직원 번호 리스트 가져오기
    List<Integer> participantNoList = (List<Integer>) params.get("participantNoList");
    int chatroomNo = Integer.parseInt(String.valueOf(params.get("chatroomNo")));
    int employeeNo = Integer.parseInt(String.valueOf(params.get("employeeNo")));
    
    // 참여자 리스트 추가하기
    int addParticipantCount = chatMapper.insertNewParticipateList(Map.of("participantNoList", participantNoList, "chatroomNo", chatroomNo));
    
    // 여기서...해당 CHATROOM_NO에 해당하는 참여자 번호를 가져온다.
    // 그래서 참여자 번호 리스트의 수가 2 이상이면 TYPE을 GROUP으로 변경
    int count = chatMapper.getChatroomParticipantCount(chatroomNo);
    if(count > 2) {
      chatMapper.updateChatroomType(Map.of("chatroomNo", chatroomNo, "chatroomType", "Group"));
    } 
    
    // 참여자 리스트 직원 정보 가져오기
    List<EmployeesDto> participantList = userMapper.getUserProfileList(participantNoList);
    
    StringBuilder builder = new StringBuilder();
    for(int i = 0, size = participantList.size(); i < size; i++) {
      builder.append(participantList.get(i).getName() + " " + participantList.get(i).getRank().getRankTitle() + "님");
      if (i < size - 1) {
        builder.append(", ");
      }
    }
    builder.append("이 초대되었습니다.");
    
    String JoinMessage = builder.toString();
    
    // 1.2 메시지 객체 생성 후 추가하기
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
  @Override
  public ResponseEntity<Map<String, Object>> getChatMessageList(int chatroomNo, int page) {

    try {
      
     // 채팅방 메시지 전체 개수
      int total = chatMapper.getChatMessageCount(chatroomNo);
      
      // 한번에 가지고올 메시지 개수
      int display = 20;
      
      // 페이징 처리
      myPageUtils.setPaging(total, display, page);
      
      // DB에 필요한 map 생성
      Map<String, Object> map = Map.of("chatroomNo", chatroomNo,
                                       "begin", myPageUtils.getBegin(),
                                       "end", myPageUtils.getEnd());
      
      // 채팅 내역 리스트 가져오기
      List<MessageDto> chatMessageList = chatMapper.getChatMessageList(map);
      
      return ResponseEntity.ok(Map.of("chatMessageList", chatMessageList,
                                      "chatMessageTotalPage", myPageUtils.getTotalPage()));
    } catch (Exception e) {
      e.printStackTrace();
    }
    
    return null;
    
  }
  
  
  
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
  
  @Override
  public ResponseEntity<Map<String, Object>> getChatroomByChatroomNo(int chatroomNo) {
    return ResponseEntity.ok(Map.of("chatroom", chatMapper.getChatroomByChatroomNo(chatroomNo)));
  }
  
  @Override
  public ResponseEntity<Map<String, Object>> getChatroomParticipantList(int chatroomNo) {
    List<ChatroomParticipateDto> employeeNoList = chatMapper.getChatroomParticipantList(chatroomNo);
    return ResponseEntity.ok(Map.of("employeeNoList", employeeNoList));
  }
  
  @Override
  public int updateParticipateStatus(Map<String, Object> params) {
    return chatMapper.updateParticipateStatus(params);
  }
  
  @Override
  public ResponseEntity<Map<String, Object>> deleteParticipant(int chatroomNo, int participantNo) {

    // 1. 해당 값을 map에 담는다.
    Map<String, Object> map = Map.of("chatroomNo", chatroomNo,
                                     "participantNo", participantNo);
    
    // 2. map을 DB로 보낸다.
    int deleteCount = chatMapper.deleteParticipant(map);
    
    // 만약에...참여자수가 2명 이하라면.. type을 OneToOne으로 변경한다.
    int count = chatMapper.getChatroomParticipantCount(chatroomNo);
    if(count < 2) {
      chatMapper.updateChatroomType(Map.of("chatroomNo", chatroomNo, "chatroomType", "OneToOne"));
    }
    
    // 3. 채팅방 퇴장 메시지를 만든다.
    EmployeesDto me = userMapper.getUserProfileByNo(participantNo);

    StringBuilder builder = new StringBuilder();
    builder.append(me.getName() + " " + me.getRank().getRankTitle() + "님이 채팅방을 나갔습니다.");

    String LeaveMessage = builder.toString();
    
    // 4. chatroomNo에 해당하는 chatroom객체를 가져온다.
    ChatroomDto chatroom = chatMapper.getChatroomByChatroomNo(chatroomNo);
    
    // 5. 성공 여부를 담은 값, 채팅방 번호, 퇴장 메시지를 map에 담아서 반환한다.
    return ResponseEntity.ok(Map.of("deleteCount", deleteCount,
                                    "chatroom", chatroom,
                                    "LeaveMessage", LeaveMessage));
    
    
  }
  
  @Override
  public void deleteNoParticipateChatroom() {
    
    // 메시지 데이터 지우기ㅒ
    chatMapper.deleteNoParticipateMessage();
    // 채팅방 데이터 지우기
    chatMapper.deleteNoParticipateChatroom();
  }
  
  @Override
  public int updateChatroomTitle(Map<String, Object> params) {
    
  try {
      int chatroomNo =  Integer.parseInt(String.valueOf(params.get("chatroomNo"))); 
      String chatroomTitle = (String) params.get("chatroomTitle");
      
      // 파라미터를 map으로 만듬
      Map<String, Object> map = Map.of("chatroomNo", chatroomNo
                                     , "chatroomTitle", chatroomTitle);
      
      int updateTitleCount = chatMapper.updateChatroomTitle(map);

      return updateTitleCount;
      
  } catch (Exception e) {
    e.printStackTrace();
  }
  
  return 0;
    

  }
  
  

}
