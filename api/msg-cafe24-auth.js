export default {
  async fetch(msgRequest) {
    const msgMallId = process.env.CAFE24_MALL_ID;
    const msgClientId = process.env.CAFE24_CLIENT_ID;
    const msgRedirectUri = process.env.CAFE24_REDIRECT_URI;

    if (!msgMallId || !msgClientId || !msgRedirectUri) {
      return Response.json(
        {
          success: false,
          message: 'Cafe24 환경변수가 설정되지 않았습니다.'
        },
        { status: 500 }
      );
    }

    const msgParams = new URLSearchParams({
      response_type: 'code',
      client_id: msgClientId,
      state: 'msg_feld_event_2026',
      redirect_uri: msgRedirectUri,
      scope: 'mall.write_application mall.write_promotion'
    });

    const msgAuthUrl =
      `https://${msgMallId}.cafe24api.com/api/v2/oauth/authorize?${msgParams.toString()}`;

    return Response.redirect(msgAuthUrl, 302);
  }
};