
let stompClient = null;
let currentChatroomNo = null;
let currentChatroomType = null;

let page = 1;
let chatMessageTotalPage = 0;
let gChatroomNo = 0;

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
	let searchInput = $('.searchInput-cover');

	memberIcon.eq(0).on('click', () => {

		addChatroomBtn.css('display', '');
		chatMemberContainer.empty();

		memberIcon.eq(1).removeClass('selected-icon');
		memberIcon.eq(0).addClass('selected-icon');

		title.text('직원 목록');

		$('.chat-member .chat-member-title').remove();

		searchInput.remove();
		$('.chat-member #memberArea').remove();
		fnGetChatUserList();

	});

	memberIcon.eq(1).on('click', () => {

		addChatroomBtn.css('display', 'none');
		chatMemberContainer.empty();

		memberIcon.eq(0).css('color', '#B5B5B5');
		memberIcon.eq(1).css('color', 'black');

		searchInput.remove();
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

		let jstreeData = [];
		let departments = resData.departments;
		let employees = resData.employee;

		let com = departments.find(depart => depart.departName === 'Academix');
		if(com) {
			jstreeData.push({
				id: com.departmentNo,
				parent: '#',
				text: com.departName,
				icon: "fa fa-building"
			});
		}

		let ceo = employees.find(employee => employee.rank.rankTitle === '대표이사');
		if(ceo) {
			jstreeData.push({
				id: 'emp_' + ceo.employeeNo,
				parent: '0',
				text: ceo.name + ' ' + ceo.rank.rankTitle,
				icon: "fa fa-star"
			});
		}

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

		employees.forEach(function(employee) {
			if(employee.depart.departmentNo !== 0 && employee.employeeStatus !== 0){
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
		});

		$('.searchInput').on('keyup', function() {
			let searchString = $(this).val();
			$('#memberArea').jstree('search', searchString);
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

	let selectedNode = data.node;
	let employeeNo;

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

		let employee = resData.employee;
		let profileImage = $('.chat-modal-profile > img');
		let selectedUserNo = $('.selectUserNo');

		if(employee.profilePicturePath !== null) {

			let profilePicturePath = '';
			if (employee.profilePicturePath) {
				const match = employee.profilePicturePath.match(/src="([^"]+)"/);
				if (match && match[1]) {
					profilePicturePath = match[1];
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

		if(currentEmployeeNo === chatUserNo) {
			return;
		}

		fetch('/chatting/isOneToOneChatroomExits.do?loginUserNo=' + currentEmployeeNo + '&chatUserNo=' + chatUserNo,{
			method: 'GET',
		})
		.then((response) => response.json())
		.then(resData => {

			if(resData.chatroom.chatroomNo === 0) {
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

					gChatroomNo = resData.chatroom.chatroomNo;

					if(resData.insertOneToOneCount === 1) {

						let employeeList = [currentEmployeeNo, chatUserNo];
						let chatBox = $('.chat-body');

						fetchSenderUserData(employeeList);
						fnOpenChatroom(resData.chatroom);
						chatBox.scrollTop(chatBox.prop('scrollHeight'));

					} else {
						alert('새로고침 해주세요..1:1 방 만들기 실패');
					}
				})

			} else {

				gChatroomNo = resData.chatroom.chatroomNo;
				let employeeList = [currentEmployeeNo, chatUserNo];

				fetchSenderUserData(employeeList);
				fnOpenChatroom(resData.chatroom);
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
	let socket = new SockJS("/ws-stomp?employeeNo=" + employeeNo);

	stompClient = Stomp.over(socket);

	if (!stompClient.subscriptionPaths) {
		stompClient.subscriptionPaths = {};
	}

	stompClient.connect({}, (frame) => {

		let chatroomNo = $('.chat-box-title').data('chatroom-no');
		currentChatroomNo = chatroomNo;
		currentChatroomType = chatroomType;
		fnGetChatMessage(chatroomNo);

		const subscriptionPath = chatroomType === 'OneToOne' ? '/queue/' + chatroomNo : '/topic/' + chatroomNo;
		const subscription = stompClient.subscribe(subscriptionPath, (chatroomMessage) => {
			const message = JSON.parse(chatroomMessage.body);

			if (message.messageType === 'UPDATE') {
				fnUpdateParticipateStatus(message);
			} else {
				fnShowChatMessage(message);
			}
		});

		if (!stompClient.subscriptionPaths) {
			stompClient.subscriptionPaths = {};
		}
		stompClient.subscriptionPaths[subscriptionPath] = subscription;

		setTimeout(() => {
			const sendPath = chatroomType === 'OneToOne' ? '/send/one/' + chatroomNo : '/send/group/' + chatroomNo;

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

	if (stompClient !== null) {

		const subscriptionPath = chatroomType === 'OneToOne' ? '/queue/' + chatroomNo : '/topic/' + chatroomNo;

		if (stompClient.subscriptionPaths && stompClient.subscriptionPaths[subscriptionPath]) {
			stompClient.subscriptionPaths[subscriptionPath].unsubscribe();
			delete stompClient.subscriptionPaths[subscriptionPath];
		}

		const sendPath = chatroomType === 'OneToOne' ? '/send/one/' + chatroomNo : '/send/group/' + chatroomNo;

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
})

// 메시지 전송
const fnSendChat = () => {

	let chatMessageInput = $('.chat-message-input');
	let chatBoxTitle = $('.chat-box-title');

	if(chatMessageInput.val() !== '' && chatMessageInput.val().trim() !== '') {

		let employeeNo = currentEmployeeNo;

		let chatroomNo = chatBoxTitle.data('chatroom-no');
		let chatroomType = chatBoxTitle.data('chatroom-type');

		let offlineEmployeeNoList = [];
		let employeeNoList = [];

		$('.participate_statusList td.status.offline').each(function() {
			let employeeNo = $(this).closest('tr').find('td[data-employee-no]').data('employee-no');
			offlineEmployeeNoList.push(employeeNo);
		});

		$('.chat-memberProfileList input').each(function() {
			let employeeNo = $(this).data('employee-no');
			if (offlineEmployeeNoList.includes(employeeNo)) {
				employeeNoList.push(employeeNo);
			}
		});

		if(chatroomType === 'OneToOne') {

			stompClient.send("/send/one/" + chatroomNo, {},
			JSON.stringify({
				'chatroomNo': chatroomNo,
				'messageType': 'CHAT',
				'messageContent': chatMessageInput.val(),
				'senderNo': currentEmployeeNo,
				'recipientNoList': employeeNoList
			}));

			stompClient.send("/send/notify", {}, JSON.stringify({
				'chatroomNo': chatroomNo,
				'messageContent': chatMessageInput.val(),
				'senderNo': employeeNo,
				'recipientNoList': employeeNoList
			}));

			chatMessageInput.val('');

		} else {

			stompClient.send("/send/group/" + chatroomNo, {},
			JSON.stringify({
				'chatroomNo': chatroomNo,
				'messageType': 'CHAT',
				'messageContent': chatMessageInput.val(),
				'senderNo': currentEmployeeNo,
				'recipientNoList': employeeNoList
			}));

			stompClient.send("/send/notify", {}, JSON.stringify({
				'chatroomNo': chatroomNo,
				'messageContent': chatMessageInput.val(),
				'senderNo': employeeNo,
				'recipientNoList': employeeNoList
			}));

			chatMessageInput.val('');
		}
	}
}

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
					profilePicturePath = match[1];
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