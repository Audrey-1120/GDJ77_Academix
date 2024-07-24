package com.gdu.academix.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.gdu.academix.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RequestMapping("/user")
@Controller
public class UserController {

  private final UserService userService;

  public UserController(UserService userService) {
    super();
    this.userService = userService;
  }

  @GetMapping("/list.page")
  public String list() {
    return "contact/list";
  }
  
  @GetMapping("/leave.do")
  public void leave(HttpServletRequest request, HttpServletResponse response) {
    userService.leave(request, response);
  }

  // 로그인 페이지 이동
  @GetMapping("/signin.page")
  public String signinPage(HttpServletRequest request) {
    return "user/signin";
  }
  
  // 로그인
  @PostMapping("/signin.do")
  public void signin(HttpServletRequest request, HttpServletResponse response) {
    userService.signin(request, response);
  }
  
  @GetMapping("/signout.do")
  public void signout(HttpServletRequest request, HttpServletResponse response) {
    userService.signout(request, response);
  }
  
  // 오채원 - 조직도 직원 데이터 가져오기
  @GetMapping(value="/getUserList.do", produces="application/json")
  public ResponseEntity<Map<String, Object>> getMemberList() {
    return userService.getUserList();
  }
  
  // 오채원 - 직원 프로필 조회
  @GetMapping(value="/getUserProfileByNo.do", produces="application/json")
  public ResponseEntity<Map<String, Object>> getUserProfileByNo(@RequestParam int employeeNo) {
    return ResponseEntity.ok(Map.of("employee", userService.getUserProfileByNo(employeeNo)));
  }
  
  // 직원 프로필리스트 조회
  @PostMapping(value="/getUserProfileListByNo.do", produces="application/json")
  public ResponseEntity<Map<String, Object>> getUserProfileListByNo(@RequestBody Map<String, List<Integer>> requestBody) {
    List<Integer> employeeNoList = requestBody.get("employeeNoList");
    System.out.println("employeeNoList" + employeeNoList);
    return userService.getUserProfileListByNo(employeeNoList);
  }
  
}