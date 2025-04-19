
let stompClient = null;

// 기존 채팅방 번호 및 타입(1:1 혹은 단체) 저장
// 새 채팅방 접속 시 기존 연결 끊기 위함.
let currentChatroomNo = null;
let currentChatroomType = null;

// 페이징
let page = 1;
let chatMessageTotalPage = 0;
let gChatroomNo = 0; // 페이지 별로 메시지 데이터 조회할 때 현 채팅방 번호 필요


let gPreviousDate = null;

moment.locale('ko');

// jvectorMap 이벤트 제거
$(document).ready(function() {
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
	}
});

// 직원 목록 & 채팅 목록 조회
const fnShowChatList = () => {

	let title = $('.chat-member-title');
	let memberIcon = $('.box-title-choice i');
	let chatMemberContainer = $('.chat-member');
	let addChatroomBtn = $('.addChatroomBtn-cover');

	memberIcon.eq(0).on('click', () => {

		addChatroomBtn.css('display', '');
		chatMemberContainer.empty();

		memberIcon.eq(1).removeClass('selected-icon');
		memberIcon.eq(0).addClass('selected-icon');

		title.text('직원 목록');

		$('.chat-member .chat-member-title').remove();

		$('.searchInput-cover').remove();
		$('.chat-member #memberArea').remove();
		fnGetChatUserList();

	});

	memberIcon.eq(1).on('click', () => {

		addChatroomBtn.css('display', 'none');
		chatMemberContainer.empty();

		memberIcon.eq(0).removeClass('selected-icon');
		memberIcon.eq(1).addClass('selected-icon');

		$('.searchInput-cover').remove();
		title.text('채팅 목록');

		chatMemberContainer.append('<ul class="contacts-list"></ul>');

		fnGetChatList(currentEmployeeNo);
	});

}

