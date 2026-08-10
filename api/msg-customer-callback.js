import { createClient } from '@supabase/supabase-js';


/* =========================================================
   msg - Cafe24 관리자 Access Token 갱신
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


  const msgRefreshData =
    await msgRefreshResponse.json();


  if (!msgRefreshResponse.ok) {

    console.error(
      'msg admin token refresh error:',
      msgRefreshData
    );

    throw new Error(
      'ADMIN_TOKEN_REFRESH_FAILED'
    );
  }


  if (
    !msgRefreshData.access_token ||
    !msgRefreshData.refresh_token
  ) {

    console.error(
      'msg admin token refresh invalid:',
      msgRefreshData
    );

    throw new Error(
      'ADMIN_TOKEN_REFRESH_INVALID'
    );
  }


  /* =====================================================
     새 토큰 Supabase 저장
  ===================================================== */

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
    .eq(
      'mall_id',
      msgMallId
    );


  if (msgTokenUpdateError) {

    console.error(
      'msg token DB update error:',
      msgTokenUpdateError
    );

    throw new Error(
      'ADMIN_TOKEN_DB_UPDATE_FAILED'
    );
  }


  return msgRefreshData;
}



/* =========================================================
   msg - Cafe24 쿠폰 발급
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

        request: {

          shop_no:
            msgShopNo,

          issued_member_scope:
            'M',

          member_id:
            msgMemberId,

          allow_duplication:
            'F',

          single_issue_per_once:
            'T',

          send_sms_for_issue:
            'F'
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
   msg - 메인 Customer OAuth Callback
========================================================= */

