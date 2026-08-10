import { createClient } from '@supabase/supabase-js';

export default async function handler(msgReq, msgRes) {
  try {

    /* ===============================
       1. 인증 코드 확인
    =============================== */

    const msgCode = msgReq.query.code;

    if (!msgCode) {
      return msgRes.status(400).json({
        success: false,
        code: 'NO_AUTH_CODE',
        message: '회원 인증 코드가 없습니다.'
      });
    }


    /* ===============================
       2. 환경변수
    =============================== */

    const msgClientId = process.env.CAFE24_CLIENT_ID;
    const msgClientSecret = process.env.CAFE24_CLIENT_SECRET;
    const msgRedirectUri =
      process.env.CAFE24_CUSTOMER_REDIRECT_URI;

    const msgSupabaseUrl =
      process.env.SUPABASE_URL;

    const msgSupabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY;


    if (
      !msgClientId ||
      !msgClientSecret ||
      !msgRedirectUri ||
      !msgSupabaseUrl ||
      !msgSupabaseSecretKey
    ) {
      return msgRes.status(500).json({
        success: false,
        code: 'ENV_ERROR',
        message: '서버 환경변수가 부족합니다.'
      });
    }


    /* ===============================
       3. 고객 Access Token 발급
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

      console.log('msg customer token info:', {
        mall_id: msgTokenData.mall_id || null,
        user_id: msgTokenData.user_id || null,
        member_id: msgTokenData.member_id || null,
        scopes: msgTokenData.scopes || null
        });


    if (!msgTokenResponse.ok) {

      console.error(
        'msg customer token error:',
        msgTokenData
      );

      return msgRes.status(200).json({
        success: true,
        message: '회원 정보 확인 성공',
        member_test: {
            user_id: msgTokenData.user_id || null,
            member_id: msgTokenData.member_id || null,
            user_identifier: msgUserIdentifier
        }
        });
    }


    /* ===============================
       4. 회원 고유 식별자 조회
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
          code: 'IDENTIFIER_ERROR',
          message: '회원 식별자 조회 실패'
        });
    }


    /* ===============================
       5. 고유 회원값 추출
    =============================== */

    const msgUserIdentifier =
      msgIdentifierData?.identifier?.user_identifier;


    const msgShopNo =
      msgIdentifierData?.identifier?.shop_no;


    if (!msgUserIdentifier) {

      return msgRes.status(500).json({
        success: false,
        code: 'NO_IDENTIFIER',
        message: '회원 고유 식별자를 확인할 수 없습니다.'
      });
    }


    /* ===============================
       6. Supabase 연결
    =============================== */

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


    /* ===============================
       7. 이벤트 코드
    =============================== */

    const msgEventCode =
      'feld_chuseok_2026';


    /* ===============================
       8. 기존 참여 조회
    =============================== */

    const {
      data: msgExistingParticipant,
      error: msgSelectError
    } = await msgSupabase
      .from('msg_event_participants')
      .select(
        'id, event_code, status, participated_at'
      )
      .eq('event_code', msgEventCode)
      .eq('member_id', msgUserIdentifier)
      .maybeSingle();


    if (msgSelectError) {

      console.error(
        'msg participation select error:',
        msgSelectError
      );

      return msgRes.status(500).json({
        success: false,
        code: 'DB_SELECT_ERROR',
        message: '참여 여부 확인 중 오류가 발생했습니다.'
      });
    }


    /* ===============================
       9. 이미 참여했음
    =============================== */

    if (msgExistingParticipant) {

      return msgRes.status(200).json({
        success: false,
        code: 'ALREADY_PARTICIPATED',
        message: '이미 참여하셨습니다.'
      });
    }


    /* ===============================
       10. 최초 참여 기록
    =============================== */

    const {
      data: msgNewParticipant,
      error: msgInsertError
    } = await msgSupabase
      .from('msg_event_participants')
      .insert({
        event_code: msgEventCode,
        member_id: msgUserIdentifier,
        status: 'READY',
        participated_at:
          new Date().toISOString(),
        updated_at:
          new Date().toISOString()
      })
      .select('id, status')
      .single();


    if (msgInsertError) {

      /*
       * 동시에 두 번 요청했을 경우
       * UNIQUE 제약조건에서 한 번 더 차단
       */
      if (msgInsertError.code === '23505') {

        return msgRes.status(200).json({
          success: false,
          code: 'ALREADY_PARTICIPATED',
          message: '이미 참여하셨습니다.'
        });
      }


      console.error(
        'msg participation insert error:',
        msgInsertError
      );

      return msgRes.status(500).json({
        success: false,
        code: 'DB_INSERT_ERROR',
        message: '참여 정보 저장 중 오류가 발생했습니다.'
      });
    }


    /* ===============================
       11. 최초 참여 성공
    =============================== */

    return msgRes.status(200).json({
      success: true,
      code: 'PARTICIPATION_READY',
      message: '이벤트 참여가 가능합니다.',
      participant_id: msgNewParticipant.id,
      shop_no: msgShopNo
    });


  } catch (msgError) {

    console.error(
      'msg customer callback error:',
      msgError
    );

    return msgRes.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: '서버 처리 중 오류가 발생했습니다.'
    });
  }
}