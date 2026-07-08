// 상수
const KR_ORDR_URL = '/api/dostk/ordr';  //국내주식URL
const US_ORDR_URL = '/api/us/ordr';     //미국주식URL

// 전역 변수
var AccessToken;
var ApiDomain;

/**
 * API요청 실행(공통)
 * @param {*} url 
 * @param {*} trid 
 * @param {*} data 
 * @param {*} cont_yn 
 * @param {*} next_key 
 * @returns 
 */
const doRequst = async (endpoint, trid, data, cont_yn, next_key) => {
    // header 데이터
    const headers = {
        'Content-Type': 'application/json;charset=UTF-8', // 컨텐츠 타입
        'authorization': `Bearer ${AccessToken}`, // 접근 토큰
        'cont-yn': cont_yn || 'N', // 연속 조회 여부
        'next-key': next_key || '', // 연속 조회 키
        'api-id': trid // TR명
    };

    try {
        console.log(data);

        // HTTP POST 요청
        const response = await fetch(ApiDomain + endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        // 응답 헤더
        const responseHeaders = {
            'next-key': response.headers.get('next-key'),
            'cont-yn': response.headers.get('cont-yn'),
            'api-id': response.headers.get('api-id')
        };
        
        // 응답 본문
        const responseBody = await response.json();

        // 응답 결과 출력
        // console.log('code :', response.status);
        // console.log('header :', JSON.stringify(responseHeaders, null, 4));
        // console.log('body :', JSON.stringify(responseBody, null, 4));

        return [responseHeaders, responseBody];
    } catch (error) {
        console.error('요청 실패:', error);
    }
}

/**
 * 서버 init: apiDomain설정과 토큰발급하여 전역 변수에 셋팅
 */
const init = async (apiDomain, appKey, secretKey) => {
    // API도메인 set
    ApiDomain = apiDomain;
    
    // 토큰발급
    try {
        const response = await fetch(ApiDomain + '/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json;charset=UTF-8' },
            body: JSON.stringify({
                "grant_type": "client_credentials",
                "appkey": appKey,
                "secretkey": secretKey
            })
        });
        
        const responseBody = await response.json();

        if(responseBody.return_code === 0) {
            AccessToken = responseBody.token;   // 토큰 set
        } else {
            console.log('body :', JSON.stringify(responseBody, null, 4));
            throw new Error();
        }
    } catch(e) {
        throw new Error('토큰 발급 실패');
    }
}

/**
 * 국내주식 매수 주문
 */
const krOrdByu = (data) => {
    let trid = 'kt10000';
    doRequst(KR_ORDR_URL, trid, data).then((res) => {
        const resHeader = res[0];
        const resBody = res[1];
        console.log(resBody);
    }).catch(console.log);
};

/**
 * 국내주식 매도 주문
 */
const krOrdSell = (data) => {
    let trid = 'kt10001';
    doRequst(KR_ORDR_URL, trid, data).then((res) => {
        const resHeader = res[0];
        const resBody = res[1];
        console.log(resBody);
    }).catch(console.log);
};

/**
 * 미국주식 매수 주문
 */
const usOrdByu = (data) => {
    let trid = 'ust20000';
    doRequst(US_ORDR_URL, trid, data).then((res) => {
        const resHeader = res[0];
        const resBody = res[1];
        console.log(resBody);
    }).catch(console.log);
};

/**
 * 미국주식 매도 주문
 */
const usOrdSell = (data) => {
    let trid = 'ust20001';
    doRequst(US_ORDR_URL, trid, data).then((res) => {
        const resHeader = res[0];
        const resBody = res[1];
        console.log(resBody);
    }).catch(console.log);
};

module.exports = {
    init,
    krOrdByu,
    krOrdSell,
    usOrdByu,
    usOrdSell
};