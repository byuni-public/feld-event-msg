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
    const msgRedirectUri = process.env.CAFE24_CUSTOMER_REDIRECT_URI;

    const msgSupabaseUrl = process.env.SUPABASE_URL;
    const msgSupabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    const msgMallId = process.env.CAFE24_MALL_ID;


    if (
      !msgClientId ||
      !msgClientSecret ||
      !msgRedirectUri ||
      !msgSupabaseUrl ||
      !msgSupabaseSecretKey ||
      !msgMallId
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
      console.error(
        'msg customer token error:',
        msgTokenData
      );

      return msgRes
        .status(msgTokenResponse.status)
        .json({
          success: false,
          code: 'TOKEN_ERROR',
          message: '회원 Access Token 발급 실패'
        });
    }


    /* ===============================
       4. 실제 회원 ID 확인
    =============================== */

    const msgMemberId = msgTokenData.user_id;


    if (!msgMemberId) {
      return msgRes.status(500).json({
        success: false,
        code: 'NO_MEMBER_ID',
        message: '회원 ID를 확인할 수 없습니다.'
      });
    }


    /* ===============================
       5. 회원 고유 식별자 조회
    =============================== */

    const msgIdentifierResponse = await fetch(
      'https://feld.co.kr/api/v2/customers/identifier',
      {
        method: 'GET',

        headers: {
          Authorization: `Basic ${msgTokenData.access_token}`
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


    const msgUserIdentifier =
      msgIdentifierData?.identifier?.user_identifier;

    const msgShopNo =
      msgIdentifierData?.identifier?.shop_no || 1;


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
       7. 이벤트 기본값
    =============================== */

    const msgEventCode = 'feld_chuseok_2026';

    const msgCouponNo = '6085943114800000356';


    /* ===============================
       8. 기존 참여 여부 확인
    =============================== */

    const {
      data: msgExistingParticipant,
      error: msgSelectError
    } = await msgSupabase
      .from('msg_event_participants')
      .select(
        'id, event_code, status, coupon_no, participated_at'
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
       9. 이미 참여한 회원 차단
    =============================== */

    if (msgExistingParticipant) {
      return msgRes.status(200).json({
        success: false,
        code: 'ALREADY_PARTICIPATED',
        message: '이미 참여하셨습니다.'
      });
    }


    /* ===============================
       10. 최초 참여 기록 생성
    =============================== */

    const {
      data: msgNewParticipant,
      error: msgInsertError
    } = await msgSupabase
      .from('msg_event_participants')
      .insert({
        event_code: msgEventCode,
        member_id: msgUserIdentifier,
        result_code: 'TEST_COUPON',
        coupon_no: msgCouponNo,
        status: 'PROCESSING',
        participated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, status')
      .single();


    if (msgInsertError) {

      /*
       * 동시에 여러 요청이 들어와도
       * UNIQUE(event_code, member_id)가 차단
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
       11. Cafe24 관리자 토큰 조회
    =============================== */

    const {
      data: msgCafe24Token,
      error: msgTokenDbError
    } = await msgSupabase
      .from('cafe24_tokens')
      .select(
        'access_token, refresh_token, access_token_expires_at'
      )
      .eq('mall_id', msgMallId)
      .single();


    if (msgTokenDbError || !msgCafe24Token) {
      console.error(
        'msg admin token db error:',
        msgTokenDbError
      );

      await msgSupabase
        .from('msg_event_participants')
        .update({
          status: 'FAILED',
          error_message: 'Admin token not found',
          updated_at: new Date().toISOString()
        })
        .eq('id', msgNewParticipant.id);


      return msgRes.status(500).json({
        success: false,
        code: 'ADMIN_TOKEN_ERROR',
        message: '카페24 관리자 인증정보를 확인할 수 없습니다.'
      });
    }


    /* ===============================
       12. Cafe24 쿠폰 발급 요청
    =============================== */

    const msgCouponResponse = await fetch(
      `https://${msgMallId}.cafe24api.com/api/v2/admin/coupons/${msgCouponNo}/issues`,
      {
        method: 'POST',

        headers: {
          Authorization:
            `Bearer ${msgCafe24Token.access_token}`,

          'Content-Type':
            'application/json',

          'X-Cafe24-Api-Version':
            '2026-03-01'
        },

        body: JSON.stringify({
          issues: {
            shop_no: msgShopNo,
            member_id: msgMemberId,
            allow_duplication: 'F'
          }
        })
      }
    );


    const msgCouponData =
      await msgCouponResponse.json();


    /* ===============================
       13. 쿠폰 발급 실패
    =============================== */

    if (!msgCouponResponse.ok) {

      console.error(
        'msg cafe24 coupon issue error:',
        msgCouponData
      );


      await msgSupabase
        .from('msg_event_participants')
        .update({
          status: 'FAILED',
          coupon_no: msgCouponNo,
          result_code: 'TEST_COUPON',
          error_message:
            JSON.stringify(msgCouponData),
          updated_at:
            new Date().toISOString()
        })
        .eq('id', msgNewParticipant.id);


      return msgRes
        .status(msgCouponResponse.status)
        .json({
          success: false,
          code: 'COUPON_ISSUE_ERROR',
          message: '쿠폰 발급에 실패했습니다.',
          error: msgCouponData
        });
    }


    /* ===============================
       14. 쿠폰 발급 성공
    =============================== */

    const {
      error: msgUpdateError
    } = await msgSupabase
      .from('msg_event_participants')
      .update({
        status: 'ISSUED',
        coupon_no: msgCouponNo,
        result_code: 'TEST_COUPON',
        error_message: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', msgNewParticipant.id);


    if (msgUpdateError) {
      console.error(
        'msg participant update error:',
        msgUpdateError
      );

      return msgRes.status(500).json({
        success: false,
        code: 'DB_UPDATE_ERROR',
        message:
          '쿠폰은 발급됐지만 참여 기록 업데이트에 실패했습니다.'
      });
    }


    /* ===============================
       15. 최종 성공
    =============================== */

    return msgRes.status(200).json({
      success: true,
      code: 'COUPON_ISSUED',
      message: '쿠폰이 발급되었습니다.',
      coupon_no: msgCouponNo
    });


  } catch (msgError) {

    console.error(
      'msg customer callback error:',
      msgError
    );

    return msgRes.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message:
        '서버 처리 중 오류가 발생했습니다.'
    });
  }
}