// 직원 리스트 가져오기
const fnGetChatUserList = () => {

	$('.chat-member-title').after('<div class="searchInput-cover"></div>');
	$('.searchInput-cover').append('<input type="text" class="searchInput" placeholder="직원 검색">');
	$('.chat-member').append('<div id="memberArea"></div>');

	fetch('/user/getUserList.do',{
		method: 'GET',
	})
	.then((response) => response.json())
	.then(resData => {

		// 빈 배열 생성
		let jstreeData = [];
		
		// 부서 조회
		let departments = resData.departments;
		
		// 직원 조회
		let employees = resData.employee;

		// Academix root node로 추가하기
		// root node는 부모 id가 #이어야 함.
		let com = departments.find(depart => depart.departName === 'Academix');
		if(com) {
			jstreeData.push({
				id: com.departmentNo,
				parent: '#',
				text: com.departName,
				icon: "fa fa-building"
			});
		}

		// 직원데이터에서 대표이사만 빼서 추가
		let ceo = employees.find(employee => employee.rank.rankTitle === '대표이사');
		if(ceo) {
			jstreeData.push({
				id: 'emp_' + ceo.employeeNo,
				parent: '0',
				text: ceo.name + ' ' + ceo.rank.rankTitle,
				icon: "fa fa-star"
			});
		}

		// 부서 돌면서 추가해주기(이때 회사명 제외)
		departments.forEach(function(department) {
			if(department.departName !== 'Academix'){
				jstreeData.push({
					id: department.departmentNo.toString(),
					parent: department.parentDepartNo.toString(),
					text: department.departName,
					icon: "fa fa-dot-circle-o"
				});
			}
		});

		// 직원 돌면서 추가
		employees.forEach(function(employee) {
			if(employee.depart.departmentNo !== 0 && employee.employeeStatus !== 0){ // 부서번호가 0이 아니고, 재직중인 직원만
				if(employee.rank.rankNo === 5) { // 직급이 5인 경우는 강사이므로 icon 다르게
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

		
		$('#memberArea').jstree({
		'core': {
			'data': jstreeData, // 트리에 들어갈 데이터 지정
			'themes': {
				'icons': true // 아이콘 보이게
			}
		},
		'plugins': ['search', 'checkbox'], // 트리 내에서 검색 가능하게끔 search, checkbox는 각 노드옆에 표시하게
		'checkbox': {
			'keep_selected_style': true, // 체크된 노드에 스타일 유지
			'three_state': false, // 자식 체크 시 부모 자동으로 체크되지 않게 함.
			'whole_node' : false, // 체크박스를 눌러야 체크됨.(텍스트 클릭시 X)
			'tie_selection' : false, // 체크 상태 & 선택 상태 분리
			'cascade': 'down' // 부모 체크 시 자식 노드 자동 체크(위로는 안감)
		}
		}).on('ready.jstree', function() {
			$(this).jstree(true).open_all(); // 처음부터 조직도 다 보이도록
		});

		// 검색 설정
		$('.searchInput').on('keyup', function() { 
			let searchString = $(this).val();
			$('#memberArea').jstree('search', searchString); // 검색 플러그인을 사용해서 검색어로 직원명 검색
		});

	})
	.catch(error => {
		console.error('직원 데이터 로드 중 에러가 발생하였습니다.', error);
	});

	fnGetProfile();
}

// 프로필 조회하기
const fnGetProfile = () => {

$('#memberArea').bind('select_node.jstree', function(event, data) {

	// 선택된 노드 가져온다.
	let selectedNode = data.node;
	let employeeNo;

	// 직원을 선택한 경우(emp로 시작함.)
	if(selectedNode.id.includes('emp_')) {
		employeeNo = selectedNode.id.replace('emp_', ''); // 선택한 직원번호 가져오기
	} else {
		return;
	}

	// 해당 직원 번호로 직원 프로필 조회
	fetch('/user/getUserProfileByNo.do?employeeNo=' + employeeNo,{
		method: 'GET',
	})
	.then((response) => response.json())
	.then(resData => {

		let employee = resData.employee;
		let profileImage = $('.chat-modal-profile > img');
		let selectedUserNo = $('.selectUserNo');

		if(employee.profilePicturePath !== null) {

			let profilePicturePath = '';
			if (employee.profilePicturePath) {
				const match = employee.profilePicturePath.match(/src="([^"]+)"/); // URL 부분만 추출한다.
				if (match && match[1]) {
					profilePicturePath = match[1]; // URL 부분만 저장
				}
			}

			profileImage.attr('src', profilePicturePath);
			profileImage.addClass('eemployee-profile');

		} else {
			profileImage.attr('src', '/resources/images/default_profile_image.png');
			profileImage.addClass('employee-default');
		}

		$('.chat-modal-profile > p').text(employee.name);
		$('.chat-modal-profile > span').text(employee.depart.departName);

		selectedUserNo.attr('data-user-no', employee.employeeNo);
		selectedUserNo.data('user-no', employee.employeeNo);

		$('#modal-default').modal('show');
	})
	.catch(error => {
		console.error('프로필 조회 중 문제가 발생하였습니다.', error);
	});
	});
}

// 채팅방 조회 및 생성(1:1)
const fnAddChatRoom = () => {

	$('.btn-oneToOneChat > i').on('click', () => {

		$('.chat-memberProfileList').empty();
		page = 1;
		chatMessageTotalPage = 0;

		let chatUserNo = $('.selectUserNo').data('user-no');

		if(currentEmployeeNo === chatUserNo) { // 자기자신 선택하면.
			return;
		}

		// 선택한 직원과의 1:1 채팅방이 존재하는지
		fetch('/chatting/isOneToOneChatroomExits.do?loginUserNo=' + currentEmployeeNo + '&chatUserNo=' + chatUserNo,{
			method: 'GET',
		})
		.then((response) => response.json())
		.then(resData => {

			if(resData.chatroom.chatroomNo === 0) { // 채팅방 번호가 0이면 채팅방 존재 X -> 새로 만든다!
				fetch('/chatting/insertNewOneToOneChatroom.do', {
					method: 'POST',
					headers: {
					"Content-Type": "application/json",
					},
					body: JSON.stringify({ // 현재 로그인한 유저의 번호와 선택한 직원 번호
						loginUserNo: currentEmployeeNo,
						chatUserNo: chatUserNo
					})
				})
				.then((response) => response.json())
				.then(resData => {

					gChatroomNo = resData.chatroom.chatroomNo;

					if(resData.insertOneToOneCount === 1) { // 방 생성 성공한 경우

						let employeeList = [currentEmployeeNo, chatUserNo]; // 1:1 이니까 상대직원번호, 현재 로그인한 유저 번호
						let chatBox = $('.chat-body');

						fetchSenderUserData(employeeList);
						fnOpenChatroom(resData.chatroom); // 채팅방 열기
						chatBox.scrollTop(chatBox.prop('scrollHeight')); // 스크롤 맨 아래로 세팅

					} else {
						alert('새로고침 해주세요..1:1 방 만들기 실패');
					}
				})

			} else { // 기존 채팅방 존재하는 경우

				gChatroomNo = resData.chatroom.chatroomNo;
				let employeeList = [currentEmployeeNo, chatUserNo];

				fetchSenderUserData(employeeList); // 채팅방 유저 데이터 가져와서 미리 세팅
				fnOpenChatroom(resData.chatroom); // 채팅방 열기
			}
		})
		.catch(error => {
			console.error('1:1 채팅방 생성 실패:', error);
		});
	});
}

// STOMP 연결
const fnConnect = (chatroomType) => {

	let employeeNo = currentEmployeeNo;

	// /ws-stomp : 서버에서 웹소켓 연결 처리하는 url
	// employeeNo : employeeNo로 식별한다.
	let socket = new SockJS("/ws-stomp?employeeNo=" + employeeNo);

	// SockJS 객체를 STOMP에서 사용할 기본 소켓으로 설정한다.
	// stompClient는 SockJS를 통해서 서버와 통신한다.
	stompClient = Stomp.over(socket);

	if (!stompClient.subscriptionPaths) { // stompClient안에 구독하고 있는 경로가 없는 경우,
		stompClient.subscriptionPaths = {}; // 빈 객체로 초기화한다.
	}

	stompClient.connect({}, (frame) => { // STOMP 서버에 연결 시도

		let chatroomNo = $('.chat-box-title').data('chatroom-no'); // 채팅방 번호

		// 연결 끊을 때 사용할 채팅방 번호와 타입 저장
		currentChatroomNo = chatroomNo;
		currentChatroomType = chatroomType;

		// 채팅 메시지 내역 조회
		fnGetChatMessage(chatroomNo);

		// 구독 경로 정리
		const subscriptionPath = chatroomType === 'OneToOne' ? '/queue/' + chatroomNo : '/topic/' + chatroomNo;

		// stompClient.subscribe(메시지 수신 위치(구독 경로), 콜백 함수)
		const subscription = stompClient.subscribe(subscriptionPath, (chatroomMessage) => { // chatroomMessage는 서버에서 전송된 메시지 객체

			// 메시지 도착하면 메시지 내용 JSON으로 파싱
			const message = JSON.parse(chatroomMessage.body);

			// 메시지 type에 따라서...
			if (message.messageType === 'UPDATE') { // update인 경우, 상태 관리 업데이트
				fnUpdateParticipateStatus(message);
			} else { // ADD, CHAT, LEAVE, JOIN인 경우 메시지 표시
				fnShowChatMessage(message);
			}
		});

		// subscriptionPath를 key로 해서 subscription 객체를 값으로 저장한다.
		// 이 때 저장되는 subscription는 stompClient.subscribe() 메소드가 반환한 subscription 객체이다.
			// 구독 ID, 구독 경로, 콜백 함수, unsubscribe() 메소드(구독 취소)
		stompClient.subscriptionPaths[subscriptionPath] = subscription;

		// sendPath는 클라이언트 -> 서버로 메시지 보내는 경로
		setTimeout(() => {

			// 1:1이면 /send/one, 단체채팅이면 /send/group으로 메시지 전송
			const sendPath = chatroomType === 'OneToOne' ? '/send/one/' + chatroomNo : '/send/group/' + chatroomNo;

			// sendPath 경로로 지정해서 chatroomNo, messageType, messageContent, senderNo
			stompClient.send(sendPath, {},
				JSON.stringify({
					'chatroomNo': chatroomNo,
					'messageType': 'UPDATE',
					'messageContent': '1',
					'senderNo': currentEmployeeNo
				})
			);
		}, 500);
	}, (error) => {
		console.error('STOMP 연결 오류:', error);
	});
};

const fnDisconnect = (chatroomType, chatroomNo) => {

	if (stompClient !== null) { // stompClient 객체 있을 경우에만

		// 1:1 채팅인 경우 type = OneToONe, /queue/chatroomNo
		// 단체 채팅인 경우 type = Group, /topic/chatroomNo
		const subscriptionPath = chatroomType === 'OneToOne' ? '/queue/' + chatroomNo : '/topic/' + chatroomNo;

		if (stompClient.subscriptionPaths && stompClient.subscriptionPaths[subscriptionPath]) {
			stompClient.subscriptionPaths[subscriptionPath].unsubscribe(); // 구독 취소

			// delete 연산자는 JS에서 객체의 속성을 삭제하는 데 사용한다.
			// 이때 subscriptionPath 객체에 null 혹은 undefined를 할당하는 것이 아닌 객체 자체를 삭제한다.
			delete stompClient.subscriptionPaths[subscriptionPath];
		}

		// sendPath = 1:1이면 /send/one, 채팅이면 /send/group으로 퇴장 메시지 전송
		const sendPath = chatroomType === 'OneToOne' ? '/send/one/' + chatroomNo : '/send/group/' + chatroomNo;

		// 채팅방 껐으므로 접속 상태 0으로 변경
		stompClient.send(sendPath, {},
			JSON.stringify({
				'chatroomNo': chatroomNo,
				'messageType': 'UPDATE',
				'messageContent': '0',
				'senderNo': currentEmployeeNo
			})
		);

		stompClient.disconnect(() => {
			console.log('WebSocket 연결이 해제되었습니다.');
		});
	}
};

window.addEventListener('beforeunload', function(event) {
	fnDisconnect(currentChatroomType, currentChatroomNo);
});

// 메시지 전송
const fnSendChat = () => {

	let chatMessageInput = $('.chat-message-input');
	let chatBoxTitle = $('.chat-box-title');

	if(chatMessageInput.val() !== '' && chatMessageInput.val().trim() !== '') {

		let employeeNo = currentEmployeeNo;

		let chatroomNo = chatBoxTitle.data('chatroom-no');
		let chatroomType = chatBoxTitle.data('chatroom-type');

		// 채팅방 접속 안하고 있는 직원 번호 리스트 - 알림메시지 보내주기
		let offlineEmployeeNoList = [];
		// let employeeNoList = [];

		 // 오프라인 상태의 직원 번호를 리스트에 담는다.
		$('.participate_statusList td.status.offline').each(function() {
			let employeeNo = $(this).closest('tr').find('td[data-employee-no]').data('employee-no');
			offlineEmployeeNoList.push(employeeNo);
		});

		//
		// $('.chat-memberProfileList input').each(function() {
		// 	let employeeNo = $(this).data('employee-no');
		// 	if (offlineEmployeeNoList.includes(employeeNo)) {
		// 		employeeNoList.push(employeeNo);
		// 	}
		// });

		// 1:1 채팅 메시지 전송
		if(chatroomType === 'OneToOne') {

			stompClient.send("/send/one/" + chatroomNo, {},
			JSON.stringify({
				'chatroomNo': chatroomNo,
				'messageType': 'CHAT',
				'messageContent': chatMessageInput.val(),
				'senderNo': currentEmployeeNo
				// 'recipientNoList': employeeNoList
			}));

			stompClient.send("/send/notify", {}, JSON.stringify({
				'chatroomNo': chatroomNo,
				'messageContent': chatMessageInput.val(),
				'senderNo': employeeNo,
				'recipientNoList': offlineEmployeeNoList
			}));

			chatMessageInput.val('');

		} else { // 단체 채팅 메시지 전송

			stompClient.send("/send/group/" + chatroomNo, {},
			JSON.stringify({
				'chatroomNo': chatroomNo,
				'messageType': 'CHAT',
				'messageContent': chatMessageInput.val(),
				'senderNo': currentEmployeeNo
				// 'recipientNoList': employeeNoList
			}));

			stompClient.send("/send/notify", {}, JSON.stringify({
				'chatroomNo': chatroomNo,
				'messageContent': chatMessageInput.val(),
				'senderNo': employeeNo,
				'recipientNoList': offlineEmployeeNoList
			}));

			chatMessageInput.val('');
		}
	}
}

// 전송 버튼 클릭 시 메시지 전송
$('.chatMessage-btn').on('click', () => {
	fnSendChat();
});

// 엔터 클릭 이벤트 걸기
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

// 직원 번호로 프론트에서 직원 데이터 조회
const getEmployeeData = (employeeNo) => {

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
		return null;
	}
};

// 전송자 번호 및 내가 보낸 번호로 직원 데이터 조회
const fetchSenderUserData = (senderNoList) => {
	return fetch('/user/getUserProfileListByNo.do', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({employeeNoList: senderNoList})
	})
	.then((response) => response.json())
	.then(resData => {

		let employeeList = resData.employeeList;
		$('.chat-memberProfileList').empty();

		employeeList.forEach(resData => {
			let profilePicturePath = '';

			if (resData.profilePicturePath) {
				const match = resData.profilePicturePath.match(/src="([^"]+)"/);
				if (match && match[1]) {
					profilePicturePath = match[1]; // 이미지 url만 추출
				}
			}
			let hiddenInputHTML = '<input type="hidden" data-employee-no="' + resData.employeeNo + '" data-employee-name="' + resData.name + ' ' + resData.rank.rankTitle + '" data-employee-profilePicturePath="' + profilePicturePath + '">';
			let chatMemberProfileList = $('.chat-memberProfileList');

		if (chatMemberProfileList.length) {
			chatMemberProfileList.append(hiddenInputHTML);
		} else {
			console.error('유저 데이터 조회 실패');
		}
		})
	});
};

// 메시지 프로필 설정
const SetEmployeeMessageProfile = (chatMessageList, MessageReadStatusList) => {
	const messagePromises = chatMessageList.map(message => {

		return new Promise((resolve) => {

			moment.locale('ko');
			let messageHTML = '';

			if(message.messageType === 'JOIN') {
				messageHTML += '<div class="joinChatMessage">' + message.messageContent + '</div>';
			} else if(message.messageType === 'CHAT'){

				if(message.senderNo === currentEmployeeNo) {

					const senderData = getEmployeeData(message.senderNo);

					if(senderData) {

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
					const senderData = getEmployeeData(message.senderNo);

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

					} else {

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
				messageHTML += '<div class="leaveChatMessage">' + message.messageContent + '</div>';
			} else {
				messageHTML += '<div class="AddChatMessage">' + message.messageContent + '</div>';
			}
			resolve({
				sendDt: message.sendDt,
				html: messageHTML
			});
		});
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

			if(page === 1) {
			  const chatBox = $('.chat-body');
			  chatBox.scrollTop(chatBox.prop('scrollHeight'));
			}
		})
		.catch(error => {
			console.error('메시지 프로필 설정 중 문제가 발생하였습니다.', error);
		});
};