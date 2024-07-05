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
  
  <script src="${contextPath}/js/chatMember.js?dt=${dt}"></script>
  
  <script>
  
    // stomp 연결 전역 객체
	let stompClient = null;  
	let currentChatroomNo = null;
	let currentChatroomType = null;
  
    // 무한 스크롤 페이지
    let page = 1;
	let chatMessageTotalPage = 0;
	let gChatroomNo = 0;
	
	// 입력 데이터 날짜 생성
	let gPreviousDate = null;
	
	// 날짜 한글로
	moment.locale('ko');
	
	console.log(moment().format('A h:mm'));
	
	// jvectorMap 이벤트 제거
	$(document).ready(function() {
	    // jQuery의 vectorMap 함수가 존재하는지 확인
	    if (typeof $.fn.vectorMap !== 'undefined') {
	        $('#world-map').vectorMap({
	            map: 'world_mill_en',
	            backgroundColor: "transparent",
	            regionStyle: {
	                initial: {
	                    fill: '#e4e4e4',
	                    "fill-opacity": 1,
	                    stroke: 'none',
	                    "stroke-width": 0,
	                    "stroke-opacity": 1
	                }
	            }
	        });
	    } else {
	        console.log('vectorMap function not defined');
	    }
	    
	});
	
  // 직원 목록 & 채팅 목록 조회
  const fnShowChatList = () => {
	  
  	// 첫번째 사람 아이콘 클릭 시
  	$('.box-title-choice i').eq(0).on('click', () => {
 		  $('.addChatroomBtn-cover').css('display', ''); 
		  $('.chat-member').empty();
		  $('.box-title-choice i').eq(1).css('color', '#B5B5B5');
		  $('.box-title-choice i').eq(0).css('color', 'black');
		  $('.chat-member-title').text('직원 목록');
		  $('.chat-member .chat-member-title').remove();
      $('.searchInput-cover').remove();
      $('.chat-member #memberArea').remove();
		  fnGetChatUserList();
	  })
	  
	  // 두번째 채팅 아이콘 클릭 시
	  $('.box-title-choice i').eq(1).on('click', () => {
		  $('.addChatroomBtn-cover').css('display', 'none');  
		  $('.chat-member').empty();
		  $('.box-title-choice i').eq(0).css('color', '#B5B5B5');
		  $('.box-title-choice i').eq(1).css('color', 'black');
      // input 태그 삭제
      $('.searchInput-cover').remove();
      // #memberArea div 요소 삭제
      //$('.chat-member #memberArea').remove();
      $('.chat-member-title').text('채팅 목록');
      
      // 먼저 chat-member 요소 추가
      //$('.chat-member-title').after('<div class="box-body chat-member"></div>');
      
      $('.chat-member').append('<ul class="contacts-list"></ul>');
      
      
      // 채팅 목록 가져오기
      fnGetChatList(${sessionScope.user.employeeNo});
      // 채팅 클릭 시..
      
      
	  })
	  
  }

  // 직원 리스트 가져오기
  const fnGetChatUserList = () => {
	  
 	  // 새로운 태그 추가
    //$('.chat-member').append('<p class="chat-member-title">직원 목록</p>');
 	  $('.chat-member-title').after('<div class="searchInput-cover"></div>');
    $('.searchInput-cover').append('<input type="text" class="searchInput" placeholder="직원 검색">')
    $('.chat-member').append('<div id="memberArea"></div>');
	  
	  fetch('${contextPath}/user/getUserList.do',{
	      method: 'GET',
	    })
		.then((response) => response.json())
	  .then(resData => {
		  
		  // 변환한 데이터 담을 배열 선언
		  var jstreeData = [];
		  
		  
		  // 회사 root node로 설정
		  var com = resData.departments.find(depart => depart.departName === 'Academix');
		  if(com) {
			  jstreeData.push({
				  id: com.departmentNo,
				  parent: '#',
				  text: com.departName,
				  icon: "fa fa-building"
			  });
		  }
		  
		  // employee 데이터에서 대표데이터만 빼서 설정
		  var ceo = resData.employee.find(employee => employee.rank.rankTitle === '대표이사');
		  if(ceo) {
			  jstreeData.push({
				  id: 'emp_' + ceo.employeeNo,
				  parent: '0',
				  text: ceo.name + ' ' + ceo.rank.rankTitle,
				  icon: "fa fa-star"
			  });
		  }
		  
		  // 부서 데이터
		  resData.departments.forEach(function(department) {
			  if(department.departName !== 'Academix'){
				  jstreeData.push({
					  id: department.departmentNo.toString(),
					  parent: department.parentDepartNo.toString(),
					  text: department.departName,
					  icon: "fa fa-dot-circle-o"
				  });
			  }
		  });
		  
		  // 직원 데이터
		  resData.employee.forEach(function(employee) {
			  if(employee.depart.departmentNo !== 0 && employee.employeeStatus !== 0){ // 대표이사 제외
				  if(employee.rank.rankNo === 5) {
	     		  jstreeData.push({
	     			  id: 'emp_' + employee.employeeNo,
	     			  parent: employee.depart.departmentNo.toString(),
	     			  text: employee.name + ' ' + employee.rank.rankTitle,
	     			  icon: "fa fa-mortar-board"
	     		  });
				  } else {
       		  jstreeData.push({
       			  id: 'emp_' + employee.employeeNo,
       			  parent: employee.depart.departmentNo.toString(),
       			  text: employee.name + ' ' + employee.rank.rankTitle,
       			  icon: "fa fa-user"
       		  });
				  }
			  }
		  });
		  
		  //console.log('jstreeData', jstreeData);
		  
		  // jstree 데이터 추가 - jstree가 로드되면 모든 노드 열리게 설정
		  $('#memberArea').jstree({
			  'core': {
				  'data': jstreeData,
		        'themes': {
		           'icons': true
		        }
			  },
			  'plugins': ['search', 'checkbox'],
		   		  'checkbox': {
				       'keep_selected_style': true,
				       'three_state': false,
				       'whole_node' : false,
				       'tie_selection' : false,
				       'cascade': 'down'
				    }      		  
		  }).on('ready.jstree', function() {
			  $(this).jstree(true).open_all();
		  })
		  
		  
	    // 검색 기능 추가
	    $('.searchInput').on('keyup', function() {
	  	  var searchString = $(this).val();
	  	  $('#memberArea').jstree('search', searchString);
	    });
		  
	  })
	  .catch(error => {
	    console.error('There has been a problem with your fetch operation:', error);
	  });  
	  
	  fnGetProfile();
	  
  }
  
  // 프로필 조회하기
  const fnGetProfile = () => {
	  
	  $('#memberArea').bind('select_node.jstree', function(event, data) {
		  var selectedNode = data.node;
		  var employeeNo;
		  
		  // id가 0인 경우 -> Academix
		  // id가 emp를 포함하는 경우 -> 그대로..
		  // 그외 -> return
		  if(selectedNode.id.includes('emp_')) {
			  employeeNo = selectedNode.id.replace('emp_', '');
		  } else {
			  return;
		  }

		  fetch('${contextPath}/user/getUserProfileByNo.do?employeeNo=' + employeeNo,{
		      method: 'GET',
		    })
			.then((response) => response.json())
		  .then(resData => {
			  
			  /*
			  
			  {
			    "employee": {
			        "employeeNo": 8,
			        "employeeStatus": 1,
			        "name": "권태현",
			        "email": "taehyun.kwon@example.com",
			        "phone": "010-8901-2345",
			        "address": "서울특별시",
			        "password": "03AC674216F3E15C761EE1A5E255F067953623C8B388B4459E13F978D7C846F4",
			        "profilePicturPath": null,
			        "hireDate": "2024-06-01",
			        "exitDate": "2024-06-01",
			        "depart": {
			            "departmentNo": 3,
			            "parentDepartNo": 1,
			            "departName": "운영팀"
			        },
			        "rank": {
			            "rankNo": 2,
			            "rankTitle": "책임"
			        }
			    }
				}
			  */
			  
			  if(resData.employee.profilePicturePath !== null) {
				  
				    let profilePicturePath = '';
				    
				    // profilePicturePath가 유효한지 확인하고 src 부분 추출하기
				    if (resData.employee.profilePicturePath) {
				        const match = resData.employee.profilePicturePath.match(/src="([^"]+)"/);
				        if (match && match[1]) {
				            profilePicturePath = match[1];
				        }
				    }
				  
				  $('.chat-modal-profile > img').attr('src', profilePicturePath);
				  $('.chat-modal-profile > img').css({
					    'width': '128px',
					    'height': '128px',
					    'object-fit': 'cover'
					});
			  } else {
				  $('.chat-modal-profile > img').attr('src', '${contextPath}/resources/images/default_profile_image.png');
				  $('.chat-modal-profile > img').css({
					    'width': '128px',
					    'height': '128px'
					});
				  
			  }
    	  
    	  $('.chat-modal-profile > p').text(resData.employee.name);
    	  $('.chat-modal-profile > span').text(resData.employee.depart.departName);
    	  $('.selectUserNo').attr('data-user-no', resData.employee.employeeNo);
    	  $('.selectUserNo').data('user-no', resData.employee.employeeNo);
    	  /* $('.selectUserNo').data('userNo', resData.employee.employeeNo); */
    	  $('#modal-default').modal('show');
		  })
		  .catch(error => {
		    console.error('There has been a problem with your fetch operation:', error);
		  });
	  })
  }
  
  // 채팅방 조회 및 생성(1:1)
	const fnAddChatRoom = () => {
		
		// 모달창의 1:1 채팅 아이콘 클릭시..
	  $('.btn-oneToOneChat > i').on('click', () => {
		  $('.chat-memberProfileList').empty();
		  // fetch로 현재 세션번호와 해당 노드의 직원 번호를 보내서 chatroom_t에 데이터 있는지 확인
		  // 조건 1. CHATROOM_TYPE='OneToOne' (1:1 이므로)
		  // 조건 2. CREATOR_NO가 로그인 유저 혹은 선택한 직원 번호임.

		  page = 1;
		  chatMessageTotalPage = 0;
		  
		  // 유저가 선택한 직원의 번호
		  let chatUserNo = $('.selectUserNo').data('user-no');
		  
		  if(${sessionScope.user.employeeNo} === chatUserNo) {
			  return;
		  }
		  
		  fetch('${contextPath}/chatting/isOneToOneChatroomExits.do?loginUserNo=' + ${sessionScope.user.employeeNo} + '&chatUserNo=' + chatUserNo,{
		      method: 'GET',
		    })
			.then((response) => response.json())
		  .then(resData => { 
				  /*
				  resData
				  {
				    "chatroom": {
				        "chatroomNo": 1,
				        "creatorNo": 0,
				        "chatroomTitle": "채팅방1",
				        "chatroomCreatedDate": "2024-05-31T03:20:53.022+00:00"
				    }
					}
				  */
    	  
    	    // 만약 resData.chatroom.chatroomNo값이 0이라면 채팅방이 없다는 뜻이므로 새로 만든다.
    	    // 1. fetch로 서버에게 로그인 유저번호와 chatUserNo 보낸다.
    	    
    	    if(resData.chatroom.chatroomNo === 0) { // 채팅방 없음.
		    	  fetch('${contextPath}/chatting/insertNewOneToOneChatroom.do', {
		    		  method: 'POST',
		    		  headers: {
	    			    "Content-Type": "application/json",
	    			  },
		    		  body: JSON.stringify({
		    			  loginUserNo: ${sessionScope.user.employeeNo},
		    			  chatUserNo: chatUserNo
		    		  })
		    	  })
		    	  .then((response) => response.json())
		    	  .then(resData => {
		    		  /*
		    		  {
						    "chatroom": {
						        "chatroomNo": 6,
						        "creatorNo": 0,
						        "chatroomTitle": "김의정, 윤동현",
						        "chatroomType": "OneToOne",
						        "chatroomCreatedDate": "2024-06-01T04:16:00.060+00:00"
						    },
						    "insertOneToOneCount": 1
							}
		    		  */
		    		  // 필요한 데이터 : 성공응답, 새로 만든 chatroom
		    		  
		    		  let chatroomNo = resData.chatroom.chatroomNo;
		    		  gChatroomNo = resData.chatroom.chatroomNo;
		    		  
		    		  if(resData.insertOneToOneCount === 1) { // 방 새로 만들기 성공
		    			  
		    			  const employeeList = [${sessionScope.user.employeeNo}, chatUserNo];
		    			  //$('.chat-memberProfileList').empty();
		    			  fetchSenderUserData(employeeList);
		    		  
		    			  // 채팅방 열기
		    			  fnOpenChatroom(resData.chatroom);
		    			  
		    			  // 상태값 받아오기
		    			  //fnAddParticipateTab(chatroomNo);
		    			  
		    		 	  const chatBox = $('.chat-body'); 
		    		 	  chatBox.scrollTop(chatBox.prop('scrollHeight'));
			    			  
		    			  
		    		  } else {
		    			  alert('새로고침 해주세요..1:1 방 만들기 실패');
		    		  }
		    	  })
    	    	
    	    } else { // 채팅방 존재함.
    	    	
    	    	let chatroomNo = resData.chatroom.chatroomNo;
    	    	gChatroomNo = resData.chatroom.chatroomNo;
    	    	
    	    	const employeeList = [${sessionScope.user.employeeNo}, chatUserNo];
    	    	fetchSenderUserData(employeeList);
    	    
						// 채팅방 열기
    	    	fnOpenChatroom(resData.chatroom);
						
						// 상태값 받아오기
    	    	//fnAddParticipateTab(chatroomNo);

    	    	
    	    }
		  })
		  .catch(error => {
		    console.error('There has been a problem with your fetch operation:', error);
		  });
	  })
  } 
	

	
		// STOMP 연결
	const fnConnect = (chatroomType) => {
		let employeeNo = ${sessionScope.user.employeeNo};
	    let socket = new SockJS("/ws-stomp?employeeNo=" + employeeNo);
	    stompClient = Stomp.over(socket);
	
	    // 구독 정보를 저장할 객체 초기화
	    if (!stompClient.subscriptionPaths) {
	        stompClient.subscriptionPaths = {};
	    }
	    
	    stompClient.connect({}, (frame) => {
	        //console.log('소켓 연결 성공: ' + frame);
	
	        let chatroomNo = $('.chat-box-title').data('chatroom-no');  // (1)
	        
	        // 기존 채팅방 구독 해지
	/*         if (currentChatroomNo !== null) {
	            const previousChatroomType = chatroomType === 'OneToOne' ? 'OneToOne' : 'Group';
	            fnDisconnect(previousChatroomType, currentChatroomNo);
	        } */
	
	        // 새로운 채팅방 번호 저장
	        currentChatroomNo = chatroomNo;
	        currentChatroomType = chatroomType;
	        
	        // 저장된 채팅 불러오기
	        fnGetChatMessage(chatroomNo);  // (2)
	        
	        const subscriptionPath = chatroomType === 'OneToOne' ? '/topic/' + chatroomNo : '/queue/' + chatroomNo;
	
	        //console.log('구독되었습니다.');
	        const subscription = stompClient.subscribe(subscriptionPath, (chatroomMessage) => {
	            const message = JSON.parse(chatroomMessage.body);
	
	            if (message.messageType === 'UPDATE') {
                  fnUpdateParticipateStatus(message); // status 관련 UPDATE 메시지 받으면 바로 탭 바꿔주는 함수.
	            } else {
                  // 받은 메시지 보여주기
            	  fnShowChatMessage(message);
	            }
	
	        });
	
	        // 구독 정보를 저장
	        if (!stompClient.subscriptionPaths) {
	            stompClient.subscriptionPaths = {};
	        }
	        stompClient.subscriptionPaths[subscriptionPath] = subscription;
	
	        // 일정 시간 대기 후 상태 업데이트 메시지 전송
	        setTimeout(() => {
	            const sendPath = chatroomType === 'OneToOne' ? '/send/one/' + chatroomNo : '/send/group/' + chatroomNo;
	
	            stompClient.send(sendPath, {},
	                JSON.stringify({
	                    'chatroomNo': chatroomNo,
	                    'messageType': 'UPDATE',
	                    'messageContent': '1',
	                    //'isRead': 0,
	                    'senderNo': ${sessionScope.user.employeeNo}
	                })
	            );
	
	            //console.log('첫 번째 상태 업데이트 메시지 전송됨');
	        }, 500); // 500ms 대기
	    }, (error) => {
	        console.error('STOMP 연결 오류:', error);
	    });
	};
	 	
	const fnDisconnect = (chatroomType, chatroomNo) => {
	    if (stompClient !== null) {
	        const subscriptionPath = chatroomType === 'OneToOne' ? '/topic/' + chatroomNo : '/queue/' + chatroomNo;
	        
	        // 기존 구독 해지
	        if (stompClient.subscriptionPaths && stompClient.subscriptionPaths[subscriptionPath]) {
	            stompClient.subscriptionPaths[subscriptionPath].unsubscribe();
	            delete stompClient.subscriptionPaths[subscriptionPath];
	            //console.log('구독 해지되었습니다.');
	        }
	
	        // 상태 업데이트 메시지 전송
	        const sendPath = chatroomType === 'OneToOne' ? '/send/one/' + chatroomNo : '/send/group/' + chatroomNo;
	
	        stompClient.send(sendPath, {},
	            JSON.stringify({
	                'chatroomNo': chatroomNo,
	                'messageType': 'UPDATE',
	                'messageContent': '0', // 오프라인 상태
	                //'isRead': 0,
	                'senderNo': ${sessionScope.user.employeeNo}
	            })
	        );
	
	        // WebSocket 연결 해제
	        stompClient.disconnect(() => {
	            console.log('WebSocket 연결이 해제되었습니다.');
	        });
	    }
	};

	// 페이지 떠날때 접속 해제
	window.addEventListener('beforeunload', function(event) {
		
		console.log('접속 해제!');
		fnDisconnect(currentChatroomType, currentChatroomNo);
		
	})


	
	// 메시지 전송
 	const fnSendChat = () => {
		if($('.chat-message-input').val() != '' && $('.chat-message-input').val().trim() !== '') {
			
			// 내 employeeNo와 같은 직원 요소의 이름 가져옴. -> 알림 보낼때 사용
	    let employeeNo = ${sessionScope.user.employeeNo};
	    let employeeName = $('.chat-memberProfileList input[data-employee-no="' + employeeNo + '"]').data('employee-name');
			
			let chatroomNo = $('.chat-box-title').data('chatroom-no');
			let chatroomType = $('.chat-box-title').data('chatroom-type');
			
			// 수신자를 보내기 위해서 번호를 가져와서 리스트로 만듬 - 이때 알림용이므로 접속안한 애들만!
			let offlineEmployeeNoList = [];
			
	    // 1. 테이블에서 오프라인 상태의 employee-no 값을 가져옴
	    $('.participate_statusList td.status.offline').each(function() {
	        let employeeNo = $(this).closest('tr').find('td[data-employee-no]').data('employee-no');
	        offlineEmployeeNoList.push(employeeNo);
	    });
	    
		 	// 2. chat-memberProfileList에서 오프라인인 employee들만 employeeNoList에 추가
	    let employeeNoList = [];
		 	
	    // 3. chat-memberProfileList에서 오프라인인 employee들만 employeeNoList에 추가
	    $('.chat-memberProfileList input').each(function() {
	        let employeeNo = $(this).data('employee-no');
	        if (offlineEmployeeNoList.includes(employeeNo)) {
	            employeeNoList.push(employeeNo);
	        }
	    });
	    
	    // 알림용 - 메시지 콘텐츠에 이름이랑 내용 같이 넣어서 보냄.
			if(chatroomType === 'OneToOne') { // 1:1의 경우
				
				// 채팅방에 전달
				stompClient.send("/send/one/" + chatroomNo, {},
						JSON.stringify({
							'chatroomNo': chatroomNo,
							'messageType': 'CHAT',
							'messageContent': $('.chat-message-input').val(),
							//'isRead': 0,
							'senderNo': ${sessionScope.user.employeeNo},
							'recipientNoList': employeeNoList
						}));
	    

			  // 알림을 위한 전달
         stompClient.send("/send/notify", {}, JSON.stringify({
					'chatroomNo': chatroomNo,
					'messageContent': $('.chat-message-input').val(),
					//'isRead': 0,
					'senderNo': employeeNo,
					'recipientNoList': employeeNoList
        })); 
			
			
				//console.log('보낸 메시지: ' + $('.chat-message-input').val())
				$('.chat-message-input').val('');
			
			} else {
				
				stompClient.send("/send/group/" + chatroomNo, {},
						JSON.stringify({
							'chatroomNo': chatroomNo,
							'messageType': 'CHAT',
							'messageContent': $('.chat-message-input').val(),
							//'isRead': 0,
							'senderNo': ${sessionScope.user.employeeNo},
							'recipientNoList': employeeNoList
						}));
				
			  // 알림을 위한 전달
         stompClient.send("/send/notify", {}, JSON.stringify({
						'chatroomNo': chatroomNo,
						'messageContent': $('.chat-message-input').val(),
						//'isRead': 0,
						'senderNo': employeeNo,
						'recipientNoList': employeeNoList
	        })); 
 
				$('.chat-message-input').val('');
				
			}
		}
	}
 	
 	// 전송 버튼 누르면 메시지 전송됨.
 	//const fnMessageSend = () => {
 		$('.chatMessage-btn').on('click', () => {
 			fnSendChat();
 		})
 	//}
 	
 	// 엔터 누르면 전송 버튼 눌려지게 하기
 	const fnPressEnterSendBtn = () => {
 		let input = $('.chat-message-input');
 		input.on('keyup', (evt) => {
 			if(evt.keyCode === 13) {
  				if(evt.shiftKey) {
 			      let cursorPosition = input.prop('selectionStart');
 				  let value = input.val();
 				  input.val(value.substring(0, cursorPosition) + '\n' + value.substring(cursorPosition));
		          input.prop('selectionStart', cursorPosition + 1);
		          input.prop('selectionEnd', cursorPosition + 1);
 				} else {
 				  evt.preventDefault();
 				  $('.chatMessage-btn').click();
 				} 
 			}
 		})
 	}
 	
 	// 날짜 비교 함수
 	const isSameDay = (date1, date2) => {
	  const d1 = new Date(date1);
	  const d2 = new Date(date2);
	  return d1.getFullYear() === d2.getFullYear() &&
	         d1.getMonth() === d2.getMonth() &&
	         d1.getDate() === d2.getDate();
	};
	
	// 프론트에 있는 유저 데이터 가져오기
	const getEmployeeData = (employeeNo) => {  // (12) - 함수 생성
		
		const input = $('input[data-employee-no=' + employeeNo + ']');
	  if (input.length > 0) {
	    const employeeName = input.attr('data-employee-name');
	    const profilePicturePath = input.attr('data-employee-profilePicturePath');
	    return {
	      employeeNo: employeeNo,
	      name: employeeName,
	      profilePicturePath: profilePicturePath
	    };
	  } else {
	    return null; // 해당 employeeNo의 데이터가 없을 경우
	  }
	};
	
	// 전송자 번호 및 내가 보낸 번호로 유저 데이터 가져오기
	const fetchSenderUserData = (senderNoList) => {  // (11) - 함수 생성
		return fetch('${contextPath}/user/getUserProfileListByNo.do', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({employeeNoList: senderNoList}) // 유저 번호 JSON으로 전송 // (15) - fetch 실행
		})
		.then((response) => response.json())
		.then(resData => {
			
			const employeeList = resData.employeeList;
			
			$('.chat-memberProfileList').empty();
			// 데이터를 돌면서 회원 데이터 담은 input 추가
			employeeList.forEach(resData => {
			    let profilePicturePath = '';
			    
			    // profilePicturePath가 유효한지 확인하고 src 부분 추출하기
			    if (resData.profilePicturePath) {
			        const match = resData.profilePicturePath.match(/src="([^"]+)"/);
			        if (match && match[1]) {
			            profilePicturePath = match[1];
			        }
			    }
			    const hiddenInputHTML = '<input type="hidden" data-employee-no="' + resData.employeeNo + '" data-employee-name="' + resData.name + ' ' + resData.rank.rankTitle + '" data-employee-profilePicturePath="' + profilePicturePath + '">';
				
				const chatMemberProfileList = $('.chat-memberProfileList');
				
		    if (chatMemberProfileList.length) {
		        chatMemberProfileList.append(hiddenInputHTML);
		    } else {
		        console.error('.chat-memberProfileList element not found');
		    } 						
			})
		});
	};	
		

	// 메시지 프로필 설정
	const SetEmployeeMessageProfile = (chatMessageList, MessageReadStatusList) => { // (13) - 함수 생성
		const messagePromises = chatMessageList.map(message => {
			return new Promise((resolve) => { // (23)
				
				moment.locale('ko');
				
				let messageHTML = ''; // (17)   (24)
				
				if(message.messageType === 'JOIN') { // 맨 처음 환영메시지
					
					messageHTML += '<div class="joinChatMessage">' + message.messageContent + '</div>';
					
					
				} else if(message.messageType === 'CHAT'){ // 그냥 채팅 메시지

					// chatMessageList를 반복문으로 돌면서 하나씩 번호를 비교한다.
					if(message.senderNo === ${sessionScope.user.employeeNo}) { // (18)
						// 내가 보낸 메시지인 경우,
					
						// 해당 회원의 데이터를 가져옴.
						const senderData = getEmployeeData(message.senderNo);
						
						// 만약 가져온 데이터가 있다면..
						if(senderData) { // (20)
						
							messageHTML += '<div class="chatMessage-me">';
							messageHTML += '  <div class="chatMessage-main">';
							messageHTML += '    <div class="chatMessage-contents">';
							messageHTML += '      <div class="chatMessage-content">' + message.messageContent + '</div>';
							messageHTML += '    </div>';
						  messageHTML += '    <div class="chatMessage-info">';
						  messageHTML += '      <span class="chatMessage-time">' + moment(message.sendDt).format('A hh:mm') + '</span>';
						  messageHTML += '    </div>';
						  messageHTML += '  </div>';
						  messageHTML += '</div>';
						}
						
					} else {
						// 아닌 경우에는 프로필번호를 가지고 와서 그거에 맞는 값 가져옴.
						
						// 해당 회원의 데이터를 가져옴.
						const senderData = getEmployeeData(message.senderNo); // (19)
						
						// 만약 가져온 데이터가 있다면..
						if(senderData) {
							
							messageHTML += '<div class="chatMessage-you">';
							messageHTML += '  <div class="chatMessage-profile">';
							if(senderData.profilePicturePath !== null && senderData.profilePicturePath !== undefined && senderData.profilePicturePath !== "") {
								messageHTML += '    <img class="direct-chat-img" src="' + senderData.profilePicturePath + '" alt="Message User Image">';
							} else {
								messageHTML += '    <img class="direct-chat-img" src="${contextPath}/resources/images/default_profile_image.png" alt="Message User Image">';
							}
							messageHTML += '  </div>';
							messageHTML += '  <div class="chatMessage-main">';
							messageHTML += '    <div class="chatMessage-contents">';
							messageHTML += '      <div class="chatMessage-senderName">' + senderData.name + '</div>';
							messageHTML += '<div class="chatMessage-youMessage">';
							messageHTML += '      <div class="chatMessage-content">' + message.messageContent + '</div>';
							messageHTML += '</div>';
							messageHTML += '    </div>';
							messageHTML += '    <div class="chatMessage-info">';
							messageHTML += '      <span class="chatMessage-time">' + moment(message.sendDt).format('A hh:mm') + '</span>';
							messageHTML += '    </div>';
							messageHTML += '  </div>';
							messageHTML += '</div>';
							
						} else {// 나간 회원..
							
							messageHTML += '<div class="chatMessage-you">';
							messageHTML += '  <div class="chatMessage-profile">';
							messageHTML += '    <img class="direct-chat-img" src="${contextPath}/resources/images/default_profile_image.png" alt="Message User Image">';
							messageHTML += '  </div>';
							messageHTML += '  <div class="chatMessage-main">';
							messageHTML += '    <div class="chatMessage-contents">';
							messageHTML += '      <div class="chatMessage-senderName">(알수없음)</div>';
							messageHTML += '<div class="chatMessage-youMessage">';
							messageHTML += '      <div class="chatMessage-content">' + message.messageContent + '</div>';
							messageHTML += '</div>';
							messageHTML += '    </div>';
							messageHTML += '    <div class="chatMessage-info">';
							messageHTML += '      <span class="chatMessage-time">' + moment(message.sendDt).format('A hh:mm') + '</span>';
							messageHTML += '    </div>';
							messageHTML += '  </div>';
							messageHTML += '</div>';
						}
						
					}
				} else if(message.messageType === 'LEAVE'){
					// 퇴장 메시지
					messageHTML += '<div class="leaveChatMessage">' + message.messageContent + '</div>';
				} else {
					// 초대 메시지
					messageHTML += '<div class="AddChatMessage">' + message.messageContent + '</div>';
				}
				resolve({ // (21)
					sendDt: message.sendDt,
					html: messageHTML
				});
			}); // (22)
		});
		
		Promise.all(messagePromises)
			.then(messages => {
			let messageList = '';
			let previousDate = null;
			
			messages.forEach((messageObj) => {
				
				const messageDate = new Date(messageObj.sendDt);
				
        if (previousDate && !isSameDay(previousDate, messageDate)) {
           const dateString = moment(messageDate).format('YYYY년 MM월 DD일');
           messageList += '<div class="date-divider">' + dateString + '</div>';
         }
        
        messageList += messageObj.html;
        previousDate = messageDate;
			});
			
      $('.chatMessage-body').prepend(messageList);
      
	    // 처음 메시지 데이터 불러올때만 스크롤 맨 아래로, 그 다음부터는 위치 유지
	    if(page === 1) {
	      const chatBox = $('.chat-body'); 
	      chatBox.scrollTop(chatBox.prop('scrollHeight'));
	    } 
	})
   .catch(error => {
     console.error('Error processing messages:', error);
   });
	};		
		
		
		
	
 	// 채팅 내역 가져오기
 	const fnGetChatMessage = (chatroomNo) => { 
 		
 		if(chatroomNo === undefined) {
 			return;
 		}
 		
 		fetch('${contextPath}/chatting/getChatMessageList.do?chatroomNo=' + chatroomNo + '&page=' + page, {  // (3)
 			method: 'GET',
 		})
 		.then((response) => response.json())  // (5) - 아까 위의 fetch로 받아온 데이터 json 파싱 
 		.then(resData => {
 			
 			console.log(resData);
 			
 			// 무한 스크롤용 totalPage
 			chatMessageTotalPage = resData.chatMessageTotalPage;  // (7)
 			
 			// 메시지 객체 담은 리스트
 			const chatMessageList = resData.chatMessageList.reverse(); // (8)
 			
 			// 전역 gPreviousDate에 제일 최신 날짜 값 넣기
      if (chatMessageList.length > 0) {
          const latestMessage = chatMessageList[chatMessageList.length - 1];
          gPreviousDate = new Date(latestMessage.sendDt);
      } else {
          const today = new Date();
          gPreviousDate = today.toLocaleString();
      }      
 			
 			// 메시지에 해당하는 senderNo 리스트로 받기(모든 회원)
 			
 			let messageList = '';  // (10)
 			
 			// 여기서 해당 채팅방의 회원데이터를 input으로 넣어야 함.
 			// 1. fetchSenderUserData(회원 리스트 실행);
 			
 			if(chatMessageList.length > 0) {
				fnGetParticipantsNoList(chatMessageList[0].chatroomNo)
				.then(senderNoList => {
					
					if($('.chat-memberProfileList').find('input').length !== senderNoList.length) {
			          fetchSenderUserData(senderNoList).then(() => { // fetchSenderUserData가 완료되면 실행
	                  SetEmployeeMessageProfile(chatMessageList, resData.MessageReadStatusList); // (16)
	                  fnAddParticipateTab(chatroomNo);
			          });
					} else {
		      	       SetEmployeeMessageProfile(chatMessageList, resData.MessageReadStatusList); // (16)
					   fnAddParticipateTab(chatroomNo);
					   return;
					}
				})
 			} else {
 				fnAddParticipateTab(chatroomNo);
				return;
 			}
 		})
 		.catch(error => {
 			console.error('Error fetching sender data:', error);
 		});
 		
 	};
 	
 	// 채팅방 열기
 	const fnOpenChatroom = (chatroomDto) => {
 	  
   	  // 채팅방 화면 display:none 없애기
   	  $('.chat-box').css('display', '');
  
      // 채팅방 이름 변경
   	  $('.chat-box-title > span:first').text(chatroomDto.chatroomTitle);
	    
      // 채팅방 번호 data 속성 추가
   	  $('.chat-box-title').attr('data-chatroom-no', chatroomDto.chatroomNo);
   	  $('.chat-box-title').data('chatroom-no', chatroomDto.chatroomNo);
   	  
      $('.chat-box-title').attr('data-chatroom-type', chatroomDto.chatroomType);
      $('.chat-box-title').data('chatroom-type', chatroomDto.chatroomType);
   	  
   		// 모달창 닫기
   	  $('#modal-default').modal('hide');
   		
   		// 채팅방 전 데이터 삭제
	    let chatMessageBody = $('.chatMessage-body');
	    chatMessageBody.empty();
   		
	    //console.log('fnOpenChatroom');
	    fnDisconnect(currentChatroomType, currentChatroomNo);
   		
   		// stomp 연결
   	  fnConnect(chatroomDto.chatroomType);
   	  
 	}
 	
 	
 	// 채팅 메시지 보기
 	// 이 함수는 전송 버튼을 눌렀을 때 실행이 되어야 하나..?
 	const fnShowChatMessage = (chatMessage) => {
 		
 		// 기본적으로 채팅 메시지 가져올때는 prepend로 앞에다 붙여주는데 메시지 보냈을 때는 끝에 붙여줘야 하니까..
 		
 		if(chatMessage.messageType === 'CHAT') {
 			
 			if(chatMessage.senderNo === ${sessionScope.user.employeeNo}) { 
 				// 내가 보낸 메시지인 경우,
 				 		
 	 		  // 메시지 작성자의 번호를 통해 input 데이터 가져오기
 	 		  const senderData = getEmployeeData(chatMessage.senderNo);
 				
 				// 만약 가져온 데이터가 있다면..
 				if(senderData) { // (20)
 					let messageHTML = '';				
 					messageHTML += '<div class="chatMessage-me">';
 					messageHTML += '  <div class="chatMessage-main">';
 					messageHTML += '    <div class="chatMessage-contents">';
 					messageHTML += '      <div class="chatMessage-content">' + chatMessage.messageContent + '</div>';
 					messageHTML += '    </div>';
 				  messageHTML += '    <div class="chatMessage-info">';
 				  messageHTML += '      <span class="chatMessage-time">' + moment(chatMessage.sendDt).format('A hh:mm') + '</span>';
 				  messageHTML += '    </div>';
 				  messageHTML += '  </div>';
 				  messageHTML += '</div>';
 				  $('.chatMessage-body').append(messageHTML);
 				}
 				
 			} else {
 				// 아닌 경우에는 프로필번호를 가지고 와서 그거에 맞는 값 가져옴.
 				 		
 		 		// 메시지 작성자의 번호를 통해 input 데이터 가져오기
 		 		const senderData = getEmployeeData(chatMessage.senderNo);
 				
 				// 만약 가져온 데이터가 있다면..
 				if(senderData) {
 					let messageHTML = '';
 					messageHTML += '<div class="chatMessage-you">';
 					messageHTML += '  <div class="chatMessage-profile">';
					if(senderData.profilePicturePath !== null && senderData.profilePicturePath !== undefined && senderData.profilePicturePath !== "") {
						messageHTML += '    <img class="direct-chat-img" src="' + senderData.profilePicturePath + '" alt="Message User Image">';
					} else {
						messageHTML += '    <img class="direct-chat-img" src="${contextPath}/resources/images/default_profile_image.png" alt="Message User Image">';
					}
 					messageHTML += '  </div>';
 					messageHTML += '  <div class="chatMessage-main">';
 					messageHTML += '    <div class="chatMessage-contents">';
 					messageHTML += '      <div class="chatMessage-senderName">' + senderData.name + '</div>';
 					messageHTML += '<div class="chatMessage-youMessage">';
 					messageHTML += '      <div class="chatMessage-content">' + chatMessage.messageContent + '</div>';
 					messageHTML += '</div>';
 					messageHTML += '    </div>';
 					messageHTML += '    <div class="chatMessage-info">';
 					messageHTML += '      <span class="chatMessage-time">' + moment(chatMessage.sendDt).format('A hh:mm') + '</span>';
 					messageHTML += '    </div>';
 					messageHTML += '  </div>';
 					messageHTML += '</div>';
 				  $('.chatMessage-body').append(messageHTML);				
 				}
 			}
 		} else if(chatMessage.messageType === 'LEAVE'){
 			let messageHTML = '';
 			//퇴장 메시지일 경우
 			messageHTML += '<div class="leaveChatMessage">' + chatMessage.messageContent + '</div>';
 			$('.chatMessage-body').append(messageHTML);
 			$('.chat-box-title > span:nth-of-type(2)').text($('.chat-memberProfileList > input').length);
 			
 			// 상태관리 탭 삭제
 			let senderNo = chatMessage.senderNo;
 			$('.participate_statusList employee-row').each(function() {
			  const employeeNo = $(this).find('td[data-employee-no]').data('employee-no');
		      if (employeeNo === senderNo) {
	            $(this).remove();
	          }
 			});
 			
 			
 		} else if(chatMessage.messageType === 'ADD'){
 			let messageHTML = '';
 			//초대 메시지일 경우
 			messageHTML += '<div class="AddChatMessage">' + chatMessage.messageContent + '</div>';
 			$('.chatMessage-body').append(messageHTML);
 			fnAddParticipateTab(chatMessage.chatroomNo);
 			$('.chat-box-title > span:nth-of-type(2)').text($('.chat-memberProfileList > input').length);
 		} else {
 			return;
 		}
 		

		// 스크롤 맨 밑으로 내리기
 	  const chatBox = $('.chat-body'); 
 	  chatBox.scrollTop(chatBox.prop('scrollHeight'));
		
		
		
	}
 	
 	// 채팅 내역 무한 스크롤
	const fnChatMessageScrollHandler = () => {
		  var timerId;
	    
		    $('.chat-body').on('scroll', (evt) => {
		     
		      if (timerId) {  
		        clearTimeout(timerId);
		      }
		      timerId = setTimeout(() => {
		    	  
		        let scrollTop = $('.chat-body').scrollTop(); // 모달 내부의 스크롤 위치 - scrollTop
		        let modalHeight = $('.chat-body').outerHeight(); // 모달의 전체 높이 - view
		        let scrollHeight = $('.chat-body').prop('scrollHeight'); // 모달 내부의 스크롤 가능한 영역의 높이 - document
		      
		        if(scrollTop <= 400) {  
		          if (page > chatMessageTotalPage) {
		            return;
		          }
		          page++;
		          fnGetChatMessage(gChatroomNo);
		        }
		      }, 100);
		    });
		};
		
		// 채팅 목록 가져오기
		const fnGetChatList = (employeeNo) => {
			
			$('.contacts-list').empty();
			
			// 알림의 chatroomNo리스트 가져오기
		    // 모든 <li> 요소들의 data-user-no 값을 배열로 가져와
		    let beforeChatroomNoList = $('.alert-menu > .notification-item').map(function() {
		      return $(this).data('chatroom-no');
		    }).get();
		
		    // 중복 제거를 위해 Set을 사용해
		    let chatroomNoList = [...new Set(beforeChatroomNoList)];
					
			
			/*
				1. DB에서 현재 로그인한 직원의 번호에 해당하는 chatroom 데이터를 List로 받아온다.
				2. 받아온 데이터를 반복문으로 돌리면서 리스트로 화면에 뿌려준다.
				
				{
				    "chatroomList": [
				        {
				            "chatroomNo": 1,
				            "creatorNo": 0,
				            "chatroomTitle": "한지수, 권태현",
				            "chatroomType": "OneToOne",
				            "chatroomCreatedDate": "2024-06-01T10:23:49.594+00:00",
				            "participantCount": 2
				        },
							...
				    ]
				}
			*/
			
			fetch('${contextPath}/chatting/getChatList.do?employeeNo=' + employeeNo, {
				method: 'GET',
			})
			.then((response) => response.json())
			.then(resData => {
				$.each(resData.chatroomList, (i, chatroom) => {
					
					
					let msg = '';
					msg += '<li>';
					msg += '  <a href="#" style="line-height: 27px;">';
					msg += '    <img class="direct-chat-img" src="${contextPath}/resources/images/free-icon-group-7158872.png" alt="Message User Image">';
					msg += '    <div class="contacts-list-info" style="vertical-align: middle; color: black;">';
					msg += '      <span class="contacts-list-name" style="font-size: 15px; font-weight: 500;">' + chatroom.chatroomTitle;
					msg += '  			<input type="hidden" class="chatroom-info" data-chatroom-no=' + chatroom.chatroomNo + ' data-creator-no=' + chatroom.creatorNo + ' data-chatroom-type=' + chatroom.chatroomType + ' data-chatroom-createdDate=' + chatroom.chatroomCreatedDate + ' data-chatroom-participantCount=' + chatroom.participantCount + '>'; 
					msg += '        <small class="contacts-list-date pull-right">' + chatroom.participantCount + '</small>';
					if(chatroomNoList.includes(chatroom.chatroomNo)) {
					  msg += '        <i class="fa fa-circle" style="color: darkorange;font-size: 8px;vertical-align: top;"></i>';
					}
					msg += '      </span>';
					msg += '    </div>';
					msg += '  </a>';
					
					
					msg += '</li>';
				
					$('.contacts-list').append(msg);
					//fnGochatroom();
				})
			})
	 		.catch(error => {
	 			console.error('Error fetching sender data:', error);
	 		}); 
		}
		
		
		
		// 채팅방 별로 참여자 번호 가져오기
		const fnGetParticipantsNoList = (chatroomNo) => {
			return fetch('${contextPath}/chatting/getChatroomParticipantList.do?chatroomNo=' + chatroomNo, {
				method: 'GET',
			})
			.then((response) => response.json())
			.then(resData => {
				
				const chatMessageList = resData.employeeNoList;
				const senderNoList = Array.from(new Set(chatMessageList.map(message => message.participantNo)));
				
				// 제목 옆의 숫자 바꾸기
				$('.chat-box-title > span:nth-of-type(2)').text(senderNoList.length);
				
				return senderNoList;
			})
		}
		
		// 채팅방목록에서 채팅방 클릭했을 때
		const fnGochatroom = () => {
			$('.chat-member').on('click','.contacts-list-name',  (evt) => {
				
			  page = 1;
			  chatMessageTotalPage = 0;
				//$('.chatMessage-body').empty();
				
				if($('.chat-memberProfileList').find('input').length > 0) {
					$('.chat-memberProfileList').empty();
				}
				
				// 1. input 요소 가져오기
				let $input = $(evt.target).find('input');
				
				// 2. 제목 가져오기
		    let title = $(evt.target).contents().filter(function() {
		      return this.nodeType === Node.TEXT_NODE;
		  	}).text().trim();

				// 2. chatroom 객체 생성
		    let chatroomDto = {
		        chatroomNo: $input.data('chatroom-no'),
		        creatorNo: $input.data('creator-no'),
		        chatroomTitle: title,
		        chatroomType: $input.data('chatroom-type'),
		        chatroomCreatedDate: $input.data('chatroom-createddate'),
		    };
				
		    gChatroomNo = chatroomDto.chatroomNo;
				
				// 1:1의 경우 chatroomDto.senderNo와 ${sessionScope.user.employeeNo}를 리스트로 만든다.
				fnGetParticipantsNoList(chatroomDto.chatroomNo)
				.then(senderNoList => {
					fetchSenderUserData(senderNoList);
				})
				
				// 채팅 내역 가져오기
				fnOpenChatroom(chatroomDto);
				
				// 알림 모두 삭제
				fnUpdateChatroomSeenStatus(chatroomDto.chatroomNo)
				  .then((response) => response.json())
				  .then(resData => {
					if(resData.updateStatusCount !== 0){
					  console.log('updateStatusCount: ', resData.updateStatusCount);
						
				    // 업데이트 성공 시, 채팅방 목록에서 해당 채팅방의 아이콘을 지운다.
				    $('ul.contacts-list li').each(function() {
				        const $input = $(this).find('input[type="hidden"]'); // <li> 요소의 후손인 <input> 요소를 찾아
				        if ($input.data('chatroom-no') == chatroomDto.chatroomNo) {
			        	  $(this).find('i').remove(); // 값이 chatroomNo와 같으면 아이콘 삭제
				          
			        	  
				          // 삭제후 상단 알림 아이콘 관련 업데이트
					 			  let redIcon = $('.messages-menu span');
					 			  let redIconCount = parseInt(redIcon.text(), 10);
					 			  let readAlert = $('.alert-menu-sub');
					 			  let updateStatusCount = resData.updateStatusCount;
					 			  
			 	   			  if(redIconCount - updateStatusCount > 0) {
			 	   					redIcon.text(redIconCount - updateStatusCount);
			 	   					readAlert.text('총 ' + (redIconCount - updateStatusCount) + '개의 읽지않은 알람');
			 	   			  } else {
			 	   					redIcon.text(0);   				
			 	   					redIcon.css('display', 'none'); 			
			 	   					readAlert.text('알람을 모두 확인했어요!');
			 	   			  }
			 	   			  
			 	   			  // 알림 리스트 삭제
 	   			        const itemsToRemove = [];
 	   			        $('.menu.alert-menu .notification-item').each(function() {
			 	   	        if ($(this).data('chatroom-no') == chatroomDto.chatroomNo) {
			 	   	          itemsToRemove.push(this);
			 	   	        }
			 	   	      });
	 	   			      itemsToRemove.forEach(function(item, index) {
	 	   			        $(item).remove();
	 	   			      });
				          
				        }
				      });
					  console.log('해당 채팅방의 알림 모두 삭제함.');
					}
				  })
			})
		}
		
		// 단체 채팅방 만들기
		const fnAddNewGroupChatroom = () => {
			
			// 새 채팅방 만들기 버튼 클릭 시 선택한 노드의 텍스트 값 가져옴.
	    $('.addChatRoomBtn').on('click', () => {
	    	
	    	// 'get_checked' 메서드로 선택된 노드 가져오기
        let checked_ids = $('#memberArea').jstree('get_checked', true);
	    	
        // 각 node의 id가 emp_로 시작하는 것들만 가져옴. 텍스트 값 가져오기
        let filterResult = checked_ids.filter((node) => {
        	return node.id.startsWith('emp_');
        })
        
        // 위에서 필터링 한 값들 가져오기 - 텍스트
        // 내 이름 가져오기
        let myName = $('.hidden-xs').text();
        
        // 내 이름 선택 시 제외하고 텍스트 가져오기
        let checkedMemberText = filterResult
        .map((node) => {
        	return node.text;
        })
        .filter((text) => {
        	let namePart = text.split(' ')[0];
        	return namePart !== myName;
        });
        
        // 위에서 필터링 한 값들 가져오기 - 직원번호
    		let userNo = ${sessionScope.user.employeeNo};
    		
    		let checkedMemberNo = filterResult
    	    .map((node) => {
    	        let idWithoutPrefix = node.id.replace('emp_', '');
    	        return idWithoutPrefix;
    	    })
    	    .filter((id) => {
    	        return id !== userNo.toString();
    	    });
        
        // 모달창에 추가하기 전에 초기화.
        $('.selected-member-cover').empty();
        
        // 선택한 직원이 없거나 한명이라면 경고창
        if(checkedMemberText.length === 0 || checkedMemberText.length < 2) {
        	alert('직원을 한명 이상 선택해주세요.');
        	
        } else {
     		// 반복문으로 output 돌면서 p 태그 추가
	        checkedMemberText.forEach((member) => {
	        	$('.selected-member-cover').append('<p>' + member + '</p>');
	        })
	        
	        // 직원번호 리스트 input에 저장
	        $('.selected-member-cover').append('<input type="hidden" id="hiddenList" value="">');
	        $('#hiddenList').val(JSON.stringify(checkedMemberNo));
	        
	        $('#modal-default2').modal('show');
        }
        
        
        $('.btn-groupChat').off('click').on('click', () => {
        	

					
        	fetch('${contextPath}/chatting/insertNewGroupChatroom.do', {
        		method: 'POST',
        		headers: {
        			'Content-Type': 'application/json',
        		},
        		body: JSON.stringify ({
        			'loginUserNo': ${sessionScope.user.employeeNo},
        			'employeeNoList': $('#hiddenList').val(),
        			'chatroomTitle': $('.newGroupChatroom-input').val()
        		})
        	})
        	.then((response) => response.json())
        	.then(resData => {

        		if(resData.insertGroupCount === 1) {
        			
        			// 방 생성 성공
        			$('.newGroupChatroom-input').val('');
        			
        			$('.chat-memberProfileList').empty();
        			
        			// 방 참여자 번호리스트 보냄(이때 나도 추가) - 화면 input에 추가해야 하기 때문
	    			  const beforeEmployeeList = $('#hiddenList').val();
	    			  const employeeList = JSON.parse(beforeEmployeeList).map(Number);
	    			  const userEmployeeNo = Number('${sessionScope.user.employeeNo}');
	    			  employeeList.push(userEmployeeNo);
	    			  
	    			  
	    			  fetchSenderUserData(employeeList)
   			  			.then(() => {
   			  				
   		    			  page = 1;
   		    			  chatMessageTotalPage = 0;
   		    			  gChatroomNo = resData.chatroom.chatroomNo;
   		    			  
   		    			  // 채팅방 열기
   		    			  fnOpenChatroom(resData.chatroom); // 여기서 fnConnect 실행 후 fnGetChatMessage(채팅내역가져오기) 가 실행된다.
		   	 	    		
   		    		 	  const chatBox = $('.chat-body'); 
   		    		 	  chatBox.scrollTop(chatBox.prop('scrollHeight'));
   			  				
   			  			})
        			
        		} else {
        			console.log('방 생성 실패하였습니다!');
        			
        		}
        		
        	})
			 		.catch(error => {
			 			console.error('Error fetching sender data:', error);
			 		}); 
        	
        	$('#modal-default2').modal('hide');
        })
	    });
			
		}


		// 처음 채팅방 세팅 후 상태 관리 탭 생성
		const fnAddParticipateTab = (chatroomNo) => {
			
			// 참여자 리스트 데이터 (status 포함) 가져오기
			fetch('${contextPath}/chatting/getChatroomParticipantList.do?chatroomNo=' + chatroomNo, {
				method: 'GET',
			})
			.then((response) => response.json())
			.then(resData => {
			
				// 초기화
				$('.participate_statusList tbody').empty();

				// employeeNo와 participateStatus 매핑
				let statusMap = {};
				$.each(resData.employeeNoList, function(index, item) {
					statusMap[item.participantNo] = item.participateStatus;
				});
				
				// input에서 참여자 데이터 가져와서 추가
				$('.chat-memberProfileList input[type="hidden"]').each(function() {
					
					let employeeNo = $(this).data('employee-no');
					let employeeName = $(this).data('employee-name');
					
					let status = statusMap[employeeNo] === 1 ? '온라인' : '오프라인';
					let statusClass = statusMap[employeeNo] === 1 ? 'online' : 'offline';
					
					let newRow = '<tr class="employee-row">'
					newRow += '<td data-employee-no="' + employeeNo + '">' + employeeName + '</td>'
					newRow += '<td class="status ' + statusClass + '">' + status + '</td>'
					newRow += '</tr>';
					
					$('.participate_statusList tbody').append(newRow);
					
				})
		});
		
		}
		
		
		// 상태 관리 함수
		const fnUpdateParticipateStatus = (chatroomMessage) => {
			
			// 여기서는 상태 변경을 해주면 된다.
			// chatroomMessage.senderNo값에 해당하는 employeeNo를 가진 td요소를 가져와서 그것의 친구 요소인 status값과 class를 오프라인으로 변경해준다.
			
			let statusCode = chatroomMessage.messageContent;
			let employeeNo = chatroomMessage.senderNo;
			
	    let status = statusCode === '1' ? '온라인' : '오프라인';
	    let statusClass = statusCode === '1' ? 'online' : 'offline';
			
	    let $employeeTd = $('td[data-employee-no="' + employeeNo + '"]');
	    if ($employeeTd.length) {
	        // 상태를 표시하는 td 요소를 찾아서 클래스와 내용을 업데이트해준다.
	        let $statusTd = $employeeTd.siblings('.status');
	        $statusTd.removeClass('online offline').addClass(statusClass).text(status);
	    }
		}
		
 
		// 채팅방 나가기
 		const fnExitChatroom = () => {
 			
 			// 채팅방 나가기 버튼 클릭 시..
 			$('.leave-chat').on('click', () => {
 				
 	 			let chatroomNo = $('.chat-box-title').data('chatroom-no');
 	 			let participantNo = ${sessionScope.user.employeeNo};
 	 			
 				// 나간 사용자 데이터 삭제
 				fetch('${contextPath}/chatting/deleteParticipant.do?chatroomNo=' + chatroomNo + '&participantNo=' + participantNo, {
 					method: 'delete',
 					headers: {
 						'Content-Type': 'application/json',
 					},
 				})
 				.then((response) => response.json())
 				.then(resData => {

					/*
					{
					    "chatroomNo": 29,
					    "LeaveMessage": "김의정 사원님이 채팅방을 나갔습니다.",
					    "deleteCount": 1
					} 
					 */
					 
					 let chatroomNo = resData.chatroom.chatroomNo;
					 let chatroomType = resData.chatroom.chatroomType;
					 let leaveMessage = resData.LeaveMessage;
					 
					 if(resData.deleteCount === 1) {
						 
						 const sendPath = chatroomType === 'OneToOne' ? '/send/one/' + chatroomNo : '/send/group/' + chatroomNo;


						 stompClient.send(sendPath, {},
							    JSON.stringify({
							        'chatroomNo': chatroomNo,
							        'messageType': 'LEAVE',
							        'messageContent': leaveMessage,
							        //'isRead': 0,
							        'senderNo': ${sessionScope.user.employeeNo},
							        
							    })
							);
						 
							    // chat-box 숨기기
							    $('.chat-box').css('display', 'none');
							    
							    // 채팅방 연결 종료
							    fnDisconnect(chatroomType, chatroomNo);
							    
							    // 해당 사용자가 나간 채팅방 알림 상태 읽음으로 업데이트
							    fnUpdateChatroomSeenStatus(chatroomNo);
							    
							    // 채팅방 리스트 갱신
							    fnGetChatList(${sessionScope.user.employeeNo});
							    
							    // 페이지 새로고침
							    //window.location.reload();
					 } else {
						 alert('채팅방 나가기에 실패했습니다 ㅜ');
					 }
 				})
 	 			.catch(error => {
 	 				console.error('delete 요청 에러: ' + error);
 	 			})
 			})
 			
 		}
 		
 		// 쿼리 파라미터 가져옴.
    const getQueryParams = () => {
        const params = {};
        window.location.search.slice(1).split('&').forEach(param => {
            const [key, value] = param.split('=');
            params[key] = decodeURIComponent(value);
        });
        return params;
    }
    
    // 쿼리 파라미터에 따라 값이 있으면 chatroom데이터 가져와서 열기
    window.onload = () => {
    	// 페이지 로드 후 쿼리 파라미터 가져옴.
      const params = getQueryParams();
      if (params.chatroomNo) { // 파라미터 있으면?
    		  
    		  // 해당 chatroomNo에 해당하는 chatroomDto 가져오기
    		  fetch('${contextPath}/chatting/getChatroomByChatroomNo.do?chatroomNo=' + params.chatroomNo, {
    			  method: 'GET',
    		  })
    			.then((response) => response.json())
    			.then(resData => {
    				
    					let chatroom = resData.chatroom;
    				
    				  	page = 1;	
    				  	chatMessageTotalPage = 0;
    					$('.chat-memberProfileList').empty();

    					gChatroomNo = chatroom.chatroomNo;

    					fnGetParticipantsNoList(chatroom.chatroomNo)
    					.then(senderNoList => {
    						fetchSenderUserData(senderNoList);
    					})
    				
	    				// 채팅방 열기
	    				fnOpenChatroom(resData.chatroom);
    					
    			})
    		  
      } else { //쿼리 파라미터 없음
          return;
      }
    };
 
    // 채팅방 이름 수정 모달 표시
    const fnUpdateChatroomTitleModal = () => {
   	  $('.modify-chatTitle').on('click', () => {
   	    let chatroomTitle = $('.chat-box-title > span:first').text();
   	    let chatroomNo = $('.chat-box-title').data('chatroom-no');
   	
   	    // 모달창에 원래 제목 데이터 넣어주기
   	    $('.newChatroomTitle-input').val(chatroomTitle);
   	    $('.newChatroomTitle-input').after('<input type="hidden" class="chatroomNo" data-chatroom-no="' + chatroomNo + '" placeholder="채팅방 이름을 작성해주세요"');
   	
   	    // 모달창 표시
   	    $('#modal-default3').modal('show');
   	    fnUpdateChatroomTitle();
   	  })
    }
    
    // 채팅방 이름 수정
    const fnUpdateChatroomTitle = () => {
   	  $('.btn-modifyChatroomTitle').on('click', () => {
   	    
        // input값, 현재 로그인한 직원 번호 서버로 보내기
        let chatroomTitle = $('.newChatroomTitle-input').val();
        let chatroomNo = $('.chat-box-title').data('chatroom-no');
        
        fetch('${contextPath}/chatting/updateChatroomTitle.do',{
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              'chatroomTitle': chatroomTitle,
              'chatroomNo': chatroomNo
          })
        })
        .then((response) => response.json())
        .then(resData => {
        
          if(resData.updateChatroomTitleCount === 1) {
        	// 업데이트 성공시
        	
        	// 채팅방 이름 바꾸기
       	    $('.chat-box-title > span:first').text(chatroomTitle);
			// 모달창 input 초기화        	
       	    $('.newChatroomTitle-input').val('');
       	    // 모달창 닫기
       	    $('#modal-default3').modal('hide');
			        	 
	       	 // 모든 .chatroom-info 요소를 선택
	       	 $('.chatroom-info').each(function() {
	       	     // data-chatroom-no 값을 가져오기
	       	     let chatroomListNo = $(this).data('chatroom-no');
	       	     
	       	     // chatroomNo 값과 비교
	       	     if (chatroomListNo == chatroomNo) {
	       	         // 부모 요소를 선택
	       	         var parentElement = $(this).parent();
	       	         // 부모 요소의 값을 변경 (예: 텍스트 내용 변경)
	       	         parentElement.text(chatroomTitle);
	       	     }
	       	 });
        	  
          } else {
        	alert('채팅방 이름 수정에 실패하였습니다!!');
          }
        	
        	
        	
        })
     })
   }
    

    
   // 채팅방 새 인원 초대하기 - 모달
   const fnAddNewMemberModal = () => {
	   
     $('.add-newMember').on('click', () => {
    	 
  	   fetch('${contextPath}/user/getUserList.do',{
		      method: 'GET',
	      })
		  .then((response) => response.json())
		  .then(resData => {
			  
			  // 변환한 데이터 담을 배열 선언
			  var jstreeData = [];
			  
			  // jstree 데이터가 이미 있으면 지워줌.
		      if ($('.selected-addMember-cover').jstree(true)) {
		        $('.selected-addMember-cover').jstree('destroy').empty();
		      }
			  
			  // 회사 root node로 설정
			  var com = resData.departments.find(depart => depart.departName === 'Academix');
			  if(com) {
				  jstreeData.push({
					  id: com.departmentNo,
					  parent: '#',
					  text: com.departName,
					  icon: "fa fa-building"
				  });
			  }
			  
			  // employee 데이터에서 대표데이터만 빼서 설정
			  var ceo = resData.employee.find(employee => employee.rank.rankTitle === '대표이사');
			  if(ceo) {
				  jstreeData.push({
					  id: 'emp_' + ceo.employeeNo,
					  parent: '0',
					  text: ceo.name + ' ' + ceo.rank.rankTitle,
					  icon: "fa fa-star"
				  });
			  }
			  
			  // 부서 데이터
			  resData.departments.forEach(function(department) {
				  if(department.departName !== 'Academix'){
					  jstreeData.push({
						  id: department.departmentNo.toString(),
						  parent: department.parentDepartNo.toString(),
						  text: department.departName,
						  icon: "fa fa-dot-circle-o"
					  });
				  }
			  });
			  
			  // 직원 데이터
			  resData.employee.forEach(function(employee) {
				  if(employee.depart.departmentNo !== 0 && employee.employeeStatus !== 0){ // 대표이사 제외
					  if(employee.rank.rankNo === 5) {
		     		  jstreeData.push({
		     			  id: 'emp_' + employee.employeeNo,
		     			  parent: employee.depart.departmentNo.toString(),
		     			  text: employee.name + ' ' + employee.rank.rankTitle,
		     			  icon: "fa fa-mortar-board"
		     		  });
					  } else {
	    		  jstreeData.push({
	    			  id: 'emp_' + employee.employeeNo,
	    			  parent: employee.depart.departmentNo.toString(),
	    			  text: employee.name + ' ' + employee.rank.rankTitle,
	    			  icon: "fa fa-user"
	    		  });
					  }
				  }
			  });
			  
			  //console.log('jstreeData', jstreeData);
			  
			  // jstree 데이터 추가 - jstree가 로드되면 모든 노드 열리게 설정
			  $('.selected-addMember-cover').jstree({
				  'core': {
					  'data': jstreeData,
			        'themes': {
			           'icons': true
			        }
				  },
				  'plugins': ['search', 'checkbox'],
			   		  'checkbox': {
					       'keep_selected_style': true,
					       'three_state': false,
					       'whole_node' : false,
					       'tie_selection' : false,
					       'cascade': 'down'
					    }      		  
			  }).on('ready.jstree', function() {
				  $(this).jstree(true).open_all();
			  })
			  
			  // 모달창 표시
   	    	  $('#modal-default4').modal('show');
			  fnAddNewMember();
			  
			  
		    // 검색 기능 추가
/* 		    $('.searchInput').on('keyup', function() {
		  	  var searchString = $(this).val();
		  	  $('.selected-member-cover').jstree('search', searchString);
		    }); */
			  
		  })
		  .catch(error => {
		    console.error('There has been a problem with your fetch operation:', error);
		  });
     })
   }
   
   // 채팅방 멤버 초대
