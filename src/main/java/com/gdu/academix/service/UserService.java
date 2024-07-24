package com.gdu.academix.service;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;

import com.gdu.academix.dto.EmployeesDto;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


public interface UserService {

  // 가입 및 탈퇴
  ResponseEntity<Map<String, Object>> checkEmail(Map<String, Object> params);
  void leave(HttpServletRequest request, HttpServletResponse response);

  // 로그인 및 로그아웃
  void signin(HttpServletRequest request, HttpServletResponse response);
  void signout(HttpServletRequest request, HttpServletResponse response);
  
  // 오채원 - 추가(24/05/28)
  ResponseEntity<Map<String, Object>> getUserList();
  EmployeesDto getUserProfileByNo(int employeeNo);
  ResponseEntity<Map<String, Object>> getUserProfileListByNo(List<Integer> employeeNoList);
  
}