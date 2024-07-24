package com.gdu.academix.service;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gdu.academix.dto.EmployeesDto;
import com.gdu.academix.dto.UserDto;
import com.gdu.academix.mapper.UserMapper;
import com.gdu.academix.utils.MyJavaMailUtils;
import com.gdu.academix.utils.MySecurityUtils;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

@Transactional
@Service
public class UserServiceImpl implements UserService {

  private final UserMapper userMapper;
  private final MyJavaMailUtils myJavaMailUtils;
  
  public UserServiceImpl(UserMapper userMapper, MyJavaMailUtils myJavaMailUtils) {
    super();
    this.userMapper = userMapper;
    this.myJavaMailUtils = myJavaMailUtils;
  }
  

  @Transactional(readOnly=true)
  @Override
  public ResponseEntity<Map<String, Object>> checkEmail(Map<String, Object> params) {
    boolean enableEmail = userMapper.getUserByMap(params) == null
        && userMapper.getLeaveUserByMap(params) == null;
    return new ResponseEntity<>(Map.of("enableEmail", enableEmail)
        , HttpStatus.OK);
  }
  
  @Override
  public void leave(HttpServletRequest request, HttpServletResponse response) {
    
    try {

      // 세션에 저장된 user 값 확인
      HttpSession session = request.getSession();
      UserDto user = (UserDto) session.getAttribute("user");
      
      // 세션 만료로 user 정보가 세션에 없을 수 있음
      if(user == null) {
        response.sendRedirect(request.getContextPath() + "/main.page");
      }
      
      // 탈퇴 처리
      int deleteCount = userMapper.deleteUser(user.getUserNo());
      
      // 탈퇴 이후 응답 만들기
      response.setContentType("text/html");
      PrintWriter out = response.getWriter();
      out.println("<script>");
      
      // 탈퇴 성공
      if(deleteCount == 1) {
        
        // 세션에 저장된 모든 정보 초기화
        session.invalidate();  // SessionStatus 객체의 setComplete() 메소드 호출
        
        out.println("alert('탈퇴되었습니다. 이용해 주셔서 감사합니다.');");
        out.println("location.href='" + request.getContextPath() + "/main.page';");
        
      // 탈퇴 실패
      } else {
        out.println("alert('탈퇴되지 않았습니다.');");
        out.println("history.back();");
      }
      out.println("</script>");
      
    } catch (Exception e) {
      e.printStackTrace();
    }
    
  }
  
  @Override
  public void signin(HttpServletRequest request, HttpServletResponse response) {
    
    try {
      
      // 입력한 아이디
      String email = request.getParameter("email");
      
      // 입력한 비밀번호 + SHA-256 방식의 암호화
      String pw = MySecurityUtils.getSha256(request.getParameter("password"));
      
      System.out.println("password" + pw);
      
      // 접속 IP (접속 기록을 남길 때 필요한 정보)
      String ip = request.getRemoteAddr();
      
      // 접속 수단 (요청 헤더의 User-Agent 값)
      String userAgent = request.getHeader("User-Agent");

      // DB로 보낼 정보 (email/pw: USER_T , email/ip/userAgent/sessionId: ACCESS_HISTORY_T) 
      Map<String, Object> params = Map.of("email", email
                                        , "password", pw
                                        , "ip", ip
                                        , "userAgent", userAgent
                                        , "sessionId", request.getSession().getId());
      
      // email/pw 가 일치하는 회원 정보 가져오기
      EmployeesDto user = userMapper.getUserByMap(params);
      
      // 일치하는 회원 있음 (Sign In 성공)
      if(user != null) {
        
        // 접속 기록 ACCESS_HISTORY_T 에 남기기
        // userMapper.insertAccessHistory(params);
        
        // 회원 정보를 세션(브라우저 닫기 전까지 정보가 유지되는 공간, 기본 30분 정보 유지)에 보관하기
        HttpSession session = request.getSession();
        session.setAttribute("user", user);
        
        // session.setMaxInactiveInterval(180 * 10);  // 세션 유지 시간 1800초(30분) 설정
        
        // Sign In 후 페이지 이동
        response.sendRedirect("/main.page");
      
      // 일치하는 회원 없음 (Sign In 실패)
      } else {
        response.setContentType("text/html; charset=UTF-8");
        PrintWriter out = response.getWriter();
        out.println("<script>");
        out.println("alert('일치하는 회원 정보가 없습니다.');");
        out.println("location.href='" + request.getContextPath() + "/user/signin.page';");
        out.println("</script>");
        out.flush();
        out.close();
      }
      
    } catch (Exception e) {
      e.printStackTrace();
    }
    
  }

  @Override
  public void signout(HttpServletRequest request, HttpServletResponse response) {
    
    try {
      
      // Sign Out 기록 남기기
      HttpSession session = request.getSession();
      String sessionId = session.getId(); 
      // userMapper.updateAccessHistory(sessionId);
      
      // 세션에 저장된 모든 정보 초기화
      session.invalidate();
      
      // 메인 페이지로 이동
      response.sendRedirect(request.getContextPath() + "/user/signin.page");
      
    } catch (Exception e) {
      e.printStackTrace();
    }
    
  }
  
  // 오채원 - 추가(24/05/28)
  @Override
  public ResponseEntity<Map<String, Object>> getUserList() {
    System.out.println("department" + userMapper.getDepartmentsList());
    return ResponseEntity.ok(Map.of("employee", userMapper.getUserList(), "departments", userMapper.getDepartmentsList()));
  }
  
  @Override
  public EmployeesDto getUserProfileByNo(int employeeNo) {
    return userMapper.getUserProfileByNo(employeeNo);
  }
  
  @Override
  public ResponseEntity<Map<String, Object>> getUserProfileListByNo(List<Integer> employeeNoList) {

    // 리스트를 돌면서 반환한 객체를 저장할 리스트 생성
    List<EmployeesDto> employeeList = new ArrayList<>();
    
    // employeeNoList를 반복문으로 돌면서 반환 객체를 employeeList에 저장
    for (Integer employeeNo : employeeNoList) {
       employeeList.add(userMapper.getUserProfileByNo(employeeNo));
    }
  
    return ResponseEntity.ok(Map.of("employeeList", employeeList));
   
 
 
  }
}