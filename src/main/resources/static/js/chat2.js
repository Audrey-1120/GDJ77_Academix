	
 	// 채팅 내역 가져오기
 	const fnGetChatMessage = (chatroomNo) => { 
 		
 		if(chatroomNo === undefined) {
 			return;
 		}
 		
 		fetch('/chatting/getChatMessageList.do?chatroomNo=' + chatroomNo + '&page=' + page, {  // (3)
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
 			
 			if(chatMessage.senderNo === currentEmployeeNo) { 
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
						messageHTML += '    <img class="direct-chat-img" src="/resources/images/default_profile_image.png" alt="Message User Image">';
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
			
			fetch('/chatting/getChatList.do?employeeNo=' + employeeNo, {
				method: 'GET',
			})
			.then((response) => response.json())
			.then(resData => {
				$.each(resData.chatroomList, (i, chatroom) => {
					
					
					let msg = '';
					msg += '<li>';
					msg += '  <a href="#" style="line-height: 27px;">';
					msg += '    <img class="direct-chat-img" src="/resources/images/free-icon-group-7158872.png" alt="Message User Image">';
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
			return fetch('/chatting/getChatroomParticipantList.do?chatroomNo=' + chatroomNo, {
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
				
				// 1:1의 경우 chatroomDto.senderNo와 currentEmployeeNo를 리스트로 만든다.
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
    		let userNo = currentEmployeeNo;
    		
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
        	

					
        	fetch('/chatting/insertNewGroupChatroom.do', {
        		method: 'POST',
        		headers: {
        			'Content-Type': 'application/json',
        		},
        		body: JSON.stringify ({
        			'loginUserNo': currentEmployeeNo,
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
	    			  const userEmployeeNo = Number('currentEmployeeNo');
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
			fetch('/chatting/getChatroomParticipantList.do?chatroomNo=' + chatroomNo, {
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
 	 			let participantNo = currentEmployeeNo;
 	 			
 				// 나간 사용자 데이터 삭제
 				fetch('/chatting/deleteParticipant.do?chatroomNo=' + chatroomNo + '&participantNo=' + participantNo, {
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
							        'senderNo': currentEmployeeNo,
							        
							    })
							);
						 
							    // chat-box 숨기기
							    $('.chat-box').css('display', 'none');
							    
							    // 채팅방 연결 종료
							    fnDisconnect(chatroomType, chatroomNo);
							    
							    // 해당 사용자가 나간 채팅방 알림 상태 읽음으로 업데이트
							    fnUpdateChatroomSeenStatus(chatroomNo);
							    
							    // 채팅방 리스트 갱신
							    fnGetChatList(currentEmployeeNo);
							    
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
    		  fetch('/chatting/getChatroomByChatroomNo.do?chatroomNo=' + params.chatroomNo, {
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
        
        fetch('/chatting/updateChatroomTitle.do',{
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
    	 
  	   fetch('/user/getUserList.do',{
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
      fetch('/chatting/insertNewParticipateList.do', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'chatroomNo': $('.chat-box-title').data('chatroom-no'),
          'participantNoList': checkedMemberNo,
          'employeeNo': currentEmployeeNo
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
              'senderNo': currentEmployeeNo
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