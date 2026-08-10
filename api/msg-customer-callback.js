import { createClient } from '@supabase/supabase-js';


/* =========================================================
   msg - Cafe24 관리자 Access Token 갱신 함수
========================================================= */

async function msgRefreshAdminToken({
  msgMallId,
  msgClientId,
  msgClientSecret,
  msgRefreshToken,
  msgSupabase
}) {
  const msgBasicAuth = Buffer.from(
    `${msgClientId}:${msgClientSecret}`
  ).toString('base64');


  const msgRefreshResponse = await fetch(
    `https://${msgMallId}.cafe24api.com/api/v2/oauth/token`,
    {
      method: 'POST',

      headers: {
        Authorization: `Basic ${msgBasicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },

      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: msgRefreshToken
      })
    }
  );


  const msgRefreshData = await msgRefreshResponse.json();


  if (!msgRefreshResponse.ok) {
    console.error(
      'msg admin token refresh error:',
      msgRefreshData
    );

    throw new Error('ADMIN_TOKEN_REFRESH_FAILED');
  }


  if (
    !msgRefreshData.access_token ||
    !msgRefreshData.refresh_token
  ) {
    console.error(
      'msg admin token refresh invalid response:',
      msgRefreshData
    );

    throw new Error('ADMIN_TOKEN_REFRESH_INVALID');
  }


  /* ======================================
     새 토큰을 Supabase에 바로 저장
  ====================================== */

  const {
    error: msgTokenUpdateError
  } = await msgSupabase
    .from('cafe24_tokens')
    .update({
      access_token:
        msgRefreshData.access_token,

      refresh_token:
        msgRefreshData.refresh_token,

      access_token_expires_at:
        msgRefreshData.expires_at || null,

      refresh_token_expires_at:
        msgRefreshData.refresh_token_expires_at || null,

      updated_at:
        new Date().toISOString()
    })
    .eq('mall_id', msgMallId);


  if (msgTokenUpdateError) {
    console.error(
      'msg refreshed token DB update error:',
      msgTokenUpdateError
    );

    throw new Error('ADMIN_TOKEN_DB_UPDATE_FAILED');
  }


  return msgRefreshData;
}



/* =========================================================
   msg - 쿠폰 발급 함수
========================================================= */

async function msgIssueCoupon({
  msgMallId,
  msgCouponNo,
  msgAccessToken,
  msgMemberId,
  msgShopNo
}) {

  const msgCouponResponse = await fetch(
    `https://${msgMallId}.cafe24api.com/api/v2/admin/coupons/${msgCouponNo}/issues`,
    {
      method: 'POST',

      headers: {
        Authorization:
          `Bearer ${msgAccessToken}`,

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


  let msgCouponData;

  try {
    msgCouponData =
      await msgCouponResponse.json();
  } catch {
    msgCouponData = {};
  }


  return {
    msgCouponResponse,
    msgCouponData
  };
}



/* =========================================================
   메인 Callback
========================================================= */

export default async function handler(
  msgReq,
  msgRes
) {

  try {

    /* =====================================================
       1. 회원 인증 코드 확인
    ===================================================== */

    const msgCode =
      msgReq.query.code;


    if (!msgCode) {
      return msgRes.status(400).json({
        success: false,
        code: 'NO_AUTH_CODE',
        message: '회원 인증 코드가 없습니다.'
      });
    }



    /* =====================================================
       2. 환경변수
    ===================================================== */

    const msgClientId =
      process.env.CAFE24_CLIENT_ID;

    const msgClientSecret =
      process.env.CAFE24_CLIENT_SECRET;

    const msgRedirectUri =
      process.env.CAFE24_CUSTOMER_REDIRECT_URI;

    const msgMallId =
      process.env.CAFE24_MALL_ID;

    const msgSupabaseUrl =
      process.env.SUPABASE_URL;

    const msgSupabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY;


    if (
      !msgClientId ||
      !msgClientSecret ||
      !msgRedirectUri ||
      !msgMallId ||
      !msgSupabaseUrl ||
      !msgSupabaseSecretKey
    ) {

      return msgRes.status(500).json({
        success: false,
        code: 'ENV_ERROR',
        message:
          '서버 환경변수가 부족합니다.'
      });
    }



    /* =====================================================
       3. Supabase 연결
    ===================================================== */

    const msgSupabase =
      createClient(
        msgSupabaseUrl,
        msgSupabaseSecretKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        }
      );



    /* =====================================================
       4. 고객 Access Token 발급
    ===================================================== */

    const msgCustomerBasicAuth =
      Buffer.from(
        `${msgClientId}:${msgClientSecret}`
      ).toString('base64');


    const msgTokenResponse =
      await fetch(
        'https://feld.co.kr/api/v2/oauth/token',
        {
          method: 'POST',

          headers: {
            Authorization:
              `Basic ${msgCustomerBasicAuth}`,

            'Content-Type':
              'application/x-www-form-urlencoded'
          },

          body: new URLSearchParams({
            grant_type:
              'authorization_code',

            code:
              msgCode,

            redirect_uri:
              msgRedirectUri
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
          code: 'CUSTOMER_TOKEN_ERROR',
          message:
            '회원 인증에 실패했습니다.'
        });
    }



    /* =====================================================
       5. 실제 Cafe24 회원 ID
    ===================================================== */

    const msgMemberId =
      msgTokenData.user_id;


    if (!msgMemberId) {

      return msgRes.status(500).json({
        success: false,
        code: 'NO_MEMBER_ID',
        message:
          '회원 ID를 확인할 수 없습니다.'
      });
    }



    /* =====================================================
       6. 회원 고유 식별자 조회
    ===================================================== */

    const msgIdentifierResponse =
      await fetch(
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
          message:
            '회원 식별자 조회에 실패했습니다.'
        });
    }



    const msgUserIdentifier =
      msgIdentifierData
        ?.identifier
        ?.user_identifier;


    const msgShopNo =
      msgIdentifierData
        ?.identifier
        ?.shop_no || 1;


    if (!msgUserIdentifier) {

      return msgRes.status(500).json({
        success: false,
        code: 'NO_IDENTIFIER',
        message:
          '회원 고유 식별자를 확인할 수 없습니다.'
      });
    }



    /* =====================================================
       7. 이벤트 설정
    ===================================================== */

    const msgEventCode =
      'feld_chuseok_2026';


    const msgCouponNo =
      '6085943114800000356';



    /* =====================================================
       8. 기존 이벤트 참여 조회
    ===================================================== */

    const {
      data: msgExistingParticipant,
      error: msgSelectError
    } = await msgSupabase
      .from('msg_event_participants')
      .select(
        'id, event_code, status, coupon_no, participated_at'
      )
      .eq(
        'event_code',
        msgEventCode
      )
      .eq(
        'member_id',
        msgUserIdentifier
      )
      .maybeSingle();


    if (msgSelectError) {

      console.error(
        'msg participation select error:',
        msgSelectError
      );


      return msgRes.status(500).json({
        success: false,
        code: 'DB_SELECT_ERROR',
        message:
          '참여 여부 확인 중 오류가 발생했습니다.'
      });
    }



    /* =====================================================
       9. 이미 참여한 회원
    ===================================================== */

    if (msgExistingParticipant) {

      return msgRes.status(200).json({
        success: false,
        code: 'ALREADY_PARTICIPATED',
        message:
          '이미 참여하셨습니다.'
      });
    }



    /* =====================================================
       10. 최초 참여 기록
    ===================================================== */

    const {
      data: msgNewParticipant,
      error: msgInsertError
    } = await msgSupabase
      .from('msg_event_participants')
      .insert({

        event_code:
          msgEventCode,

        member_id:
          msgUserIdentifier,

        result_code:
          'TEST_COUPON',

        coupon_no:
          msgCouponNo,

        status:
          'PROCESSING',

        participated_at:
          new Date().toISOString(),

        updated_at:
          new Date().toISOString()
      })
      .select(
        'id, status'
      )
      .single();



    if (msgInsertError) {

      /*
       * 동시에 두 번 눌러도
       * UNIQUE(event_code, member_id)
       * 제약조건에서 다시 차단
       */

      if (
        msgInsertError.code === '23505'
      ) {

        return msgRes.status(200).json({
          success: false,
          code: 'ALREADY_PARTICIPATED',
          message:
            '이미 참여하셨습니다.'
        });
      }


      console.error(
        'msg participation insert error:',
        msgInsertError
      );


      return msgRes.status(500).json({
        success: false,
        code: 'DB_INSERT_ERROR',
        message:
          '참여 정보 저장 중 오류가 발생했습니다.'
      });
    }



    /* =====================================================
       11. Cafe24 관리자 토큰 DB 조회
    ===================================================== */

    const {
      data: msgCafe24Token,
      error: msgTokenDbError
    } = await msgSupabase
      .from('cafe24_tokens')
      .select(
        `
          access_token,
          refresh_token,
          access_token_expires_at,
          refresh_token_expires_at
        `
      )
      .eq(
        'mall_id',
        msgMallId
      )
      .single();



    if (
      msgTokenDbError ||
      !msgCafe24Token
    ) {

      console.error(
        'msg admin token DB error:',
        msgTokenDbError
      );


      await msgSupabase
        .from('msg_event_participants')
        .update({
          status:
            'FAILED',

          error_message:
            'Admin token not found',

          updated_at:
            new Date().toISOString()
        })
        .eq(
          'id',
          msgNewParticipant.id
        );


      return msgRes.status(500).json({
        success: false,
        code: 'ADMIN_TOKEN_ERROR',
        message:
          '카페24 관리자 인증정보를 확인할 수 없습니다.'
      });
    }



    /* =====================================================
       12. 현재 사용할 관리자 Access Token 결정
    ===================================================== */

    let msgAdminAccessToken =
      msgCafe24Token.access_token;



    /*
     * DB에 저장된 expires_at을 먼저 확인합니다.
     *
     * 만료 5분 전부터 미리 Refresh 합니다.
     */

    const msgExpiresAt =
      msgCafe24Token
        .access_token_expires_at
        ? new Date(
            msgCafe24Token
              .access_token_expires_at
          ).getTime()
        : null;


    const msgNow =
      Date.now();


    const msgFiveMinutes =
      5 * 60 * 1000;


    const msgShouldRefresh =
      !msgExpiresAt ||
      msgExpiresAt <=
        msgNow + msgFiveMinutes;



    /* =====================================================
       13. 필요하면 관리자 토큰 자동 갱신
    ===================================================== */

    if (msgShouldRefresh) {

      try {

        const msgRefreshedToken =
          await msgRefreshAdminToken({

            msgMallId,

            msgClientId,

            msgClientSecret,

            msgRefreshToken:
              msgCafe24Token.refresh_token,

            msgSupabase
          });


        msgAdminAccessToken =
          msgRefreshedToken.access_token;


      } catch (msgRefreshError) {

        console.error(
          'msg refresh process error:',
          msgRefreshError
        );


        await msgSupabase
          .from('msg_event_participants')
          .update({
            status:
              'FAILED',

            error_message:
              'Admin token refresh failed',

            updated_at:
              new Date().toISOString()
          })
          .eq(
            'id',
            msgNewParticipant.id
          );


        return msgRes.status(401).json({
          success: false,
          code:
            'ADMIN_TOKEN_REFRESH_ERROR',

          message:
            '카페24 관리자 인증 갱신에 실패했습니다. 관리자 재인증이 필요할 수 있습니다.'
        });
      }
    }



    /* =====================================================
       14. 쿠폰 발급 1차 시도
    ===================================================== */

    let {
      msgCouponResponse,
      msgCouponData
    } = await msgIssueCoupon({

      msgMallId,

      msgCouponNo,

      msgAccessToken:
        msgAdminAccessToken,

      msgMemberId,

      msgShopNo
    });



    /* =====================================================
       15. 그래도 401이면 토큰 강제 갱신 후 1회 재시도
    ===================================================== */

    if (
      msgCouponResponse.status === 401
    ) {

      console.log(
        'msg coupon API 401 - refreshing admin token'
      );


      try {

        /*
         * 중요한 점:
         *
         * 앞에서 이미 Refresh했다면 그 과정에서
         * Refresh Token도 새로 발급됐습니다.
         *
         * 따라서 Supabase에서 최신 토큰을 다시 읽습니다.
         */

        const {
          data: msgLatestToken,
          error: msgLatestTokenError
        } = await msgSupabase
          .from('cafe24_tokens')
          .select(
            'refresh_token'
          )
          .eq(
            'mall_id',
            msgMallId
          )
          .single();


        if (
          msgLatestTokenError ||
          !msgLatestToken
            ?.refresh_token
        ) {

          throw new Error(
            'LATEST_REFRESH_TOKEN_NOT_FOUND'
          );
        }



        const msgRefreshedToken =
          await msgRefreshAdminToken({

            msgMallId,

            msgClientId,

            msgClientSecret,

            msgRefreshToken:
              msgLatestToken.refresh_token,

            msgSupabase
          });


        msgAdminAccessToken =
          msgRefreshedToken.access_token;



        /*
         * 새 Access Token으로 쿠폰 발급 재시도
         */

        const msgRetryResult =
          await msgIssueCoupon({

            msgMallId,

            msgCouponNo,

            msgAccessToken:
              msgAdminAccessToken,

            msgMemberId,

            msgShopNo
          });


        msgCouponResponse =
          msgRetryResult.msgCouponResponse;

        msgCouponData =
          msgRetryResult.msgCouponData;


      } catch (msgRetryError) {

        console.error(
          'msg coupon retry refresh error:',
          msgRetryError
        );


        await msgSupabase
          .from('msg_event_participants')
          .update({

            status:
              'FAILED',

            coupon_no:
              msgCouponNo,

            error_message:
              'Admin token refresh/retry failed',

            updated_at:
              new Date().toISOString()
          })
          .eq(
            'id',
            msgNewParticipant.id
          );


        return msgRes.status(401).json({
          success: false,
          code:
            'ADMIN_TOKEN_REFRESH_ERROR',

          message:
            '카페24 관리자 인증 갱신에 실패했습니다. 관리자 재인증이 필요합니다.'
        });
      }
    }



    /* =====================================================
       16. 최종 쿠폰 발급 실패
    ===================================================== */

    if (!msgCouponResponse.ok) {

      console.error(
        'msg cafe24 coupon issue error:',
        msgCouponData
      );


      await msgSupabase
        .from('msg_event_participants')
        .update({

          status:
            'FAILED',

          coupon_no:
            msgCouponNo,

          result_code:
            'TEST_COUPON',

          error_message:
            JSON.stringify(
              msgCouponData
            ),

          updated_at:
            new Date().toISOString()
        })
        .eq(
          'id',
          msgNewParticipant.id
        );


      return msgRes
        .status(
          msgCouponResponse.status
        )
        .json({
          success: false,
          code:
            'COUPON_ISSUE_ERROR',

          message:
            '쿠폰 발급에 실패했습니다.',

          error:
            msgCouponData
        });
    }



    /* =====================================================
       17. 쿠폰 발급 성공 → 참여 기록 완료
    ===================================================== */

    const {
      error: msgUpdateError
    } = await msgSupabase
      .from('msg_event_participants')
      .update({

        status:
          'ISSUED',

        coupon_no:
          msgCouponNo,

        result_code:
          'TEST_COUPON',

        error_message:
          null,

        updated_at:
          new Date().toISOString()
      })
      .eq(
        'id',
        msgNewParticipant.id
      );



    if (msgUpdateError) {

      console.error(
        'msg participant update error:',
        msgUpdateError
      );


      /*
       * 이 경우 쿠폰 자체는 이미 발급됐습니다.
       * 따라서 재발급하면 안 됩니다.
       */

      return msgRes.status(500).json({
        success: false,
        code:
          'DB_UPDATE_ERROR',

        message:
          '쿠폰은 발급됐지만 참여 기록 업데이트에 실패했습니다.'
      });
    }



    /* =====================================================
       18. 최종 성공
    ===================================================== */

    return msgRes.status(200).json({

      success: true,

      code:
        'COUPON_ISSUED',

      message:
        '쿠폰이 발급되었습니다.',

      coupon_no:
        msgCouponNo
    });



  } catch (msgError) {

    console.error(
      'msg customer callback error:',
      msgError
    );


    return msgRes.status(500).json({

      success: false,

      code:
        'SERVER_ERROR',

      message:
        '서버 처리 중 오류가 발생했습니다.'
    });
  }
}