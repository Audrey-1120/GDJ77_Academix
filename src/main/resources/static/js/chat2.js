	
// 채팅 내역 가져오기
const fnGetChatMessage = (chatroomNo) => {

	if(chatroomNo === undefined) {
		return;
	}

	fetch('/chatting/getChatMessageList.do?chatroomNo=' + chatroomNo + '&page=' + page, {
		method: 'GET',
	})
	.then((response) => response.json())
	.then(resData => {

		chatMessageTotalPage = resData.chatMessageTotalPage;
		const chatMessageList = resData.chatMessageList.reverse();

		if (chatMessageList.length > 0) {
			const latestMessage = chatMessageList[chatMessageList.length - 1];
			gPreviousDate = new Date(latestMessage.sendDt);
		} else {
			const today = new Date();
			gPreviousDate = today.toLocaleString();
		}

		if(chatMessageList.length > 0) {
			fnGetParticipantsNoList(chatMessageList[0].chatroomNo)
			.then(senderNoList => {

				if($('.chat-memberProfileList').find('input').length !== senderNoList.length) {
					fetchSenderUserData(senderNoList).then(() => {
						SetEmployeeMessageProfile(chatMessageList, resData.MessageReadStatusList);
						fnAddParticipateTab(chatroomNo);
					});
				} else {
					SetEmployeeMessageProfile(chatMessageList, resData.MessageReadStatusList);
					fnAddParticipateTab(chatroomNo);

				}
			});

		} else {
			fnAddParticipateTab(chatroomNo);
		}
	})
	.catch(error => {
		console.error('채팅 내역 조회 중 문제가 발생하였습니다.:', error);
	});
};
 	
