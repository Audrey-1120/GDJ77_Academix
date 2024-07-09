<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<c:set var="contextPath" value="<%=request.getContextPath()%>"/>
<c:set var="dt" value="<%=System.currentTimeMillis()%>"/>
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Academix</title>
  <!-- Tell the browser to be responsive to screen width -->
  

  
  <!-- Bootstrap 3.3.6 -->
  <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css">
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css">
  <!-- Ionicons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css">
  <!-- Theme style -->
  <link rel="stylesheet" href="/dist/css/AdminLTE.css">
  <!-- AdminLTE Skins. Choose a skin from the css/skins
       folder instead of downloading all of them to reduce the load. -->
  <link rel="stylesheet" href="/dist/css/skins/_all-skins.min.css">
  <!-- iCheck -->
  <link rel="stylesheet" href="/plugins/iCheck/flat/blue.css">
  <!-- Morris chart -->
  <link rel="stylesheet" href="/plugins/morris/morris.css">
  <!-- jvectormap -->
  <link rel="stylesheet" href="/plugins/jvectormap/jquery-jvectormap-1.2.2.css">
  <!-- Date Picker -->
  <link rel="stylesheet" href="/plugins/datepicker/datepicker3.css">
  <!-- Daterange picker -->
  <link rel="stylesheet" href="/plugins/daterangepicker/daterangepicker.css">
  <!-- bootstrap wysihtml5 - text editor -->
  <link rel="stylesheet" href="/plugins/bootstrap-wysihtml5/bootstrap3-wysihtml5.min.css">
  
  <link rel="stylesheet" href="${contextPath}/resources/css/header.css?dt=${dt}">

  <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
  <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
  <!--[if lt IE 9]>
  <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
  <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
  <![endif]-->
  <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>

</head>
<body class="hold-transition skin-blue sidebar-mini">
<div class="wrapper">

  <header class="main-header">
    <!-- Logo -->
    <a href="${contextPath}/main.page" class="logo">
      <!-- mini logo for sidebar mini 50x50 pixels -->
      <span class="logo-mini"><b>A</b>CM</span>
      <!-- logo for regular state and mobile devices -->
      <b class="logo-lg">Academix</b>
    </a>
    <!-- Header Navbar: style can be found in header.less -->
    <nav class="navbar navbar-static-top">
      <!-- Sidebar toggle button-->
      <a href="#" class="sidebar-toggle" data-toggle="offcanvas" role="button">
        <span class="sr-only">Toggle navigation</span>
      </a>

      <div class="navbar-custom-menu">
        <ul class="nav navbar-nav">
          <!-- Messages: style can be found in dropdown.less-->
          <li class="dropdown messages-menu">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown">
              <i class="fa fa-regular fa-envelope"></i>
              <span class="label label-danger"></span>
            </a>
            <ul class="dropdown-menu">
               <li class="header alert-menu-sub">You have 4 messages</li>
              <li>
                <!-- inner menu: contains the actual data -->
                <ul class="menu alert-menu">
                </ul>
              </li>
              <li class="footer"><a href="#" class="remove-allMessageNoti">모든 메시지 알림 지우기</a></li>
            </ul>
          </li>
          <!-- User Account: style can be found in dropdown.less -->
          <li class="dropdown user user-menu">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown" id="profileDropdown">
               <c:if test="${sessionScope.user.profilePicturePath != null}">
		          ${sessionScope.user.profilePicturePath}
		        </c:if>
		        <c:if test="${sessionScope.user.profilePicturePath == null}">
		          <img src="${contextPath}/resources/images/default_profile_image.png" class="user-image">
		        </c:if>
              <span class="hidden-xs">${sessionScope.user.name}</span>
            </a>
            <ul class="dropdown-menu">
              <!-- User image -->
              <li class="user-header">
                <c:if test="${sessionScope.user.profilePicturePath != null}">
		          ${sessionScope.user.profilePicturePath}
		        </c:if>
		        <c:if test="${sessionScope.user.profilePicturePath == null}">
		          <img src="${contextPath}/resources/images/default_profile_image.png" class="user-image">
		        </c:if>

                <p>
                  ${sessionScope.user.name}
                  <small>${sessionScope.user.email}</small>
                </p>
              </li>
              <!-- Menu Body -->
<!--               <li class="user-body">
                <div class="row">
                  <div class="col-xs-4 text-center">
                    <a href="#">Followers</a>
                  </div>
                  <div class="col-xs-4 text-center">
                    <a href="#">Sales</a>
                  </div>
                  <div class="col-xs-4 text-center">
                    <a href="#">Friends</a>
                  </div>
                </div>
                /.row
              </li> -->
              <!-- Menu Footer-->
              <li class="user-footer">
