export default function handler(msgReq, msgRes) {
  const msgMallId = process.env.CAFE24_MALL_ID;
  const msgClientId = process.env.CAFE24_CLIENT_ID;
  const msgRedirectUri = process.env.CAFE24_REDIRECT_URI;

  if (!msgMallId || !msgClientId || !msgRedirectUri) {
    return msgRes.status(500).json({
      success: false,
      message: 'Cafe24 환경변수가 설정되지 않았습니다.'
    });
  }

  const msgState = 'msg_feld_event_2026';

  const msgParams = new URLSearchParams({
    response_type: 'code',
    client_id: msgClientId,
    state: msgState,
    redirect_uri: msgRedirectUri,
    scope: 'mall.write_application mall.write_promotion'
  });

  const msgAuthUrl =
    `https://${msgMallId}.cafe24api.com/api/v2/oauth/authorize?${msgParams.toString()}`;

  return msgRes.redirect(302, msgAuthUrl);
}