// 채팅방 열기
const fnOpenChatroom = (chatroomDto) => {

	let chatBoxTitle = $('.chat-box-title');

	$('.chat-box').css('display', '');

	$('.chat-box-title > span:first').text(chatroomDto.chatroomTitle);

	chatBoxTitle.attr('data-chatroom-no', chatroomDto.chatroomNo);
	chatBoxTitle.data('chatroom-no', chatroomDto.chatroomNo);

	chatBoxTitle.attr('data-chatroom-type', chatroomDto.chatroomType);
	chatBoxTitle.data('chatroom-type', chatroomDto.chatroomType);

	$('#modal-default').modal('hide');

	let chatMessageBody = $('.chatMessage-body');
	chatMessageBody.empty();

	fnDisconnect(currentChatroomType, currentChatroomNo);
	fnConnect(chatroomDto.chatroomType);

}

 	
// 채팅 메시지 보기
const fnShowChatMessage = (chatMessage) => {

	if(chatMessage.messageType === 'CHAT') {
		if(chatMessage.senderNo === currentEmployeeNo) {

		const senderData = getEmployeeData(chatMessage.senderNo);

		if(senderData) {
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

			const senderData = getEmployeeData(chatMessage.senderNo);

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

	} else if(chatMessage.messageType === 'LEAVE') {

		let messageHTML = '';

		messageHTML += '<div class="leaveChatMessage">' + chatMessage.messageContent + '</div>';
		$('.chatMessage-body').append(messageHTML);
		$('.chat-box-title > span:nth-of-type(2)').text($('.chat-memberProfileList > input').length);

		let senderNo = chatMessage.senderNo;
		$('.participate_statusList employee-row').each(function() {
			const employeeNo = $(this).find('td[data-employee-no]').data('employee-no');
			if (employeeNo === senderNo) {
				$(this).remove();
			}
		});

	} else if(chatMessage.messageType === 'ADD') {

		let messageHTML = '';

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
	let timerId;
	$('.chat-body').on('scroll', () => {

		if (timerId) {
			clearTimeout(timerId);
		}
		timerId = setTimeout(() => {
			let scrollTop = $('.chat-body').scrollTop();
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

	let beforeChatroomNoList = $('.alert-menu > .notification-item').map(function() {
		return $(this).data('chatroom-no');
	}).get();

	let chatroomNoList = [...new Set(beforeChatroomNoList)];

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

		$('.chat-box-title > span:nth-of-type(2)').text(senderNoList.length);
		return senderNoList;
	})
}
		
// 채팅방목록에서 채팅방 클릭했을 때
const fnGochatroom = () => {

	$('.chat-member').on('click','.contacts-list-name',  (evt) => {

		page = 1;
		chatMessageTotalPage = 0;

		let $input = $(evt.target).find('input');
		let memberProfileList = $('.chat-memberProfileList');

		if(memberProfileList.find('input').length > 0) {
			memberProfileList.empty();
		}


		let title = $(evt.target).contents().filter(function() {
			return this.nodeType === Node.TEXT_NODE;
		}).text().trim();

		let chatroomDto = {
			chatroomNo: $input.data('chatroom-no'),
			creatorNo: $input.data('creator-no'),
			chatroomTitle: title,
			chatroomType: $input.data('chatroom-type'),
			chatroomCreatedDate: $input.data('chatroom-createddate'),
		};

		gChatroomNo = chatroomDto.chatroomNo;

		fnGetParticipantsNoList(chatroomDto.chatroomNo)
		.then(senderNoList => {
			fetchSenderUserData(senderNoList);
		});

		fnOpenChatroom(chatroomDto);

		fnUpdateChatroomSeenStatus(chatroomDto.chatroomNo)
		.then((response) => response.json())
		.then(resData => {

			if(resData.updateStatusCount !== 0) {
				$('ul.contacts-list li').each(function() {
					const $input = $(this).find('input[type="hidden"]');

					if ($input.data('chatroom-no') === chatroomDto.chatroomNo) {

						$(this).find('i').remove();

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

						const itemsToRemove = [];
						$('.menu.alert-menu .notification-item').each(function() {
							if ($(this).data('chatroom-no') === chatroomDto.chatroomNo) {
								itemsToRemove.push(this);
							}
						});
						itemsToRemove.forEach(function(item, index) {
							$(item).remove();
						});
					}
				});
			}
		});
	});
}
		
// 단체 채팅방 만들기
const fnAddNewGroupChatroom = () => {

	$('.addChatRoomBtn').on('click', () => {

		let checked_ids = $('#memberArea').jstree('get_checked', true);

		let filterResult = checked_ids.filter((node) => {
			return node.id.startsWith('emp_');
		});

		let myName = $('.hidden-xs').text();

		let checkedMemberText = filterResult
		.map((node) => {
			return node.text;
		})
		.filter((text) => {
			let namePart = text.split(' ')[0];
			return namePart !== myName;
		});

		let userNo = currentEmployeeNo;

		let checkedMemberNo = filterResult
		.map((node) => {
			return node.id.replace('emp_', '');
		})
		.filter((id) => {
			return id !== userNo.toString();
		});

		$('.selected-member-cover').empty();

		if(checkedMemberText.length === 0 || checkedMemberText.length < 2) {
			alert('직원을 한명 이상 선택해주세요.');

		} else {
			checkedMemberText.forEach((member) => {
				$('.selected-member-cover').append('<p>' + member + '</p>');
			});

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

					$('.newGroupChatroom-input').val('');
					$('.chat-memberProfileList').empty();

					const beforeEmployeeList = $('#hiddenList').val();
					const employeeList = JSON.parse(beforeEmployeeList).map(Number);
					const userEmployeeNo = Number(currentEmployeeNo);
					employeeList.push(userEmployeeNo);

					fetchSenderUserData(employeeList)
					.then(() => {

						page = 1;
						chatMessageTotalPage = 0;
						gChatroomNo = resData.chatroom.chatroomNo;

						fnOpenChatroom(resData.chatroom);

						const chatBox = $('.chat-body');
						chatBox.scrollTop(chatBox.prop('scrollHeight'));

					});

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

	fetch('/chatting/getChatroomParticipantList.do?chatroomNo=' + chatroomNo, {
		method: 'GET',
	})
	.then((response) => response.json())
	.then(resData => {

		$('.participate_statusList tbody').empty();

		let statusMap = {};
		$.each(resData.employeeNoList, function(index, item) {
			statusMap[item.participantNo] = item.participateStatus;
		});

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
		});
	});
}
		
		
// 상태 관리 함수
const fnUpdateParticipateStatus = (chatroomMessage) => {

	let statusCode = chatroomMessage.messageContent;
	let employeeNo = chatroomMessage.senderNo;

	let status = statusCode === '1' ? '온라인' : '오프라인';
	let statusClass = statusCode === '1' ? 'online' : 'offline';

	let $employeeTd = $('td[data-employee-no="' + employeeNo + '"]');

	if ($employeeTd.length) {
		let $statusTd = $employeeTd.siblings('.status');
		$statusTd.removeClass('online offline').addClass(statusClass).text(status);
	}
}
		

// 채팅방 나가기
const fnExitChatroom = () => {

	$('.leave-chat').on('click', () => {

		let chatroomNo = $('.chat-box-title').data('chatroom-no');
		let participantNo = currentEmployeeNo;

		fetch('/chatting/deleteParticipant.do?chatroomNo=' + chatroomNo + '&participantNo=' + participantNo, {
			method: 'delete',
			headers: {
			'Content-Type': 'application/json',
			},
		})
		.then((response) => response.json())
		.then(resData => {

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
					'senderNo': currentEmployeeNo,
					})
				);

				$('.chat-box').css('display', 'none');

				fnDisconnect(chatroomType, chatroomNo);
				fnUpdateChatroomSeenStatus(chatroomNo);
				fnGetChatList(currentEmployeeNo);

			} else {
			alert('채팅방 나가기에 실패했습니다 ㅜ');
			}
		})
		.catch(error => {
		console.error('delete 요청 에러: ' + error);
		})
	})
}
 		
// 쿼리 파라미터 조회
const getQueryParams = () => {
	const params = {};
	window.location.search.slice(1).split('&').forEach(param => {
		const [key, value] = param.split('=');
		params[key] = decodeURIComponent(value);
	});
	return params;
}
    
// 쿼리 파라미터에 따라 값이 있을 경우 채팅방 데이터 조회
window.onload = () => {

	const params = getQueryParams();
	if (params.chatroomNo) {

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

			fnOpenChatroom(resData.chatroom);
		});
	}
};
 
