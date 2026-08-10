import { createClient } from '@supabase/supabase-js';

export default async function handler(msgReq, msgRes) {
  try {
    const msgCode = msgReq.query.code;

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

    const msgSupabaseUrl = process.env.SUPABASE_URL;
    const msgSupabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (
      !msgMallId ||
      !msgClientId ||
      !msgClientSecret ||
      !msgRedirectUri ||
      !msgSupabaseUrl ||
      !msgSupabaseSecretKey
    ) {
      return msgRes.status(500).json({
        success: false,
        message: '서버 환경변수 설정이 부족합니다.'
      });
    }

    /* -----------------------------
       1. Cafe24 Access Token 발급
    ----------------------------- */

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

    /* -----------------------------
       2. Supabase 연결
    ----------------------------- */

    const msgSupabase = createClient(
      msgSupabaseUrl,
      msgSupabaseSecretKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    /* -----------------------------
       3. Cafe24 토큰 DB 저장
    ----------------------------- */

    const { error: msgDbError } = await msgSupabase
      .from('cafe24_tokens')
      .upsert(
        {
          mall_id: msgTokenData.mall_id || msgMallId,
          access_token: msgTokenData.access_token,
          refresh_token: msgTokenData.refresh_token,
          access_token_expires_at:
            msgTokenData.expires_at || null,
          refresh_token_expires_at:
            msgTokenData.refresh_token_expires_at || null,
          updated_at: new Date().toISOString()
        },
        {
          onConflict: 'mall_id'
        }
      );

    if (msgDbError) {
      console.error('msg Supabase error:', msgDbError);

      return msgRes.status(500).json({
        success: false,
        message: 'Cafe24 토큰은 발급됐지만 DB 저장에 실패했습니다.'
      });
    }

    /* -----------------------------
       4. 완료
    ----------------------------- */

    return msgRes.status(200).json({
      success: true,
      message: 'Cafe24 연동 및 토큰 저장이 완료되었습니다.'
    });

  } catch (msgError) {
    console.error('msg callback error:', msgError);

    return msgRes.status(500).json({
      success: false,
      message: '서버 처리 중 오류가 발생했습니다.'
    });
  }
}