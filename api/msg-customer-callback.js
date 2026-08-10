import { createClient } from '@supabase/supabase-js';


/* =========================================================
   msg - 이벤트 기본 설정
========================================================= */

const msgEventCode =
  'feld_chuseok_2026';


const msgEventPageUrl =
  'https://feld.co.kr/msg/26chuseok.html';



/* =========================================================
   msg - 카드 조합 결과 결정

   현재는 테스트 규칙입니다.

   3 + 8
   → GREAT_LUCK
   → 첫 번째 쿠폰

   추후 실제 45개 조합표로 교체하면 됩니다.
========================================================= */

function msgGetCardResult(
  msgCard1,
  msgCard2
) {

  const [
    msgFirst,
    msgSecond
  ] = [
    Number(msgCard1),
    Number(msgCard2)
  ].sort(
    (a, b) => a - b
  );


  const msgCombinationKey =
    `${msgFirst}-${msgSecond}`;


  /* =====================================================
     테스트 특수조합

     3 + 8은 무조건 대길
  ===================================================== */

  if (
    msgCombinationKey === '3-8'
  ) {

    return {
      code: 'GREAT_LUCK',
      name: '대길',
      couponNo:
        '6085943114800000356'
    };
  }



  /* =====================================================
     나머지 조합 테스트 분배

     합계를 3으로 나눈 나머지로
     대길 / 중길 / 소길 테스트
  ===================================================== */

  const msgRemainder =
    (msgFirst + msgSecond) % 3;



  if (msgRemainder === 2) {

    return {
      code: 'GREAT_LUCK',
      name: '대길',
      couponNo:
        '6085943114800000356'
    };
  }



  if (msgRemainder === 0) {

    return {
      code: 'MIDDLE_LUCK',
      name: '중길',
      couponNo:
        '6085943764400000357'
    };
  }



  return {
    code: 'SMALL_LUCK',
    name: '소길',
    couponNo:
      '6085943765000000358'
  };
}



/* =========================================================
   msg - 관리자 Access Token 갱신
========================================================= */

