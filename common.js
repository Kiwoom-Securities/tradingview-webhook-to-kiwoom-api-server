/**
 * API요청 실행
 * @param {*} url 
 * @param {*} trid 
 * @param {*} data 
 * @param {*} cont_yn 
 * @param {*} next_key 
 * @returns 
 */
const doRequest = async (token, url, trid, params, contYn, nextKey) => {
    // header 데이터
    const headers = {
        'Content-Type': 'application/json;charset=UTF-8', // 컨텐츠 타입
        'authorization': `Bearer ${token}`, // 접근 토큰
        'cont-yn': contYn || 'N', // 연속 조회 여부
        'next-key': nextKey || '', // 연속 조회 키
        'api-id': trid // TR명
    };

    try {
        // console.log(params);
        let strParams = JSON.stringify(params);
        log(` - 요청: ${strParams}`);

        // HTTP POST 요청
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: strParams
        });

        // 응답 헤더
        const responseHeaders = {
            'next-key': response.headers.get('next-key'),
            'cont-yn': response.headers.get('cont-yn'),
            'api-id': response.headers.get('api-id')
        };
        
        // 응답 본문
        const responseBody = await response.json();
        let strResBody = JSON.stringify(responseBody);
        log(` - 응답: ${strResBody}`);

        return [responseHeaders, responseBody];
    } catch (error) {
        console.error('요청 실패:', error);
    }
}

/**
 * 웹훅 알람 메시지 전송
 */
const sendAlarmMsg = async (webhookUrl, msg) => {
    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: msg })
        });

        if (response.ok) {
            // console.log('메시지 전송 성공!');
        } else {
            console.error('전송 실패 상태 코드:', response.status);
        }
    } catch (error) {
        console.error('네트워크 에러:', error);
    }
}

/**
 * 현재 가격에 맞는 KRX 호가 단위(Tick Size)를 반환
 * @param {*} price 
 * @returns 
 */
const getKrxTickSize = (price) => {
    if (price < 2000) return 1;
    if (price < 5000) return 5;
    if (price < 20000) return 10;
    if (price < 50000) return 50;
    if (price < 200000) return 100;
    if (price < 500000) return 500;
    return 1000;
}

/**
 * 수신된 가격을 정상 호가로 보정(반올림 기준)
 * @param {*} rawPrice 
 * @returns 
 */
const correctKrPrice = (rawPrice) => {
    const price = parseFloat(rawPrice);
    if (isNaN(price)) return rawPrice;

    const tickSize = getKrxTickSize(price);
    
    // 호가 단위에 맞춰 반올림 처리 (내림을 원하시면 Math.floor, 올림은 Math.ceil)
    return String(Math.round(price / tickSize) * tickSize);
}

/**
 * 현재 시간 날짜 텍스트(YYYY-MM-DD HH:mm:ss) 반환
 * @returns 
 */
const getCurTimeText = () => {
    const today = new Date(); 
    const year = today.getFullYear();    // 년도
    const month = (today.getMonth() + 1).toString().padStart(2, '0');   // 월
    const day = today.getDate().toString().padStart(2, '0'); // 일
    const hour = today.getHours().toString().padStart(2, '0');
    const min = today.getMinutes().toString().padStart(2, '0');
    const sec = today.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
}

/**
 * 로그
 * @param {*} trid 
 * @param {*} text 
 */
const log = (text) => {
    console.log(`${getCurTimeText()} => ${text}`);
}

module.exports = {
    doRequest,
    sendAlarmMsg,
    correctKrPrice,
    log
};