const fnAddNewMember = () => {
  $('.btn-addNewMember').off('click').on('click', () => {
    
    // 채팅방 참여중인 직원 번호 리스트 가져오기
    let employeeNoList = [];
    $('.chat-memberProfileList input[type="hidden"]').each(function() {
      employeeNoList.push($(this).data('employee-no').toString());
    });

    // 'get_checked' 메서드로 선택된 노드 가져오기
    let checked_ids = $('.selected-addMember-cover').jstree('get_checked', true);
    let filterResult = checked_ids.filter((node) => {
      return node.id.startsWith('emp_');
    });
    
    // 직원번호 추출 및 중복 제거
    let checkedMemberNo = [...new Set(filterResult.map((node) => node.id.replace('emp_', '')))];

    // employeeNoList에 포함된 번호가 있는지 확인
    let alreadyInList = checkedMemberNo.some((memberNo) => employeeNoList.includes(memberNo));

    console.log('checkedMemberNo: ', checkedMemberNo);

    if (alreadyInList) {
      alert('채팅방에 이미 참여중인 직원은 선택할 수 없습니다.');
      return;
    } else {
      // fetch에 작성하여 chatroom-no와 checkedMemberNo 보내기
      fetch('${contextPath}/chatting/insertNewParticipateList.do', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'chatroomNo': $('.chat-box-title').data('chatroom-no'),
          'participantNoList': checkedMemberNo,
          'employeeNo': ${sessionScope.user.employeeNo}
        })
      })
      .then((response) => response.json())
      .then(resData => {
        if (resData.insertNewParticipate.addParticipantCount === checkedMemberNo.length) {
          // 1. 초대된 직원의 데이터를 member-profile에 저장
          let employeeList = resData.insertNewParticipate.participantList;
          employeeList.forEach(resData => {
            let profilePicturePath = '';
            // profilePicturePath가 유효한지 확인하고 src 부분 추출하기
            if (resData.profilePicturePath) {
              const match = resData.profilePicturePath.match(/src="([^"]+)"/);
              if (match && match[1]) {
                profilePicturePath = match[1];
              }
            }
            const hiddenInputHTML = '<input type="hidden" data-employee-no="' + resData.employeeNo + '" data-employee-name="' + resData.name + ' ' + resData.rank.rankTitle + '" data-employee-profilePicturePath="' + profilePicturePath + '">';
            const chatMemberProfileList = $('.chat-memberProfileList');

            if (chatMemberProfileList.length) {
              chatMemberProfileList.append(hiddenInputHTML);
            } else {
              console.error('.chat-memberProfileList element not found');
            }
          });

          // 3. 기존직원 상태관리 추가
          resData.insertNewParticipate.participantList.forEach(function(participant) {
            const newRow = $('<tr>').addClass('employee-row');
            const nameCell = $('<td>')
              .attr('data-employee-no', participant.employeeNo)
              .text(participant.name + ' ' + participant.rank.rankTitle);
            const statusCell = $('<td>')
              .addClass('status')
              .addClass('offline')
              .text('오프라인');

            newRow.append(nameCell).append(statusCell);
            $('.participate_statusList > tbody').append(newRow);
          });

          // 2. 구독하고 있는 직원들에게 message_type Add로 메시지 전송
          let chatroomNo = $('.chat-box-title').data('chatroom-no');
          let JoinMessage = resData.insertNewParticipate.JoinMessage;
          const sendPath = currentChatroomType === 'OneToOne' ? '/send/one/' + chatroomNo : '/send/group/' + chatroomNo;
          stompClient.send(sendPath, {},
            JSON.stringify({
              'chatroomNo': chatroomNo,
              'messageType': 'ADD',
              'messageContent': JoinMessage,
              'senderNo': ${sessionScope.user.employeeNo}
            })
          );

          // 방 참여 인원 변경
          $('.chat-box-title > span:nth-of-type(2)').text($('.chat-memberProfileList > input').length);

          $('#modal-default4').modal('hide');
        }
      })
    }
  });
}


   

    
  fnPressEnterSendBtn();
  fnGetChatUserList();
  fnShowChatList();
  fnAddChatRoom();
  fnGochatroom();
  fnChatMessageScrollHandler();
  fnAddNewGroupChatroom();
  fnExitChatroom();
  fnUpdateChatroomTitleModal();
  fnAddNewMemberModal();
  
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