<!--                 <div class="pull-left">
                  <a href="#" class="btn btn-default btn-flat">마이페이지</a>
                </div> -->
                <div class="pull-right">
                  <a href="${contextPath}/user/signout.do" class="btn btn-default btn-flat">로그아웃</a>
                </div>
              </li>
            </ul>
          </li>
          <!-- Control Sidebar Toggle Button -->
          <li>
            <a href="#" data-toggle="control-sidebar"><i class="fa fa-gears"></i></a>
          </li>
        </ul>
      </div>
    </nav>
  </header>
  
  
  <!-- 사이드 메뉴바 -->
  <aside class="main-sidebar">
    <section class="sidebar">
      <!-- 프로필 -->
      <div class="user-panel">
        <div class="pull-left image">
        <c:if test="${sessionScope.user.profilePicturePath != null}">
          ${sessionScope.user.profilePicturePath}
        </c:if>
        <c:if test="${sessionScope.user.profilePicturePath == null}">
          <img src="${contextPath}/resources/images/default_profile_image.png">
        </c:if>
        </div>
        <div class="pull-left info">
          <p>${sessionScope.user.name}님</p>
            <c:choose>
	          <c:when test="${sessionScope.user.depart.departmentNo == '0'}">
	            <p style="font-size: 10px; font-weight: 300;">대표</p>
	          </c:when>
	          <c:when test="${sessionScope.user.depart.departmentNo == '1'}">
	            <p style="font-size: 10px; font-weight: 300;">행정부</p>
	          </c:when>
	          <c:when test="${sessionScope.user.depart.departmentNo == '2'}">
	            <p style="font-size: 10px; font-weight: 300;">인사팀</p>
	          </c:when>
	          <c:when test="${sessionScope.user.depart.departmentNo == '3'}">
	            <p style="font-size: 10px; font-weight: 300;">운영팀</p>
	          </c:when>
	          <c:when test="${sessionScope.user.depart.departmentNo == '4'}">
	            <p style="font-size: 10px; font-weight: 300;">강사</p>
	          </c:when>
	          <c:otherwise>
	            <p style="font-size: 10px; font-weight: 300;">unknown department</p>
	        </c:otherwise>
	        </c:choose>
        </div>
      </div>
      
      <!-- 검색탭 -->
      <form action="#" method="get" class="sidebar-form">
        <div class="input-group">
          <input type="text" name="q" class="form-control" placeholder="Search...">
              <span class="input-group-btn">
                <button type="submit" name="search" id="search-btn" class="btn btn-flat"><i class="fa fa-search"></i>
                </button>
              </span>
        </div>
      </form>
      
      <!-- 사이드바 메뉴 -->
      <ul class="sidebar-menu">
        <li class="header">메뉴</li>
        <!-- 대시보드 -->
        <li class="active treeview">
          <a href="${contextPath}/main.page">
            <i class="fa fa-dashboard"></i> <span>메인페이지</span>
          </a>
        </li>
        
        <!-- 일정 -->
        <li>
          <a href="${contextPath}/calendar/calendar.page">
            <i class="fa fa-calendar"></i> <span>일정</span>
          </a>
        </li>
        
        <li>
          <a href="${contextPath}/user/list.page">
            <i class="fa fa-phone"></i> <span>주소록</span>
          </a>
        </li>
        
        <li>
          <a href="${contextPath}/chatting/chat.page">
            <i class="fa fa-commenting"></i> <span>채팅</span>
          </a>
        </li> 
        
        <li class="treeview">
          <a href="#">
            <i class="fa fa-book"></i>
            <span>게시판</span>
            <span class="pull-right-container">
              <i class="fa fa-angle-left pull-right"></i>
            </span>
          </a>
          <ul class="treeview-menu">
            <li><a href="${contextPath}/blog/list.page">공지사항 게시판</a></li>
            <li><a href="${contextPath}/anon/list.page">익명 게시판</a></li>
          </ul>
        </li>   
        
        
        <li class="treeview">
          <a href="#">
            <i class="fa fa-user"></i>
            <span>근태현황</span>
            <span class="pull-right-container">
              <i class="fa fa-angle-left pull-right"></i>
            </span>
          </a>
          <ul class="treeview-menu">
            <li><a href="${contextPath}/attendance/commute.page">출퇴근/근무관리</a></li>
            <li><a href="${contextPath}/attendance/annualLeave.page">내 연차내역</a></li>
          </ul>
        </li>                          
        
        <li class="drive">
          <a href="${contextPath}/drive/main.do">
            <i class="fa fa-folder-open"></i> <span>드라이브</span>
          </a>
          <input type="hidden" name="employeeNo" value="${sessionScope.user.employeeNo}">
        </li>
           
        <li class="treeview">
          <a href="#">
            <i class="fa fa-pencil-square-o"></i> 
            <span>전자결재</span>
            <span class="pull-right-container">
              <i class="fa fa-angle-left pull-right"></i>
              </span>
          </a>
          <ul class="treeview-menu">
          <li><a href="${contextPath}/requests/main.page?employeeNo=${sessionScope.user.employeeNo}"> 내 문서함</a></li>
         <li> <a href="${contextPath}/requests/write.page">기안하기</a></li>
           <c:if test="${sessionScope.user.depart.departmentNo == 2}"> 
          <li><a href="${contextPath}/requests/requestsList.do">결재함</a></li>
          </c:if>
          </ul>
       
        </li>
         
        
        <c:if test="${sessionScope.user.depart.departmentNo == 4 || sessionScope.user.depart.departmentNo == 0}">
        <li class="treeview">
          <a href="#">
            <i class="fa fa-book"></i>
            <span>강의 관리</span>
            <span class="pull-right-container">
              <i class="fa fa-angle-left pull-right"></i>
            </span>
          </a>
          <ul class="treeview-menu">
            <li><a href="${contextPath}/courses/createCourseRequest.page">강의 개설 신청</a></li>
            <li><a href="${contextPath}/courses/manageCourses.page">강의 관리</a></li>
          </ul>
        </li> 
        </c:if>
        
        <c:if test="${sessionScope.user.depart.departmentNo == 2 || sessionScope.user.depart.departmentNo == 0}">
        <li class="treeview">
          <a href="#">
            <i class="fa fa-book"></i>
            <span>인사 관리</span>
            <span class="pull-right-container">
              <i class="fa fa-angle-left pull-right"></i>
            </span>
           </a>
          <ul class="treeview-menu">
          <li><a href="${contextPath}/hr/list.page">직원 및 강사 조회</a></li>
            <li><a href="${contexPath}/hr/employeeRegister.page">직원 및 강사 등록</a></li>
          </ul>
        </li>   
        </c:if> 

		<c:if test="${sessionScope.user.depart.departmentNo == 3 || sessionScope.user.depart.departmentNo == 0}">
        <li class="treeview">
          <a href="#">
            <i class="fa fa-book"></i>
            <span>학생 관리</span>
            <span class="pull-right-container">
              <i class="fa fa-angle-left pull-right"></i>
            </span>
          </a>
          <ul class="treeview-menu">
            <li><a href="${contextPath}/studentMng/consultingList.page">학생 상담 관리</a></li>
            <li><a href="pages/charts/chartjs.html">학생 관리</a></li>
            <li><a href="pages/charts/chartjs.html">학생 주소록</a></li>
          </ul>
        </li>    
        
        <li class="treeview">
          <a href="#">
            <i class="fa fa-book"></i>
            <span>행정 관리</span>
            <span class="pull-right-container">
              <i class="fa fa-angle-left pull-right"></i>
            </span>
          </a>
          <ul class="treeview-menu">
            <li><a href="pages/charts/chartjs.html">강의 개설 관리</a></li>
            <li><a href="${contextPath}/report/list.page">신고 관리</a></li>
            <li><a href="pages/charts/chartjs.html">학생 수강 신청</a></li>
          </ul>
        </li>                         
        </c:if>

    </section>
    <!-- /.sidebar -->
  </aside>  
  
 <script>
    // Check if the profile picture exists
    var profileImg = document.querySelector('#profileDropdown img');
    if (profileImg) {
        // If the profile picture exists, add the class and style
        profileImg.classList.add('user-image');
    } else {
        // If using default profile image, ensure it has the correct class
        var defaultImg = document.getElementById('defaultProfileImage');
        if (defaultImg) {
            defaultImg.classList.add('user-image');
        }
    }
    
    const fnGetContextPath = ()=> {
   	  const host = location.host;  /* localhost:8081 */
   	  const url = location.href;   /* http://localhost:8081/mvc/getDate.do */
   	  const begin = url.indexOf(host) + host.length;
   	  const end = url.indexOf('/', begin + 1);
   	  return url.substring(begin, end);
   	}
</script>