export default async function handler(
  msgReq,
  msgRes
) {

  try {

    /* =====================================================
       1. 인증 코드
    ===================================================== */

    const msgCode =
      msgReq.query.code;


    if (!msgCode) {

      return msgRes.status(400).json({

        success: false,

        code:
          'NO_AUTH_CODE',

        message:
          '회원 인증 코드가 없습니다.'
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

        code:
          'ENV_ERROR',

        message:
          '서버 환경변수가 부족합니다.'
      });
    }



    /* =====================================================
       3. Supabase
    ===================================================== */

    const msgSupabase =
      createClient(

        msgSupabaseUrl,

        msgSupabaseSecretKey,

        {
          auth: {

            persistSession:
              false,

            autoRefreshToken:
              false
          }
        }
      );



    /* =====================================================
       4. Customer Access Token
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
        .status(
          msgTokenResponse.status
        )
        .json({

          success: false,

          code:
            'CUSTOMER_TOKEN_ERROR',

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

        code:
          'NO_MEMBER_ID',

        message:
          '회원 ID를 확인할 수 없습니다.'
      });
    }



    /* =====================================================
       6. 회원 고유 식별자
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
        'msg identifier error:',
        msgIdentifierData
      );


      return msgRes
        .status(
          msgIdentifierResponse.status
        )
        .json({

          success: false,

          code:
            'IDENTIFIER_ERROR',

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

        code:
          'NO_IDENTIFIER',

        message:
          '회원 고유 식별자를 확인할 수 없습니다.'
      });
    }



    /* =====================================================
       7. 이벤트 설정

       현재 테스트:
       GREAT_LUCK = 대길
       첫 번째 테스트 쿠폰 사용
    ===================================================== */

    const msgEventCode =
      'feld_chuseok_2026';


    const msgResultCode =
      'GREAT_LUCK';


    const msgCouponNo =
      '6085943114800000356';


    const msgEventPageUrl =
      'https://feld.co.kr/26chuseok.html';



    /* =====================================================
       8. 기존 참여 여부
    ===================================================== */

    const {
      data: msgExistingParticipant,
      error: msgSelectError
    } = await msgSupabase
      .from(
        'msg_event_participants'
      )
      .select(
        'id, event_code, status, coupon_no, result_code, participated_at'
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

        code:
          'DB_SELECT_ERROR',

        message:
          '참여 여부 확인 중 오류가 발생했습니다.'
      });
    }



    /* =====================================================
       9. 이미 참여
    ===================================================== */

    if (msgExistingParticipant) {

      return msgRes.redirect(

        302,

        `${msgEventPageUrl}?msg_status=already`
      );
    }



    /* =====================================================
       10. 참여 기록 생성
    ===================================================== */

    const {
      data: msgNewParticipant,
      error: msgInsertError
    } = await msgSupabase

      .from(
        'msg_event_participants'
      )

      .insert({

        event_code:
          msgEventCode,

        member_id:
          msgUserIdentifier,

        result_code:
          msgResultCode,

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
       * 중복 UNIQUE 에러
       */

      if (
        msgInsertError.code === '23505'
      ) {

        return msgRes.redirect(

          302,

          `${msgEventPageUrl}?msg_status=already`
        );
      }


      console.error(
        'msg participation insert error:',
        msgInsertError
      );


      return msgRes.status(500).json({

        success: false,

        code:
          'DB_INSERT_ERROR',

        message:
          '참여 정보 저장 중 오류가 발생했습니다.'
      });
    }



    /* =====================================================
       11. 관리자 토큰 조회
    ===================================================== */

    const {
      data: msgCafe24Token,
      error: msgTokenDbError
    } = await msgSupabase

      .from(
        'cafe24_tokens'
      )

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

        .from(
          'msg_event_participants'
        )

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

        code:
          'ADMIN_TOKEN_ERROR',

        message:
          '카페24 관리자 인증정보를 확인할 수 없습니다.'
      });
    }



    /* =====================================================
       12. Access Token 만료 확인
    ===================================================== */

    let msgAdminAccessToken =
      msgCafe24Token.access_token;


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
       13. 필요하면 토큰 갱신
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
          'msg refresh error:',
          msgRefreshError
        );


        await msgSupabase

          .from(
            'msg_event_participants'
          )

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
            '카페24 관리자 인증 갱신에 실패했습니다.'
        });
      }
    }



    /* =====================================================
       14. 쿠폰 발급
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
       15. 401이면 Refresh 후 한 번 재시도
    ===================================================== */

    if (
      msgCouponResponse.status === 401
    ) {

      try {

        const {
          data: msgLatestToken,
          error: msgLatestTokenError
        } = await msgSupabase

          .from(
            'cafe24_tokens'
          )

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
          'msg coupon retry error:',
          msgRetryError
        );


        await msgSupabase

          .from(
            'msg_event_participants'
          )

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
            '카페24 관리자 인증 갱신에 실패했습니다.'
        });
      }
    }



    /* =====================================================
       16. 쿠폰 최종 실패
    ===================================================== */

    if (!msgCouponResponse.ok) {

      console.error(
        'msg cafe24 coupon error:',
        msgCouponData
      );


      await msgSupabase

        .from(
          'msg_event_participants'
        )

        .update({

          status:
            'FAILED',

          coupon_no:
            msgCouponNo,

          result_code:
            msgResultCode,

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
       17. 쿠폰 성공 → DB 완료
    ===================================================== */

    const {
      error: msgUpdateError
    } = await msgSupabase

      .from(
        'msg_event_participants'
      )

      .update({

        status:
          'ISSUED',

        coupon_no:
          msgCouponNo,

        result_code:
          msgResultCode,

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


      return msgRes.status(500).json({

        success: false,

        code:
          'DB_UPDATE_ERROR',

        message:
          '쿠폰은 발급됐지만 참여 기록 업데이트에 실패했습니다.'
      });
    }



    /* =====================================================
       18. 성공 → 이벤트 페이지로 복귀
    ===================================================== */

    return msgRes.redirect(

      302,

      `${msgEventPageUrl}` +
      `?msg_status=success` +
      `&msg_result=${encodeURIComponent(
        msgResultCode
      )}`
    );



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