package com.gdu.academix.interceptor;

import java.security.Principal;
import java.util.Map;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.util.MultiValueMap;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;
import org.springframework.web.util.UriComponentsBuilder;

import com.gdu.academix.dto.CustomPrincipal;

public class CustomHandshakeHanlder extends DefaultHandshakeHandler {
  
  @Override
  protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler,
      Map<String, Object> attributes) {
    
    // 수정하기!!
    String employeeNo = UriComponentsBuilder.fromUri(request.getURI()).build().getQueryParams().getFirst("employeeNo");
    System.out.println("Handshake employeeNo: " + employeeNo);
    
    //String sessionId = UUID.randomUUID().toString();
    return new CustomPrincipal("user-" + employeeNo);
    
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  /*
   * @Override public boolean beforeHandshake(ServerHttpRequest request,
   * ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object>
   * attributes) throws Exception {
   * 
   * String employeeNo = extractEmployeeNo(request); attributes.put("user", new
   * CustomPrincipal(employeeNo)); return true; }
   * 
   * @Override public void afterHandshake(ServerHttpRequest request,
   * ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception)
   * {
   * 
   * }
   * 
   * 
   * // ServletHttpRequest에서 HttpSession 추출 private HttpSession
   * getSession(ServerHttpRequest request) { // request객체가
   * ServletServerHttpRequest의 인스턴스인가? // 다시 말해서 WebSocket 요청이 서블릿 기반의 HTTP 요청인지
   * if(request instanceof ServletServerHttpRequest) {
   * 
   * // request가 ServletServerHttpRequest의 인스턴스인 경우, 이를 ServletServerHttpRequest로
   * 캐스팅 ServletServerHttpRequest servletRequest = (ServletServerHttpRequest)
   * request;
   * 
   * // HttpServletRequest 추출.. -> getServletRequest() 사용 // getSession(false)는 현재
   * 요청과 연결된 세션이 있으면 이를 반환하고, // 없으면 null을 반환. 이는 새로운 세션을 생성하지 않기 위해서 return
   * servletRequest.getServletRequest().getSession(false); } return null; }
   * 
   * 
   * 
   * 
   * private String extractEmployeeNo(ServerHttpRequest request) {
   * 
   * // 요청에서 사용자명을 추출하는 로직 구현 // 세션에서 사용자명 가져오는 로직 HttpSession httpSession =
   * getSession(request); if(httpSession != null) { EmployeesDto user =
   * (EmployeesDto) httpSession.getAttribute("user"); if(user != null) { return
   * String.valueOf(user.getEmployeeNo()); } }
   * 
   * return "unknownEmployeeNo"; }
   */

}
