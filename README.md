# TradingView Webhook - 키움증권 자동 주문 서버

트레이딩뷰(TradingView) 차트의 **웹훅(Webhook)** 기능을 활용하여 **키움증권 REST API**로 자동 주문을 실행하는 로컬 서버입니다.

---

## 개요
이 프로젝트는 다음 흐름으로 동작합니다:
```
TradingView → Webhook → 로컬 서버 → Kiwoom REST API → 주문 실행
```
1. 트레이딩뷰에서 조건 발생
2. 웹훅으로 서버에 신호 전달
3. 서버가 키움 REST API 호출
4. 자동 매수/매도 실행

## 사전 요구사항

시작하기 전에 아래 항목들이 준비되어 있어야 합니다.

- 키움증권 REST API 사용 신청 완료
- IP 등록 및 APP 키 발급 완료
- 트레이딩뷰 계정

키움 REST API 신청: https://openapi.kiwoom.com/main/home

---

## 필수 프로그램 설치

| 프로그램 | 용도 |
|---|---|
| [Node.js](https://nodejs.org/) | 서버 실행 환경 |
| [Git](https://git-scm.com/) | 소스 코드 클론 |
| [VSCode](https://code.visualstudio.com/) | 코드 편집기 |

설치 확인:
```Bash
node -v
npm -v
git --version
```

---

## 설치 및 실행

### 1. 소스 코드 클론

```Bash
git clone https://github.com/Kiwoom-Securities/tradingview-webhook-to-kiwoom-api-server
```

### 2. 패키지 설치

```Bash
cd tradingview-webhook-to-kiwoom-api-server
npm install
npm install pm2 -g
```

### 3. 환경 설정 (`.env` 파일)

프로젝트 루트에 `.env` 파일에 내용을 입력합니다.

```env
API_DOMAIN= (수정 불필요)
API_KEY= (발급받은 App Key)
SECRET_KEY= (발급받은 Secret Key)

# 디스코드_웹훅_URL
DISCORD_WEBHOOK_URL= (선택)

# 서버 포트
PORT=10080
```

### 4. 서버 실행

**개발 모드 (로컬 테스트용)**

```Bash
npm run local
```

**프로덕션 모드 (pm2 사용)**

```Bash
pm2 start index.js
```

---

## ngrok 외부 접근 설정

로컬 서버를 트레이딩뷰 웹훅에서 접근할 수 있도록 ngrok으로 외부 URL을 생성합니다.
> ngrok홈페이지를 통해 authtoken을 발급 및 ngrok.exe파일을 다운로드 후 실행해야 합니다.

```ngrok 터미널
ngrok config add-authtoken <YOUR_TOKEN>
ngrok http 10080
```

실행 후 출력되는 **Forwarding 주소** (예: `https://xxxx-xx-xx-xxx-xx.ngrok-free.dev`)를 복사해 두세요.

---

## 디스코드 알림 설정 (선택)

주문 체결 결과를 디스코드로 받으려면 디스코드 채널의 웹훅 URL을 `.env` 파일의 `DISCORD_WEBHOOK_URL`에 입력합니다.

1. 디스코드 채널 설정 > **연동** > **웹후크 만들기** > 새 웹후크 생성
2. 웹후크 URL 복사
3. `.env` 파일에 붙여넣기

---

## 트레이딩뷰 웹훅 설정

### 웹훅 URL

트레이딩뷰 알림(Alert) 설정에서 웹훅 URL을 아래 중 원하는 기능의 URL을 입력합니다.

| URL | 기능 |
|---|---|
| https://xxxx-xx-xx-xxx-xx.ngrok-free.dev/kiwoom/webhook/kr/buy | 국내 주식 매수 |
| https://xxxx-xx-xx-xxx-xx.ngrok-free.dev/kiwoom/webhook/kr/sell | 국내 주식 매도 |
| https://xxxx-xx-xx-xxx-xx.ngrok-free.dev/kiwoom/webhook/us/buy | 미국 주식 매수 |
| https://xxxx-xx-xx-xxx-xx.ngrok-free.dev/kiwoom/webhook/us/sell | 미국 주식 매도 |
| https://xxxx-xx-xx-xxx-xx.ngrok-free.dev/kiwoom/webhook/discord/msg/send | 디스코드 메시지 전송(주문x 알람용) |

### 주문 메시지 형식

트레이딩뷰 메시지 설정에서 JSON형식의 아래 메시지를 입력합니다. 
> {{ticker}}, {{close}}는 트레이딩뷰에서 제공되는 데이터 입니다.

**국내 주식 매수/매도**

```json
{ 
    "dmstStexTp": "KRX", 
    "strCd": "{{ticker}}", 
    "ordUv": "{{close}}", 
    "ordQty": "1", 
    "trdeTp": "0", 
    "condUv": "" 
} 
```
| 필드 | 설명 | 예시 |
|---|---|---|
| `dmstStexTp` | 국내거래소구분코드 | `KRX` / `NXT` / `SOR` (모의투자는 KRX만 가능) | 
| `strCd` | 종목 코드 | 
| `ordUv` | 매수/매도 가격 | 
| `ordQty` | 매수/매도 수량 | 
| `trdeTp` | 매매구분 | `0`:보통, `3`:시장가, `5`:조건부지정가, `81`:장마감후시간외, `61`:장시작전시간외, `62`:시간외단일가, `6`:최유리지정가, `7`:최우선지정가, `10`:보통(IOC), `13`:시장가(IOC), `16`:최유리(IOC), `20`:보통(FOK), `23`:시장가(FOK), `26`:최유리(FOK), `28`:스톱지정가, `29`:중간가, `30`:중간가(IOC), `31`:중간가(FOK) |
| `condUv` | 스톱가격, 스톱지정가(28)인 경우 필수 입력 |


**미국 주식 매수/매도**

```json
{ 
    "stexTp" : "NY", 
    "strCd" : "{{ticker}}", 
    "ordUv" : "{{close}}", 
    "ordQty" : "1", 
    "trdeTp" : "00", 
    "stop_pric" : ""
} 

```

| 필드 | 설명 | 예시 |
|---|---|---|
| `stexTp` | 미국거래소코드구분코드 | `NA`:AMEX / `ND`:NASDAQ / `NY`:NYSE |
| `strCd` | 종목 코드 | 
| `ordUv` | 매수/매도 가격 |
| `ordQty` | 매수/매도 수량 | 
| `trdeTp` | 매매구분 |  `00`:지정가, `03`:시장가, `26`:VWAP 지정가, `27`:TWAP 지정가, `30`:LOC, `36`:VWAP시장가, `37`:TWAP 시장가  |

---

## 주의사항

> **실제 주문 전 반드시 모의투자를 통해 충분히 테스트하세요.**
> 자동 주문 시스템은 예기치 않은 손실을 초래할 수 있습니다. 운영 전 모의투자 환경에서 웹훅 수신 및 주문 처리 전반을 철저히 검증하시기 바랍니다.

---

## 라이선스

본 프로젝트는 참고용으로 제공됩니다. 실제 투자에 사용 시 발생하는 손익에 대한 책임은 사용자 본인에게 있습니다.
