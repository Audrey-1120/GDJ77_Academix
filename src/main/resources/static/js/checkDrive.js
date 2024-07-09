/***********************************************************
 * 파일명 : checkDrive.js
 * 설  명 : 드라이브 유무 확인 + 드라이브 생성 JavaScript
 *
 * 수정일      수정자  Version   Function 명
 * -------------------------------------------
 * 2024.06.03  장윤수  1.0       fnCheckDrive
 * 2024.06.04  장윤수  1.1       fnCreateDrive
 * 2024.06.05  장윤수  1.2       완성
 ***********************************************************/

// 전역변수
var employeeNo = document.querySelector('input[name="employeeNo"]').value;

/*************************************************
 * 함수명 : fnCheckDrive
 * 설  명 : 드라이브 유무 확인
 * 인  자 : 없음
 * 사용법 : fnCheckDrive()
 * 작성일 : 2024.06.03
 * 작성자 : 장윤수
 *
 * 수정일      수정자  수정내용
 * --------------------------------
 * 2024.06.03  장윤수  드라이브 유무 확인
 *************************************************/
const fnCheckDrive = () => {
  fetch(fnGetContextPath() + '/drive/checkDrive.do?employeeNo=' + employeeNo)
  .then(response => response.json())
  .then(resData => {
    if(resData.exists) {
      window.location.href = fnGetContextPath() + '/drive/main.page';
    } else {
      if(confirm('사용 중인 드라이브가 없습니다. 드라이브를 새로 만드시겠습니까?')) {
        fnCreateDrive();
      }
    }
  })
  .catch(error => {
    alert('드라이브 확인 중 오류가 발생했습니다.');
  });
}

/*************************************************
 * 함수명 : fnCreateDrive
 * 설  명 : 드라이브 생성
 * 인  자 : 없음
 * 사용법 : fnCreateDrive()
 * 작성일 : 2024.06.03
 * 작성자 : 장윤수
 *
 * 수정일      수정자  수정내용
 * --------------------------------
 * 2024.06.03  장윤수  드라이브 유무 확인
 * 2024.06.04  장윤수  .then 위치 수정
 *************************************************/
const fnCreateDrive = () => {
  let folderName = 'drive';
  
  fetch(fnGetContextPath() + '/drive/createDrive.do', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'folderName': folderName,
      'ownerNo': employeeNo,
    })
  })
  .then(response => response.json())
  .then(resData => {
    if(resData.insertCount === 1) {
      alert('드라이브가 생성되었습니다.');
      window.location.href = fnGetContextPath() + '/drive/main.page';
    } else {
      alert('드라이브 생성 실패했습니다.');
    }
  })
  .catch(error => {
    alert('드라이브 생성 중 오류가 발생했습니다.');
  })
}


// 함수 호출 및 이벤트
document.querySelector('.drive a').addEventListener('click', (evt) => {
  evt.preventDefault();
  fnCheckDrive();
});
