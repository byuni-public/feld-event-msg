import crypto from 'crypto';

export default function handler(msgReq, msgRes) {
  const msgClientId = process.env.CAFE24_CLIENT_ID;
  const msgRedirectUri = process.env.CAFE24_CUSTOMER_REDIRECT_URI;

  if (!msgClientId || !msgRedirectUri) {
    return msgRes.status(500).json({
      success: false,
      message: '회원 인증 환경변수가 부족합니다.'
    });
  }

  // CSRF 방지용 임시값
  const msgState = crypto.randomBytes(16).toString('hex');

  const msgParams = new URLSearchParams({
    response_type: 'code',
    client_id: msgClientId,
    state: msgState,
    redirect_uri: msgRedirectUri,
    scope: 'mall.read_customer_identifier'
  });

  // 중요:
  // 관리자 OAuth와 달리 회원 인증은 쇼핑몰 대표도메인 사용
  const msgAuthUrl =
    `https://feld.co.kr/api/v2/oauth/authorize?${msgParams.toString()}`;

  return msgRes.redirect(302, msgAuthUrl);
}