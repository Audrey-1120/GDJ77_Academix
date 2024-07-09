<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<c:set var="contextPath" value="<%=request.getContextPath()%>"/>
<c:set var="dt" value="<%=System.currentTimeMillis()%>"/>
<jsp:include page="${contextPath}/WEB-INF/views/layout/header.jsp">
   <jsp:param value="채팅" name="title"/>
 </jsp:include>


<!-- Font Awesome 5.15.4 (unchanged as it's already the latest stable version for this specific major version) -->
<!-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" /> -->

<!-- jsTree 3.3.12 (unchanged as it's the latest stable version) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.12/themes/default/style.min.css" />


<link rel="stylesheet" href="${contextPath}/resources/css/chat.css?dt=${dt}">

<!-- jQuery 3.6.0 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.4/dist/umd/popper.min.js"></script>


<!-- jQuery UI 1.12.1 (latest stable version) -->
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>

<!-- jsTree 3.3.12 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.12/jstree.min.js"></script>

<!-- sockjs-client 1.6.1 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.6.1/sockjs.min.js" integrity="sha512-1QvjE7BtotQjkq8PxLeF6P46gEpBRXuskzIVgjFpekzFVF4yjRgrQvTG1MTOJ3yQgvTteKAcO7DSZI92+u/yZw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<!-- stomp.js 2.3.3 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js" integrity="sha512-iKDtgDyTHjAitUDdLljGhenhPwrbBfqTKWO1mkhSFH3A7blITC9MhYon6SjnMhp4o0rADGw9yAC6EW4t5a4K3g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>  
  
<script src="${contextPath}/resources/moment/moment-with-locales.min.js"></script>
<script>
	moment.locale('ko');  
</script>
  
  <!-- Content Wrapper. Contains page content -->
  <div class="content-wrapper">
    <!-- Content Header (Page header) -->
    <section class="content-header">
      <h1>
        채팅
        <!-- <small>it all starts here</small> -->
      </h1>
    </section>

    <!-- Main content -->
    <section class="content chat-content">

			<!-- 목록 화면 - 직원, 채팅목록 -->
      <!-- Default box -->
      <div class="box member-box">
         <div class="box-header with-border">
	         <div class="box-title-choice">
	           <i class="fa fa-user" style="cursor: pointer;"></i>
	           <i class="fa fa-comment" style="cursor: pointer;"></i>
	         </div>

         
         	 <!-- 닫기 버튼이랑 메뉴 버튼 -->
	         <div class="box-tools pull-right">
	           <button type="button" class="btn btn-box-tool" data-widget="collapse" data-toggle="tooltip" title="Collapse">
	             <i class="fa fa-minus"></i>
	           </button>
	         </div>
          </div>
          <p class="chat-member-title">직원목록</p>
<!--           <div class="searchInput-cover">
            <input type="text" class="searchInput" placeholder="직원 검색">
          </div> -->
        <div class="box-body chat-member"></div> 
   			<div class="addChatroomBtn-cover">
	       <button type="button" class="btn btn-block btn-primary addChatRoomBtn">+ 새 그룹채팅방 생성</button>
	      </div>
      </div>

      
            <!-- 프로필 조회 모달창 -->
      <div class="example-modal">
        <div class="modal fade" id="modal-default" style="display: none;">
          <div class="modal-dialog">
            <div class="modal-content">
              <!-- 이 부분 프로필 조회, 채팅방 이름 변경에 따라 동적 생성 -->
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title">프로필 조회</h4>
              </div>
              <div class="modal-body chatModal-body">
              	<!-- 여기에 내용 넣으면 됨. -->
              	<div class="chat-modal-profile">
	              	<img src="/dist/img/user8-128x128.jpg" class="img-circle" alt="User Image">
	              	<p>이름</p>
	              	<span>부서</span>
	              	<div class="btn-oneToOneChat">
	              	  <i class="fa fa-commenting"></i>
	              	  <p class="selectUserNo">1:1 채팅</p>
	              	</div>
              	</div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-default pull-left" data-dismiss="modal">닫기</button>
              </div>
            </div>
            <!-- /.modal-content -->
          </div>
          <!-- /.modal-dialog -->
        </div>
        <!-- /.modal -->
      </div>
      
            <!-- 그룹 채팅 생성모달창 -->
      <div class="example-modal">
        <div class="modal fade" id="modal-default2" style="display: none;">
          <div class="modal-dialog">
            <div class="modal-content">
              <!-- 이 부분 프로필 조회, 채팅방 이름 변경에 따라 동적 생성 -->
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title">새 채팅방 생성</h4>
              </div>
              <div class="modal-body chatModal-body">
              	<!-- 여기에 내용 넣으면 됨. -->
              	<h4 class="modal-title">선택한 멤버</h4>
              	<div class="selected-member-cover"> <!-- 여기에 선택 멤버 들어감. -->
              	</div> 
              	<input class="form-control newGroupChatroom-input" type="text" maxlength='20' placeholder="채팅방 이름을 작성해주세요">
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary btn-groupChat">확인</button>
                <button type="button" class="btn btn-default pull-left" data-dismiss="modal">취소</button>
              </div>
            </div>
            <!-- /.modal-content -->
          </div>
          <!-- /.modal-dialog -->
        </div>
        <!-- /.modal -->
      </div>
      
      <!-- 채팅방 이름 수정 -->
      <div class="example-modal">
        <div class="modal fade" id="modal-default3" style="display: none;">
          <div class="modal-dialog" style="margin: 30rem auto;">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title">채팅방 이름 수정</h4>
              </div>
              <div class="modal-body chatModal-body">
              	<input class="form-control newChatroomTitle-input" type="text" maxlength='20' placeholder="채팅방 이름을 작성해주세요">
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary btn-modifyChatroomTitle">확인</button>
                <button type="button" class="btn btn-default pull-left" data-dismiss="modal">취소</button>
              </div>
            </div>
            <!-- /.modal-content -->
          </div>
          <!-- /.modal-dialog -->
        </div>
        <!-- /.modal -->
      </div>
      
      <!-- 채팅방 참여자 초대 -->
      <div class="example-modal">
        <div class="modal fade" id="modal-default4" style="display: none;">
          <div class="modal-dialog">
            <div class="modal-content">
              <!-- 이 부분 프로필 조회, 채팅방 이름 변경에 따라 동적 생성 -->
              <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title">채팅방 멤버 초대</h4>
              </div>
              <div class="modal-body chatModal-body addMember-body">
              	<!-- 여기에 내용 넣으면 됨. -->
              	<h4 class="modal-title">초대할 멤버를 선택해주세요</h4>
              	<div class="selected-addMember-cover"> <!-- 여기에 선택 멤버 들어감. -->
              	</div> 
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-primary btn-addNewMember">확인</button>
                <button type="button" class="btn btn-default pull-left" data-dismiss="modal">취소</button>
              </div>
            </div>
            <!-- /.modal-content -->
          </div>
          <!-- /.modal-dialog -->
        </div>
        <!-- /.modal -->
      </div>
      
      <!-- 채팅방 부분 -->
      <div class="chat-memberProfileList"></div>
      
      
      <div class="box chat-box" style="display: none">
        <div class="box-header with-border">
          <div class="chat-box-title">
            <!-- <i class="fa fa-times"></i> -->
						<span>채팅방 이름</span>
						<span>2</span>
          </div>
          
          <!-- 상단 메뉴 -->
          <div class="box-tools pull-right">
            <!-- 드롭박스.. -->
	          <div class="dropdown">
						  <a class="dropdown-toggle" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-expanded="true">
						    <i class="fa fa-reorder"></i>
						  </a>
						  <div class="dropdown-menu chat-box-dropdown" aria-labelledby="dropdownMenuLink">
					      <div class="title-row">
					        <p>현재 활동중</p>
					      </div>
					      <div class="participant-body-row">
								  <table class="participate_statusList">
								    <tbody>
								    </tbody>
								  </table>
					      </div>
							  <div class="menu-row-cover">
					        <p href="#" class="modify-chatTitle"><i class="fa fa-pencil-square-o"></i> 채팅방 이름 수정</p>
					        <p href="#" class="add-newMember"><i class="fa fa-user-plus"></i> 새 참여자 초대하기</p>
					        <p href="#" class="leave-chat"><i class="fa fa-sign-out"></i> 채팅방 나가기</p>
							  </div>
						  
							  
						  </div>
						</div>
          </div>
        </div>
        <!-- 메시지 창 -->
        <div class="box-body chat-body">
        	<div class="chatMessage-body">
        	
        	
        		<!-- 여기에 메시지 추가 -->
        	
        	</div>
        	<!-- 입력창 -->
         	<div class="chatMessage-input">
	        	<textarea class="form-control chat-message-input" type="text" maxlength='500' placeholder="메시지를 입력해주세요" style="height: 35px;"></textarea>
	        	<button type="submit" class="btn btn-primary chatMessage-btn"><i class="fa fa-send"></i></button>
        	</div>
        </div>      
    </section>
    <!-- /.content -->
  </div>
  <!-- /.content-wrapper -->
  
  <script src="${contextPath}/js/chat1.js?dt=${dt}"></script>
  <script src="${contextPath}/js/chat2.js?dt=${dt}"></script>
  
  <script>
    let currentEmployeeNo = ${sessionScope.user.employeeNo};
  </script>

<script>
  $.widget.bridge('uibutton', $.ui.button);
</script>
<!-- Bootstrap 3.3.6 -->
<script src="/bootstrap/js/bootstrap.min.js"></script>
<!-- Morris.js charts -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/raphael/2.1.0/raphael-min.js"></script>
<script src="/plugins/morris/morris.min.js"></script>

<!-- Sparkline -->
<script src="/plugins/sparkline/jquery.sparkline.min.js"></script>
<!-- jvectormap -->
<!-- <script src="/plugins/jvectormap/jquery-jvectormap-1.2.2.min.js"></script> -->
<!-- <script src="/plugins/jvectormap/jquery-jvectormap-world-mill-en.js"></script> -->
<!-- jQuery Knob Chart -->
<script src="/plugins/knob/jquery.knob.js"></script>
<!-- daterangepicker -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.11.2/moment.min.js"></script>
<script src="/plugins/daterangepicker/daterangepicker.js"></script>
<!-- datepicker -->
<script src="/plugins/datepicker/bootstrap-datepicker.js"></script>
<!-- Bootstrap WYSIHTML5 -->
<script src="/plugins/bootstrap-wysihtml5/bootstrap3-wysihtml5.all.min.js"></script>
<!-- Slimscroll -->
<script src="/plugins/slimScroll/jquery.slimscroll.min.js"></script>
<!-- FastClick -->
<script src="/plugins/fastclick/fastclick.js"></script>
<!-- AdminLTE App -->
<script src="/dist/js/app.min.js"></script>
<!-- AdminLTE dashboard demo (This is only for demo purposes) -->

<!-- AdminLTE for demo purposes -->
<script src="/dist/js/demo.js"></script>
<!-- <script src="/dist/js/pages/dashboard.js"></script>   -->
    
<jsp:include page="${contextPath}/WEB-INF/views/layout/footer.jsp" />