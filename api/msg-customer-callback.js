export default async function handler(msgReq, msgRes) {
  try {
    const msgCode = msgReq.query.code;

    if (!msgCode) {
      return msgRes.status(400).json({
        success: false,
        message: '회원 인증 코드가 없습니다.'
      });
    }

    const msgClientId = process.env.CAFE24_CLIENT_ID;
    const msgClientSecret = process.env.CAFE24_CLIENT_SECRET;
    const msgRedirectUri =
      process.env.CAFE24_CUSTOMER_REDIRECT_URI;

    if (
      !msgClientId ||
      !msgClientSecret ||
      !msgRedirectUri
    ) {
      return msgRes.status(500).json({
        success: false,
        message: '회원 인증 환경변수가 부족합니다.'
      });
    }

    /* ===============================
       1. 고객 Access Token 발급
    =============================== */

    const msgBasicAuth = Buffer.from(
      `${msgClientId}:${msgClientSecret}`
    ).toString('base64');

    const msgTokenResponse = await fetch(
      'https://feld.co.kr/api/v2/oauth/token',
      {
        method: 'POST',

        headers: {
          Authorization: `Basic ${msgBasicAuth}`,
          'Content-Type':
            'application/x-www-form-urlencoded'
        },

        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: msgCode,
          redirect_uri: msgRedirectUri
        })
      }
    );

    const msgTokenData =
      await msgTokenResponse.json();

    if (!msgTokenResponse.ok) {
      console.error(
        'msg customer token error:',
        msgTokenData
      );

      return msgRes
        .status(msgTokenResponse.status)
        .json({
          success: false,
          message: '회원 Access Token 발급 실패',
          error: msgTokenData
        });
    }

    /* ===============================
       2. 회원 고유 식별자 조회
    =============================== */

    const msgIdentifierResponse = await fetch(
      'https://feld.co.kr/api/v2/customers/identifier',
      {
        method: 'GET',

        headers: {
          Authorization:
            `Basic ${msgTokenData.access_token}`
        }
      }
    );

    const msgIdentifierData =
      await msgIdentifierResponse.json();

    if (!msgIdentifierResponse.ok) {
      console.error(
        'msg customer identifier error:',
        msgIdentifierData
      );

      return msgRes
        .status(msgIdentifierResponse.status)
        .json({
          success: false,
          message: '회원 식별자 조회 실패',
          error: msgIdentifierData
        });
    }

    /* ===============================
       3. 테스트 결과
    =============================== */

    return msgRes.status(200).json({
      success: true,
      message: '카페24 회원 인증 성공',
      customer: msgIdentifierData
    });

  } catch (msgError) {
    console.error(
      'msg customer callback error:',
      msgError
    );

    return msgRes.status(500).json({
      success: false,
      message:
        '회원 인증 처리 중 서버 오류가 발생했습니다.'
    });
  }
}