package com.gdu.academix.service;

import com.gdu.academix.dto.EmployeesDto;
import com.gdu.academix.dto.UserDto;
import com.gdu.academix.mapper.UserMapper;
import com.gdu.academix.utils.MySecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Transactional
@Service
public class UserServiceImpl implements UserService {

  private final UserMapper userMapper;

  private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);
  
  public UserServiceImpl(UserMapper userMapper) {
    super();
    this.userMapper = userMapper;
  }

  // 이메일 중복 체크
  @Transactional(readOnly=true)
  @Override
  public ResponseEntity<Map<String, Object>> checkEmail(Map<String, Object> params) {
    boolean enableEmail = userMapper.getUserByMap(params) == null
        && userMapper.getLeaveUserByMap(params) == null;
    return new ResponseEntity<>(Map.of("enableEmail", enableEmail)
        , HttpStatus.OK);
  }

  // 회원탈퇴
  @Override
  public void leave(HttpServletRequest request, HttpServletResponse response) {
    
    try {

      HttpSession session = request.getSession();
      UserDto user = (UserDto) session.getAttribute("user");

      if(user == null) {
        response.sendRedirect(request.getContextPath() + "/main.page");
      }
      
      int deleteCount = userMapper.deleteUser(user.getUserNo());
      
      response.setContentType("text/html");
      PrintWriter out = response.getWriter();
      out.println("<script>");
      
      if(deleteCount == 1) {
        
        session.invalidate();
        
        out.println("alert('탈퇴되었습니다. 이용해 주셔서 감사합니다.');");
        out.println("location.href='" + request.getContextPath() + "/main.page';");
        
      } else {
        out.println("alert('탈퇴되지 않았습니다.');");
        out.println("history.back();");
      }
      out.println("</script>");
      
    } catch (Exception e) {
      log.error("회원탈퇴 실패: ", e);
    }
  }
  
  @Override
  public void signin(HttpServletRequest request, HttpServletResponse response) {
    
    try {
      
      String email = request.getParameter("email");
      String pw = MySecurityUtils.getSha256(request.getParameter("password"));
      
      String ip = request.getRemoteAddr();
      String userAgent = request.getHeader("User-Agent");

      Map<String, Object> params = Map.of("email", email
                                        , "password", pw
                                        , "ip", ip
                                        , "userAgent", userAgent
                                        , "sessionId", request.getSession().getId());
      
      EmployeesDto user = userMapper.getUserByMap(params);
      
      if(user != null) {

        HttpSession session = request.getSession();
        session.setAttribute("user", user);
        response.sendRedirect("/main.page");
      
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
      log.error("로그인 실패: ", e);
    }
  }

  @Override
  public void signout(HttpServletRequest request, HttpServletResponse response) {
    
    try {
      
      HttpSession session = request.getSession();
      session.invalidate();
      
      response.sendRedirect(request.getContextPath() + "/user/signin.page");
      
    } catch (Exception e) {
      log.error("로그아웃 실패: ", e);
    }
    
  }
  
  @Override
  public ResponseEntity<Map<String, Object>> getUserList() {
    return ResponseEntity.ok(Map.of("employee", userMapper.getUserList(), "departments", userMapper.getDepartmentsList()));
  }
  
  @Override
  public EmployeesDto getUserProfileByNo(int employeeNo) {
    return userMapper.getUserProfileByNo(employeeNo);
  }
  
  @Override
  public ResponseEntity<Map<String, Object>> getUserProfileListByNo(List<Integer> employeeNoList) {

    List<EmployeesDto> employeeList = new ArrayList<>();
    
    for (Integer employeeNo : employeeNoList) {
       employeeList.add(userMapper.getUserProfileByNo(employeeNo));
    }
  
    return ResponseEntity.ok(Map.of("employeeList", employeeList));

  }
}