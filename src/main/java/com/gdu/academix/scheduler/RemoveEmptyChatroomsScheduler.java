package com.gdu.academix.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;

import com.gdu.academix.service.ChatService;

public class RemoveEmptyChatroomsScheduler {
  
  @Autowired
  private ChatService chatService;
  
  @Scheduled(cron = "0 */10 * * * *")
  public void excute() {
    chatService.deleteNoParticipateChatroom();
  }

}
