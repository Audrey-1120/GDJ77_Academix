<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
    
    
<!-- sockjs-client 1.6.1 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.6.1/sockjs.min.js" integrity="sha512-1QvjE7BtotQjkq8PxLeF6P46gEpBRXuskzIVgjFpekzFVF4yjRgrQvTG1MTOJ3yQgvTteKAcO7DSZI92+u/yZw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<!-- stomp.js 2.3.3 -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/stomp.js/2.3.3/stomp.min.js" integrity="sha512-iKDtgDyTHjAitUDdLljGhenhPwrbBfqTKWO1mkhSFH3A7blITC9MhYon6SjnMhp4o0rADGw9yAC6EW4t5a4K3g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>  

<!-- include custom css/js -->
<link rel="stylesheet" href="${contextPath}/resources/css/footer.css?dt=${dt}">

<script>
  $.widget.bridge('uibutton', $.ui.button);
  
  

  // 전역 stomp 클라이언트 설정
  let globalStompClient;
  
  const fnConnectGlobalStompClient = () => {
	  let employeeNo = ${sessionScope.user.employeeNo};
	  let globalSocket = new SockJS("/ws-stomp?employeeNo=" + employeeNo);
	  globalStompClient = Stomp.over(globalSocket); // STOMP 클라이언트 객체 저장
	  
	  globalStompClient.connect({}, (frame) => {
		  
		  console.log("Connected:", frame);
		  globalStompClient.subscribe('/user/queue/notifications', (notification) => { // notification은 수신된 메시지를 가리키는 객체
			  
			  const message = JSON.parse(notification.body);
			  fnShowAlert(message);
			  fnShowChatroomIcon(message);
			  //showNotification(JSON.parse(notification.body));
		  }, {id: 'alert-' + employeeNo});
	  }, function(error) {
		  console.log('WebSocket connection error: ' + error);
	  });
  };
	
	
	// 알림 메시지 추가
 	const fnShowAlert = (notification) => {
 		
		/*
		{"notificationNo":4,
			"seenStatus":0,
			"employeeNo":6,
			"chatroomNo":2,
			"notifierNo":16,
			"message":"알림 테스트3\n",
			"notificationType":"CHAT",
			"notifierName":"김지현 강사",
			"notificationDate":"2024-06-11T06:26:48.562+00:00"
			} 
		*/
 		
		// 메시지 내용 : 송신자/내용 -> /기준으로 각각 파싱
		
		// 메시지 내용이 10자 이상이면 10글자까지만 추출해서 보여줌.
		let messageContent = notification.message;
		let chatroomNo = notification.chatroomNo;
		let senderName = notification.notifier.name + ' ' + notification.notifier.rank.rankTitle;
		
		let notificationDate = notification.notificationDate;
		let notificationTime = getTimeDifference(notificationDate);
		
		let redIcon = $('.messages-menu span');
		let redIconCount = parseInt(redIcon.text(), 10);
		let readAlert = $('.alert-menu-sub');
		
		let $menu = $('.alert-menu');
		// 받아온 메시지를 알림메시지에 추가한다.
		let msg = '';
		msg += '<li class="notification-item" data-chatroom-no="' + chatroomNo + '">';
		msg += '  <a href="#">';
		msg += '    <div class="pull-left">';
		msg += '      <img src="${contextPath}/resources/images/free-icon-star-1828884.png" class="img-circle" alt="User Image" style="width: 20px; height: 20px; margin: 6px auto auto 6px;">';
		msg += '    </div>';
		msg += '    <h4>';
		msg += senderName;
		msg += '<small style="margin-right: 15px;"><i class="fa fa-clock-o" style="margin-right: 2px;"></i>' + notificationTime + '</small>'
		msg += '<small class="btn-removeMessageAlert"><i class="fa fa-times" style="margin-left: 10px;"></i></small>';
		msg += '    </h4>';
		msg += '    <p>' + messageContent + '</p>';
		msg += ' </a>';
		msg += '</li>';
		
		$menu.prepend(msg);
		
		redIcon.css('display', ''); 	
		redIcon.text(redIconCount + 1);
		readAlert.text('총 ' + (redIconCount + 1) + '개의 읽지않은 알람');
        <!-- start message -->
		
	}
 	
 	// 알림 메시지 가져오기
 	const fnGetNotificationList = () => {
 		
 		// employeeNo에 따른 알림 메시지 가져오기
 		let employeeNo = ${sessionScope.user.employeeNo};
 		fetch('${contextPath}/notification/getNotificationList.do?employeeNo=' + employeeNo, {
 			method: 'GET',
 		})
 		.then((response) => response.json())
 		.then(resData => {
 			
 			/*
			{
			    "notificationList": [
			        {
			            "notificationNo": 18,
			            "seenStatus": 0,
			            "employeeNo": 7,
			            "chatroomNo": 2,
			            "notifierNo": 11,
			            "message": "내일 회의 시간 다시 확인 부탁드려요.\n",
			            "notificationType": "CHAT",
			            "notificationDate": "2024-06-12T00:12:42.513+00:00",
			            "notifier": {
			                "employeeNo": 7,
			                "employeeStatus": 0,
			                "name": "정은비",
			                "email": null,
			                "phone": null,
			                "address": null,
			                "password": null,
			                "profilePicturPath": null,
			                "hireDate": null,
			                "exitDate": null,
			                "depart": null,
			                "rank": {
			                    "rankNo": 1,
			                    "rankTitle": "수석"
			                }
			            }
			        },
 			*/
				// 받아온 알림 리스트를 돌면서 알림창에 추가 
				resData.notificationList.forEach((notification) => {
					
			 			let messageContent = notification.message;
			 			let chatroomNo = notification.chatroomNo;
			 			let notificationNo = notification.notificationNo;
			 			let senderName = notification.notifier.name + ' ' + notification.notifier.rank.rankTitle;
			 			
			 			let notificationDate = notification.notificationDate;
			 			let notificationTime = getTimeDifference(notificationDate);
			 			
			 			let $menu = $('.alert-menu');
			 			// 받아온 메시지를 알림메시지에 추가한다.
			 			let msg = '';
			 			msg += '<li class="notification-item" data-chatroom-no="' + chatroomNo + '" data-notification-no="' + notificationNo + '">';
			 			msg += '  <a href="#">';
			 			msg += '    <div class="pull-left">';
			 			msg += '      <img src="${contextPath}/resources/images/free-icon-star-1828884.png" class="img-circle" alt="User Image" style="width: 20px; height: 20px; margin: 6px auto auto 6px;">';
			 			msg += '    </div>';
			 			msg += '    <h4>';
			 			msg += senderName;
			 			msg += '<small style="margin-right: 15px;"><i class="fa fa-clock-o" style="margin-right: 2px;"></i>' + notificationTime + '</small>'
			 			msg += '<small class="btn-removeMessageAlert"><i class="fa fa-times" style="margin-left: 10px;"></i></small>';
			 			msg += '    </h4>';
			 			msg += '    <p>' + messageContent + '</p>';
			 			msg += ' </a>';
			 			msg += '</li>';
			 			
			 			$menu.append(msg);
			 			//$alertIcon.text(resData.notificationList.length);
			 			
				})
				
	 			let redIcon = $('.messages-menu span');
		        let redIconCount = parseInt(redIcon.text(), 10);
	 			let readAlert = $('.alert-menu-sub');
	 			
				if(resData.notificationList.length > 0) {
					redIcon.css('display', ''); 
					redIcon.text(resData.notificationList.length);
					readAlert.text('총 ' + resData.notificationList.length + '개의 읽지않은 알람');
				} else {
					redIcon.text(0);				
					redIcon.css('display', 'none'); 
					readAlert.text('알람을 모두 확인했어요!');
				}
 			})
		    .catch(error => {
		      console.error('There has been a problem with your fetch operation:', error);
		    });
  }
 	
   	// x 버튼 눌러서 메시지 알림 삭제
   	const fnRemoveMessageAlert = () => {
   		$(document).on('click', '.btn-removeMessageAlert', (evt) => {
   			evt.stopPropagation();  			
   			// 해당 요소의 notification_no 넘겨줌
   			let notificationNo = $(evt.target).closest('.notification-item').data('notification-no');
   			let notificationNoList = [];
   			notificationNoList.push(notificationNo);
   			fnUpdateSeendStatus(notificationNoList);

 			let redIcon = $('.messages-menu span');
 			let redIconCount = parseInt(redIcon.text(), 10);
 			let readAlert = $('.alert-menu-sub');
   			
   			// 해당 요소 삭제
   			evt.preventDefault();
   			$(evt.target).closest('.notification-item').remove();
   		    
   			// 해당 알림 개수 업데이트
   			if(redIconCount - 1 > 0) {
   				redIcon.text(redIconCount - 1);
   				readAlert.text('총 ' + (redIconCount - 1) + '개의 읽지않은 알람');
   			} else {
   				redIcon.text(0);   				
   				redIcon.css('display', 'none'); 			
   				readAlert.text('알람을 모두 확인했어요!');
   			}
   				
   		})
   	}
    
    // seenStatus값 0에서 1로 업데이트하기
    const fnUpdateSeendStatus = (notificationNoList) => {
    	
    	fetch('${contextPath}/notification/updateSeenStatus.do', {
    		method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            notificationNoList: notificationNoList,
        })
    	})
    	.then((response) => response.json())
    	.then(resData => {
    	})
	    .catch(error => {
	      console.error('There has been a problem with your fetch operation:', error);
	    });
   	} 	
    
    
    // 시간 계산
    const getTimeDifference = (timestamp) => {
        const notificationTime = new Date(timestamp);
        const now = new Date();
        const diff = now - notificationTime;
        const diffMinutes = Math.floor(diff / 1000 / 60);
        const diffHours = Math.floor(diff / 1000 / 60 / 60);
        const diffDays = Math.floor(diff / 1000 / 60 / 60 / 24);

        if (diffMinutes < 1) {
            return "방금";
        } else if (diffMinutes < 60) {
            return diffMinutes + "분 전";
        } else if (diffHours < 24) {
            return diffHours + "시간 전";
        } else {
            return diffDays + "일 전";
        }
    }
    
    // 메시지 알림 모두 삭제
	const fnRemoveAllMessageNotify = () => {
		// 모든 메시지 알림 삭제 버튼 클릭 시
    $('.remove-allMessageNoti').on('click', () => {
        let notificationNoList = [];

        $('.notification-item').each(function() {
        	notificationNoList.push($(this).data('notification-no'));
        });
        
        if(notificationNoList.length > 0) {
	        fnUpdateSeendStatus(notificationNoList);
	        $('.alert-menu').empty();
	        $('.alert-menu-sub').text('알람을 모두 확인했어요!');
	        $('.messages-menu span').text(0);
	        $('.messages-menu span').css('display', 'none');
	        
        } else {
        	return;
        }
    });
	}
	
	// 채팅방 별 모든 알림 지우기
	const fnUpdateChatroomSeenStatus = (pChatroomNo) => {
	  
	  let employeeNo = ${sessionScope.user.employeeNo};
	  let chatroomNo = pChatroomNo;
	  
	  // 해당 번호 보내서 채팅방에 해당하는 모든 알림 업데이트
      return fetch('${contextPath}/notification/updateChatroomSeenStatus.do', {
   		  method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            employeeNo: employeeNo,
            chatroomNo: chatroomNo
          })
    	})
	}
    

		
    // 알림 클릭 시 해당 채팅방으로 이동
     const fnDirectChatroom = () => {
   	   $(document).on('click', '.notification-item', (evt) => {
   		 let notificationNo = $(evt.currentTarget).data('notification-no');
   		 let chatroomNo = $(evt.currentTarget).data('chatroom-no');
   		 let notificationNoList = [notificationNo];
   		 fnUpdateChatroomSeenStatus(chatroomNo)
   		   .then((response) => response.json())
   		   .then(resData => {
		     if(resData.updateStatusCount !== 0) {
   		   	   window.location.href = '${contextPath}/chatting/chat.page?chatroomNo=' + chatroomNo;
		     } else {
		       alert('채팅방 이동으로 실패했습니다.');
		     }
   		 })
	    .catch(error => {
	      console.error('There has been a problem with your fetch operation:', error);
	    });
   	  })
    } 
     
    // 알림 받았을 때 채팅방에 표시해주기 
    const fnShowChatroomIcon = (notification) => {
	  
      // 채팅방 번호 가져오기
   	  let gChatroomNo = notification.chatroomNo;
   	  
      // 채팅방 목록을 돌면서 해당 채팅방 번호에 해당하는 요소의 i 제거
      $('.contacts-list li').each(function(){
    	  const $input = $(this).find('input[type="hidden"]');
    	  if($input.data('chatroom-no') == gChatroomNo) {
    		  const $span = $(this).find('span.contacts-list-name');
 	        if ($span.find('i.fa-circle').length === 0) {
            $span.append('<i class="fa fa-circle" style="color: darkorange;font-size: 8px;vertical-align: top;"></i>');
          }
    	  }
      })
    }
    
    // 최근 4개 메시지 가져오기
    
    const fnGetLatestMessage = () => {
      
      let employeeNo = ${sessionScope.user.employeeNo};
    	
      fetch('${contextPath}/notification/getLatestMessage.do?employeeNo=' + employeeNo, {
        method: 'GET',
      })
      .then((response) => response.json())
      .then(resData => {
    	  
    	  if(resData.LatestMessageList.length !== 0) {
	    	  $('.message-table').empty();
	    	  $.each(resData.LatestMessageList, (i, message) => {
	    	    let msg = '<tr>';
	    	    msg += '<td><input type="checkbox"></td>';
	    	    msg += '<td>' + message.notifier.name + ' ' + message.notifier.rank.rankTitle + '</td>';
	    	    msg += '<td>' + message.message + '</td>';
	    	    msg += '<td>' + moment(message.notificationDate).format('A hh:mm') + '</td>';
	    		$('.message-table').append(msg);
	    	  })
    	  
    	  } else {
    		  $('.message-table').empty();
    	      let msg = '<tr>';
    	      msg += '<td>최근 메시지가 없습니다.</td>';
    	      msg += '</tr>'
    		  $('.message-table').append(msg);
    	  }
      })
    }
    
    
    
	
	window.addEventListener('load', fnConnectGlobalStompClient);
	fnGetNotificationList();
	fnRemoveMessageAlert();
	fnRemoveAllMessageNotify();
	fnDirectChatroom();
	fnGetLatestMessage();
  
</script>
  <footer class="main-footer">
    
  </footer>
<script src="${contextPath}/js/checkDrive.js?dt=${dt}"></script>

</body>
</html>