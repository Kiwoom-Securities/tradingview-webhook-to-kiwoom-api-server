require('dotenv').config();
const express = require('express');
const apiCaller = require('./api-caller.js');

const app = express();
const port = 8888;  // 웹훅 서버 포트

// .env 설정 값 가져오기
const API_DOMAIN = process.env.API_DOMAIN;
const APP_KEY = process.env.APP_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

// 트레이딩뷰가 text/plain으로 보낼 때를 대비한 텍스트 파싱 미들웨어
app.use(express.text({ type: '*/*' }));

/**
 * 웹훅 서버 start
 */
app.listen(port, () => {
    apiCaller.init(API_DOMAIN, APP_KEY, SECRET_KEY).then(() => {
        console.log('start! tradingview-webhook-to-kiwoom-api server on port 8888');
    }).catch(console.log);
});

/**
 * 트레이딩 뷰 웹훅 - 국내 주식 매수
 */
app.post('/kiwoom/webhook/kr/buy', (req, res) => {
    console.log('/kiwoom/webhook/kr/buy');
    // console.log(req.body);
    
    // 트레이딩 뷰 웹훅 알림 메시지 수신
    let tradingViewData = JSON.parse(req.body);
    let strCd = tradingViewData.strCd;  // 종목코드
    let ordUv = tradingViewData.close;  // 현재가
    let volume = tradingViewData.volume;  // 거래량

    // 키움 REST API로 주문 실행
    let data = {
        'dmst_stex_tp' : 'KRX', // KRX,NXT,SOR(모의투자는KRX)
        'stk_cd' : strCd,
        'ord_qty' : '1',    // 매수수량
        'ord_uv' : ordUv,
        'trde_tp' : '0',    //  0:보통 , 3:시장가 , 5:조건부지정가 , 81:장마감후시간외 , 61:장시작전시간외, 62:시간외단일가 , 6:최유리지정가 , 7:최우선지정가 , 10:보통(IOC) , 13:시장가(IOC) , 16:최유리(IOC) , 20:보통(FOK) , 23:시장가(FOK) , 26:최유리(FOK) , 28:스톱지정가,29:중간가,30:중간가(IOC),31:중간가(FOK)
        'cond_uv' : ''
    };
    apiCaller.krOrdByu(data);

    res.end();
});

/**
 * 트레이딩 뷰 웹훅 - 국내 주식 매도
 */
app.post('/kiwoom/webhook/kr/sell', (req, res) => {
    console.log('/kiwoom/webhook/kr/sell');
    // console.log(req.body);
    
    // 트레이딩 뷰 웹훅 알림 메시지 수신
    let tradingViewData = JSON.parse(req.body);
    let strCd = tradingViewData.strCd;  // 종목코드
    let ordUv = tradingViewData.close;  // 현재가
    let volume = tradingViewData.volume;  // 거래량

    // 키움 REST API로 주문 실행
    let data = {
        'dmst_stex_tp' : 'KRX', // KRX,NXT,SOR(모의투자는KRX)
        'stk_cd' : strCd,
        'ord_qty' : '1',    // 매도수량
        'ord_uv' : ordUv,
        'trde_tp' : '0',    // 0:보통 , 3:시장가 , 5:조건부지정가 , 81:장마감후시간외 , 61:장시작전시간외, 62:시간외단일가 , 6:최유리지정가 , 7:최우선지정가 , 10:보통(IOC) , 13:시장가(IOC) , 16:최유리(IOC) , 20:보통(FOK) , 23:시장가(FOK) , 26:최유리(FOK) , 28:스톱지정가,29:중간가,30:중간가(IOC),31:중간가(FOK)
        'cond_uv' : ''
    };
    apiCaller.krOrdSell(data);

    res.end();
});

/**
 * 트레이딩 뷰 웹훅 - 미국 주식 매수
 */
app.post('/kiwoom/webhook/us/buy', (req, res) => {
    console.log('/kiwoom/webhook/us/buy');
    // console.log(req.body);
    
    // 트레이딩 뷰 웹훅 알림 메시지 수신
    let tradingViewData = JSON.parse(req.body);
    let stexTp = tradingViewData.stexTp;  // 거래소구분
    let strCd = tradingViewData.strCd;  // 종목코드
    let ordUv = tradingViewData.close;  // 현재가
    let volume = tradingViewData.volume;  // 거래량

    // 키움 REST API로 주문 실행
    let data = {
        'stex_tp' : stexTp,   // NA: AMEX, ND: NASDAQ, NY: NYSE
        'stk_cd' : strCd,
        'ord_qty' : '1',    // 매수수량
        'ord_uv' : ordUv, // trde_tp가 00(지정가),30(LOC)...인 경우 필수 입력, 그 외 시장가 거래유형 설정 시 입력 값은 빈 값 처리
        'trde_tp' : '00'    // 00:지정가 03시장가 26:VWAP지정가 27:TWAP지정가 30:LOC 36:VWAP시장가 37:TWAP시장가
    };
    apiCaller.usOrdByu(data);

    res.end();
});

/**
 * 트레이딩 뷰 웹훅 - 미국 주식 매도
 */
app.post('/kiwoom/webhook/us/sell', (req, res) => {
    console.log('/kiwoom/webhook/us/sell');
    // console.log(req.body);
    
    // 트레이딩 뷰 웹훅 알림 메시지 수신
    let tradingViewData = JSON.parse(req.body);
    let stexTp = tradingViewData.stexTp;  // 거래소구분
    let strCd = tradingViewData.strCd;  // 종목코드
    let ordUv = tradingViewData.close;  // 현재가
    let volume = tradingViewData.volume;  // 거래량

    // 키움 REST API로 주문 실행
    let data = {
        'stk_cd' : strCd,  // NVDA
        'stex_tp' : stexTp,   // NA: AMEX, ND: NASDAQ, NY: NYSE
        'ord_qty' : '1',      // 매도수량
        'ord_uv' : ordUv, // trde_tp가 00(지정가),30(LOC)...인 경우 필수 입력, 그 외 시장가 거래유형 설정 시 입력 값은 빈 값 처리
        'stop_pric' : '',   // trde_tp가 34(STOP LIMIT) 또는 35(STOP)인 경우 필수 입력, 그 외 거래유형(지정가,시장가 등) 설정 시 입력 값은 무시되거나 빈 값처리.
        'trde_tp' : '00'    // 00:지정가 03시장가 26:VWAP지정가 27:TWAP지정가 30:LOC 33:MOC 36:VWAP시장가 37:TWAP시장가 35:STOP 34:STOP LIMIT
    };
    apiCaller.usOrdSell(data);

    res.end();
});
