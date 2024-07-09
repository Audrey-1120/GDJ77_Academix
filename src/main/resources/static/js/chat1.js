  
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
      fnGetChatList(currentEmployeeNo);
      // 채팅 클릭 시..
      
      
	  })
	  
  }

  // 직원 리스트 가져오기
  const fnGetChatUserList = () => {
	  
 	  // 새로운 태그 추가
    $('.chat-member-title').after('<div class="searchInput-cover"></div>');
    $('.searchInput-cover').append('<input type="text" class="searchInput" placeholder="직원 검색">')
    $('.chat-member').append('<div id="memberArea"></div>');
	  
	  fetch('/user/getUserList.do',{
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

		  fetch('/user/getUserProfileByNo.do?employeeNo=' + employeeNo,{
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
				  $('.chat-modal-profile > img').attr('src', '/resources/images/default_profile_image.png');
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
		  
		  if(currentEmployeeNo === chatUserNo) {
			  return;
		  }
		  
		  fetch('/chatting/isOneToOneChatroomExits.do?loginUserNo=' + currentEmployeeNo + '&chatUserNo=' + chatUserNo,{
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
		    	  fetch('/chatting/insertNewOneToOneChatroom.do', {
		    		  method: 'POST',
		    		  headers: {
	    			    "Content-Type": "application/json",
	    			  },
		    		  body: JSON.stringify({
		    			  loginUserNo: currentEmployeeNo,
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
		    			  
		    			  const employeeList = [currentEmployeeNo, chatUserNo];
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
    	    	
    	    	const employeeList = [currentEmployeeNo, chatUserNo];
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
		let employeeNo = currentEmployeeNo;
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
	                    'senderNo': currentEmployeeNo
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
	                'senderNo': currentEmployeeNo
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
	    let employeeNo = currentEmployeeNo;
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
							'senderNo': currentEmployeeNo,
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
							'senderNo': currentEmployeeNo,
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
		return fetch('/user/getUserProfileListByNo.do', {
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
					if(message.senderNo === currentEmployeeNo) { // (18)
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
								messageHTML += '    <img class="direct-chat-img" src="/resources/images/default_profile_image.png" alt="Message User Image">';
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
							messageHTML += '    <img class="direct-chat-img" src="/resources/images/default_profile_image.png" alt="Message User Image">';
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
		
		