// 채팅방 이름 수정 모달 표시
const fnUpdateChatroomTitleModal = () => {
	$('.modify-chatTitle').on('click', () => {
		let chatroomTitle = $('.chat-box-title > span:first').text();
		let chatroomNo = $('.chat-box-title').data('chatroom-no');
		let newChatroomTitleInput = $('.newChatroomTitle-input');

		newChatroomTitleInput.val(chatroomTitle);
		newChatroomTitleInput.after('<input type="hidden" class="chatroomNo" data-chatroom-no="' + chatroomNo + '" placeholder="채팅방 이름을 작성해주세요"');

		$('#modal-default3').modal('show');
		fnUpdateChatroomTitle();
	})
}
    
// 채팅방 이름 수정
const fnUpdateChatroomTitle = () => {

	$('.btn-modifyChatroomTitle').on('click', () => {

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

				$('.chat-box-title > span:first').text(chatroomTitle);
				$('.newChatroomTitle-input').val('');
				$('#modal-default3').modal('hide');

				$('.chatroom-info').each(function() {
					let chatroomListNo = $(this).data('chatroom-no');

					if (chatroomListNo === chatroomNo) {
						var parentElement = $(this).parent();
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

			let jstreeData = [];
			let selectedAddMember = $('.selected-addMember-cover');
			let departments = resData.departments;
			let employees = resData.employee;

			if(selectedAddMember.jstree(true)) {
				selectedAddMember.jstree('destroy').empty();
			}

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

			$('#modal-default4').modal('show');
			fnAddNewMember();

		})
		.catch(error => {
		console.error('채팅방 새 인원 초대 중 문제가 발생하였습니다.', error);
		});
	})
}
   
// 채팅방 멤버 초대
const fnAddNewMember = () => {

	$('.btn-addNewMember').off('click').on('click', () => {

		let employeeNoList = [];
		$('.chat-memberProfileList input[type="hidden"]').each(function() {
			employeeNoList.push($(this).data('employee-no').toString());
		});

		let checked_ids = $('.selected-addMember-cover').jstree('get_checked', true);
		let filterResult = checked_ids.filter((node) => {
			return node.id.startsWith('emp_');
		});

		let checkedMemberNo = [...new Set(filterResult.map((node) => node.id.replace('emp_', '')))];
		let alreadyInList = checkedMemberNo.some((memberNo) => employeeNoList.includes(memberNo));

		if (alreadyInList) {

			alert('채팅방에 이미 참여중인 직원은 선택할 수 없습니다.');
			return;

		} else {

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

				let employeeList = resData.insertNewParticipate.participantList;

				employeeList.forEach(resData => {

					let profilePicturePath = '';
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
						console.error('채팅방 멤버 초대 중 문제가 발생하였습니다.');
					}
				});

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

				$('.chat-box-title > span:nth-of-type(2)').text($('.chat-memberProfileList > input').length);
				$('#modal-default4').modal('hide');
			}
			});
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