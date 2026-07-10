const common = require('./common.js');

const KR_ORDR_URL = '/api/dostk/ordr';  //국내주식 주문URL
const US_ORDR_URL = '/api/us/ordr';     //미국주식 주문URL

var AccessToken; // 키움 REST API토큰
var ApiDomain;  // 키움 REST API도메인
var DiscordWebhookUrl;   // 매수/매도 주문 결과 알람 메시지 전송을 윈한 디스코드 웹훅URL

/**
 * init: 키움 REST API토큰 발급하여 설정하고 .env정보 전역 변수로 설정(서버 시작 시 한번만 실행 됨)
 */
const init = async (apiDomain, appKey, secretKey, discordWebhookUrl) => {
    ApiDomain = apiDomain;
    DiscordWebhookUrl = discordWebhookUrl;
    
    // 키움 REST API토큰발급
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
            AccessToken = responseBody.token;
        } else {
            console.log('body :', JSON.stringify(responseBody, null, 4));
            throw new Error();
        }
    } catch(e) {
        throw new Error('토큰 발급 실패');
    }
}

/**
 * 키움 REST API호출(공통)
 * @param {*} endpoint 
 * @param {*} trid 
 * @param {*} data 
 * @param {*} contYn 
 * @param {*} nextKey 
 */
const callApi = async (endpoint, trid, data, contYn, nextKey) => {
    return await common.doRequest(AccessToken, ApiDomain + endpoint, trid, data, contYn, nextKey);
}

/**
 * 디스코드 알람 전송(공통)
 * @param {*} msg 
 */
const sendDiscordWebhookMsg = async (msg) => {
    // DiscordWebhookUrl이 설정된 경우만 전송
    if(DiscordWebhookUrl) {
        await common.sendAlarmMsg(DiscordWebhookUrl, msg);
    }
}


/**
 * 국내주식 매수 주문
 */
const krOrdByu = (data) => {
    let trid = 'kt10000';
    callApi(KR_ORDR_URL, trid, data).then((res) => {
        const resHeader = res[0];
        const resBody = res[1];
        // console.log(resBody);
        sendDiscordWebhookMsg(JSON.stringify(resBody));
    }).catch(console.log);
};

/**
 * 국내주식 매도 주문
 */
const krOrdSell = (data) => {
    let trid = 'kt10001';
    callApi(KR_ORDR_URL, trid, data).then((res) => {
        const resHeader = res[0];
        const resBody = res[1];
        // console.log(resBody);
        sendDiscordWebhookMsg(JSON.stringify(resBody));
    }).catch(console.log);
};

/**
 * 미국주식 매수 주문
 */
const usOrdByu = (data) => {
    let trid = 'ust20000';
    callApi(US_ORDR_URL, trid, data).then((res) => {
        const resHeader = res[0];
        const resBody = res[1];
        // console.log(resBody);
        sendDiscordWebhookMsg(JSON.stringify(resBody));
    }).catch(console.log);
};

/**
 * 미국주식 매도 주문
 */
const usOrdSell = (data) => {
    let trid = 'ust20001';
    callApi(US_ORDR_URL, trid, data).then((res) => {
        const resHeader = res[0];
        const resBody = res[1];
        // console.log(resBody);
        sendDiscordWebhookMsg(JSON.stringify(resBody));
    }).catch(console.log);
};

module.exports = {
    init,
    krOrdByu,
    krOrdSell,
    usOrdByu,
    usOrdSell
};