async function msgRefreshAdminToken({
  msgMallId,
  msgClientId,
  msgClientSecret,
  msgRefreshToken,
  msgSupabase
}) {

  const msgBasicAuth =
    Buffer.from(
      `${msgClientId}:${msgClientSecret}`
    ).toString('base64');



  const msgRefreshResponse =
    await fetch(

      `https://${msgMallId}.cafe24api.com/api/v2/oauth/token`,

      {
        method: 'POST',

        headers: {

          Authorization:
            `Basic ${msgBasicAuth}`,

          'Content-Type':
            'application/x-www-form-urlencoded'
        },

        body: new URLSearchParams({

          grant_type:
            'refresh_token',

          refresh_token:
            msgRefreshToken
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

    throw new Error(
      'ADMIN_TOKEN_REFRESH_INVALID'
    );
  }



  /* =====================================================
     새 관리자 토큰 Supabase 저장
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
      'msg refreshed token DB error:',
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

  const msgCouponResponse =
    await fetch(

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
   msg - selection 사용상태 원복
========================================================= */

async function msgReleaseSelection({
  msgSupabase,
  msgSelectionId
}) {

  try {

    await msgSupabase

      .from('msg_event_selections')

      .update({
        used: false
      })

      .eq(
        'selection_id',
        msgSelectionId
      );

  } catch (msgError) {

    console.error(
      'msg release selection error:',
      msgError
    );
  }
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
       1. OAuth code + state 확인
    ===================================================== */

    const msgCode =
      String(
        msgReq.query.code || ''
      ).trim();


    const msgSelectionId =
      String(
        msgReq.query.state || ''
      ).trim();



    if (!msgCode) {

      return msgRes.status(400).json({
        success: false,
        code: 'NO_AUTH_CODE',
        message: '회원 인증 코드가 없습니다.'
      });
    }



    if (!msgSelectionId) {

      return msgRes.status(400).json({
        success: false,
        code: 'NO_SELECTION_STATE',
        message: '카드 선택 정보가 없습니다.'
      });
    }



    if (
      !/^[a-f0-9]{48}$/i.test(
        msgSelectionId
      )
    ) {

      return msgRes.status(400).json({
        success: false,
        code: 'INVALID_SELECTION_STATE',
        message: '잘못된 카드 선택 정보입니다.'
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
        message: '서버 환경변수가 부족합니다.'
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
       4. selection 조회
    ===================================================== */

    const {
      data: msgSelection,
      error: msgSelectionError
    } = await msgSupabase

      .from('msg_event_selections')

      .select(
        'selection_id, event_code, card_1, card_2, used, created_at'
      )

      .eq(
        'selection_id',
        msgSelectionId
      )

      .eq(
        'event_code',
        msgEventCode
      )

      .maybeSingle();



    if (
      msgSelectionError ||
      !msgSelection
    ) {

      console.error(
        'msg callback selection error:',
        msgSelectionError
      );


      return msgRes.redirect(

        302,

        `${msgEventPageUrl}?msg_status=selection_error`
      );
    }



    if (msgSelection.used) {

      return msgRes.redirect(

        302,

        `${msgEventPageUrl}?msg_status=used`
      );
    }



    /* =====================================================
       5. Customer Access Token
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


      return msgRes.redirect(

        302,

        `${msgEventPageUrl}?msg_status=auth_error`
      );
    }



    /* =====================================================
       6. 실제 Cafe24 member_id
    ===================================================== */

    const msgMemberId =
      msgTokenData.user_id;



    if (!msgMemberId) {

      return msgRes.redirect(

        302,

        `${msgEventPageUrl}?msg_status=auth_error`
      );
    }



    /* =====================================================
       7. Customer Identifier
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


      return msgRes.redirect(

        302,

        `${msgEventPageUrl}?msg_status=auth_error`
      );
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

      return msgRes.redirect(

        302,

        `${msgEventPageUrl}?msg_status=auth_error`
      );
    }



    /* =====================================================
       8. 이미 참여했는지 확인
    ===================================================== */

    const {
      data: msgExistingParticipant,
      error: msgParticipantSelectError
    } = await msgSupabase

      .from('msg_event_participants')

      .select(
        'id, status, result_code, coupon_no'
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



    if (msgParticipantSelectError) {

      console.error(
        'msg participant lookup error:',
        msgParticipantSelectError
      );


      return msgRes.redirect(

        302,

        `${msgEventPageUrl}?msg_status=server_error`
      );
    }



    if (msgExistingParticipant) {

      return msgRes.redirect(

        302,

        `${msgEventPageUrl}?msg_status=already`
      );
    }



    /* =====================================================
       9. 선택한 카드 조합 결과 계산
    ===================================================== */

    const msgResult =
      msgGetCardResult(

        msgSelection.card_1,

        msgSelection.card_2
      );


    const msgResultCode =
      msgResult.code;


    const msgResultName =
      msgResult.name;


    const msgCouponNo =
      msgResult.couponNo;



    /* =====================================================
       10. 참여 PROCESSING 기록
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

      if (
        msgInsertError.code === '23505'
      ) {

        return msgRes.redirect(

          302,

          `${msgEventPageUrl}?msg_status=already`
        );
      }


      console.error(
        'msg participant insert error:',
        msgInsertError
      );


      return msgRes.redirect(

        302,

        `${msgEventPageUrl}?msg_status=server_error`
      );
    }



    /* =====================================================
       11. selection 사용 처리

       used=false인 경우에만 true로 변경
    ===================================================== */

    const {
      data: msgClaimedSelection,
      error: msgClaimError
    } = await msgSupabase

      .from('msg_event_selections')

      .update({
        used: true
      })

      .eq(
        'selection_id',
        msgSelectionId
      )

      .eq(
        'used',
        false
      )

      .select(
        'selection_id, used'
      )

      .maybeSingle();



    if (
      msgClaimError ||
      !msgClaimedSelection
    ) {

      console.error(
        'msg selection claim error:',
        msgClaimError
      );


      await msgSupabase

        .from('msg_event_participants')

        .update({

          status:
            'FAILED',

          error_message:
            'Selection claim failed',

          updated_at:
            new Date().toISOString()
        })

        .eq(
          'id',
          msgNewParticipant.id
        );


      return msgRes.redirect(

        302,

        `${msgEventPageUrl}?msg_status=selection_error`
      );
    }



    /* =====================================================
       12. Cafe24 관리자 토큰
    ===================================================== */

    const {
      data: msgCafe24Token,
      error: msgAdminTokenError
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
      msgAdminTokenError ||
      !msgCafe24Token
    ) {

      await msgReleaseSelection({
        msgSupabase,
        msgSelectionId
      });


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


      return msgRes.redirect(

        302,

        `${msgEventPageUrl}?msg_status=server_error`
      );
    }



    /* =====================================================
       13. 관리자 Access Token 만료 확인
    ===================================================== */

    let msgAdminAccessToken =
      msgCafe24Token.access_token;



    const msgExpiresAt =
      msgCafe24Token.access_token_expires_at

        ? new Date(
            msgCafe24Token.access_token_expires_at
          ).getTime()

        : null;



    const msgShouldRefresh =

      !msgExpiresAt ||

      msgExpiresAt <=
        Date.now() +
        (5 * 60 * 1000);



    /* =====================================================
       14. 필요하면 관리자 토큰 갱신
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


        await msgReleaseSelection({
          msgSupabase,
          msgSelectionId
        });


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


        return msgRes.redirect(

          302,

          `${msgEventPageUrl}?msg_status=server_error`
        );
      }
    }



    /* =====================================================
       15. 쿠폰 1차 발급
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
       16. 401이면 Refresh 후 딱 1회 재시도
    ===================================================== */

    if (
      msgCouponResponse.status === 401
    ) {

      try {

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
          !msgLatestToken?.refresh_token
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
      }
    }



    /* =====================================================
       17. 쿠폰 발급 실패
    ===================================================== */

    if (!msgCouponResponse.ok) {

      console.error(
        'msg coupon issue error:',
        msgCouponData
      );


      await msgReleaseSelection({
        msgSupabase,
        msgSelectionId
      });


      await msgSupabase

        .from('msg_event_participants')

        .update({

          status:
            'FAILED',

          result_code:
            msgResultCode,

          coupon_no:
            msgCouponNo,

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


      return msgRes.redirect(

        302,

        `${msgEventPageUrl}?msg_status=coupon_error`
      );
    }



    /* =====================================================
       18. 쿠폰 성공 → participant 완료
    ===================================================== */

    const {
      error: msgParticipantUpdateError
    } = await msgSupabase

      .from('msg_event_participants')

      .update({

        status:
          'ISSUED',

        result_code:
          msgResultCode,

        coupon_no:
          msgCouponNo,

        error_message:
          null,

        updated_at:
          new Date().toISOString()
      })

      .eq(
        'id',
        msgNewParticipant.id
      );



    if (msgParticipantUpdateError) {

      /*
       * 중요:
       * 쿠폰 자체는 이미 발급된 상태이므로
       * 여기서는 selection을 false로 돌리지 않습니다.
       */

      console.error(
        'msg participant update error:',
        msgParticipantUpdateError
      );


      return msgRes.redirect(

        302,

        `${msgEventPageUrl}?msg_status=db_update_error`
      );
    }



    /* =====================================================
       19. 성공 → 실제 이벤트 페이지 복귀
    ===================================================== */

    const msgRedirectUrl =
      new URL(
        msgEventPageUrl
      );


    msgRedirectUrl.searchParams.set(
      'msg_status',
      'success'
    );


    msgRedirectUrl.searchParams.set(
      'msg_result',
      msgResultCode
    );


    msgRedirectUrl.searchParams.set(
      'msg_result_name',
      msgResultName
    );



    return msgRes.redirect(
      302,
      msgRedirectUrl.toString()
    );



  } catch (msgError) {

    console.error(
      'msg customer callback error:',
      msgError
    );


    return msgRes.redirect(

      302,

      `${msgEventPageUrl}?msg_status=server_error`
    );
  }
}