export default async function handler(msgReq, msgRes) {
  try {
    const msgCode = msgReq.query.code;
    const msgState = msgReq.query.state;

    if (!msgCode) {
      return msgRes.status(400).json({
        success: false,
        message: 'Cafe24 authorization code가 없습니다.'
      });
    }

    const msgMallId = process.env.CAFE24_MALL_ID;
    const msgClientId = process.env.CAFE24_CLIENT_ID;
    const msgClientSecret = process.env.CAFE24_CLIENT_SECRET;
    const msgRedirectUri = process.env.CAFE24_REDIRECT_URI;

    const msgBasicAuth = Buffer.from(
      `${msgClientId}:${msgClientSecret}`
    ).toString('base64');

    const msgTokenResponse = await fetch(
      `https://${msgMallId}.cafe24api.com/api/v2/oauth/token`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${msgBasicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: msgCode,
          redirect_uri: msgRedirectUri
        })
      }
    );

    const msgTokenData = await msgTokenResponse.json();

    if (!msgTokenResponse.ok) {
      return msgRes.status(msgTokenResponse.status).json({
        success: false,
        message: 'Cafe24 Access Token 발급 실패',
        error: msgTokenData
      });
    }

    return msgRes.status(200).json({
      success: true,
      message: 'Cafe24 Access Token 발급 성공',
      mall_id: msgTokenData.mall_id,
      scopes: msgTokenData.scopes,
      expires_at: msgTokenData.expires_at,

      // 테스트 단계라서 일단 확인용입니다.
      access_token: msgTokenData.access_token,
      refresh_token: msgTokenData.refresh_token,

      state: msgState || null
    });

  } catch (msgError) {
    return msgRes.status(500).json({
      success: false,
      message: '서버 오류',
      error: msgError.message
    });
  }
}