package com.gdu.academix.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.gdu.academix.interceptor.CustomHandshakeHanlder;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  // 메시지 브로커 설정 - 메시지를 어떤 경로로 주고받을 것인가?
  @Override
  public void configureMessageBroker(MessageBrokerRegistry registry) {

    // 클라이언트가 구독(subscribe)할 수 있는 브로커 경로 지정
    // enableSimpleBroker는 내장 브로커를 사용한다는 뜻.
    // ex) /topic: 1:N 브로드캐스팅 용, /queue: 1:1 개인 메시지 전송
    registry.enableSimpleBroker("/topic", "/queue");

    // 클라이언트가 메시지 보낼 때 사용하는 경로 prefix 설정
    // ex) /send/one/1(채팅방 번호) - @MessageMapping("/one/{chatroomNo}")로 매핑된다.
    registry.setApplicationDestinationPrefixes("/send");

    // 사용자 개별 메시지 전송 위한 prefix
    // 서버에서 특정 사용자에게 메시지 보낼 때 사용 - 알림메시지 전송
    registry.setUserDestinationPrefix("/user");
  }
  
  // 클라이언트가 WebSocket으로 최초 연결할 때 사용하는 엔드포인트 등록
  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {

    // /ws-stomp 엔드포인트로 클라이언트가 WebSocket 연결을 시도한다.
    // setHandshackHandler - WebSocket 연결 시 인증이나 사용자 정보를 커스터마이징 함.
    // setAllowedOriginPatterns("*") - CORS 허용, 모든 도메인에서 접근 가능하게 해준다.
    registry.addEndpoint("/ws-stomp")
            .setHandshakeHandler(new CustomHandshakeHanlder())
            .setAllowedOriginPatterns("*");

    // 위와 동일한 엔드포인트를 SockJS로도 등록한다.
    // withSockJS()는 WebSocket이 지원되지 않는 환경(옛 브라우저...)등에서도 fallback할 수 있게 해줌.
    registry.addEndpoint("/ws-stomp")
            .setHandshakeHandler(new CustomHandshakeHanlder())
            .setAllowedOriginPatterns("*")
            .withSockJS();
  }

}
