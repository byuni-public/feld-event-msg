import { createClient } from '@supabase/supabase-js';


/* =========================================================
   msg - 이벤트 기본 설정
========================================================= */

const msgEventCode =
  'feld_chuseok_2026';


const msgEventPageUrl =
  'https://feld.co.kr/msg/26chuseok.html';


/*
 * 현재 테스트용 공통 쿠폰
 *
 * 나중에 아래 msgResultSettings에서
 * 족보마다 다른 couponNo를 넣으면 됩니다.
 */

const msgDefaultCouponNo =
  '6085943114800000356';



/* =========================================================
   msg - 45개 전체 족보 조합
========================================================= */

const msgCombinationMap = {

  /* =====================================================
     광땡
  ===================================================== */

  '3-8': '38_GWANG_DDAENG',
  '1-8': '18_GWANG_DDAENG',
  '1-3': '13_GWANG_DDAENG',


  /* =====================================================
     특수 족보
  ===================================================== */

  '1-2': 'ALI',
  '1-4': 'DOKSA',
  '1-9': 'GUBBING',
  '1-10': 'JANGBBING',
  '4-10': 'JANGSA',
  '4-6': 'SSERYUK',


  /* =====================================================
     갑오
  ===================================================== */

  '2-7': 'GABO',
  '3-6': 'GABO',
  '4-5': 'GABO',
  '9-10': 'GABO',


  /* =====================================================
     8끗
  ===================================================== */

  '1-7': '8_KKEUT',
  '2-6': '8_KKEUT',
  '3-5': '8_KKEUT',
  '8-10': '8_KKEUT',


  /* =====================================================
     7끗
  ===================================================== */

  '1-6': '7_KKEUT',
  '2-5': '7_KKEUT',
  '3-4': '7_KKEUT',
  '7-10': '7_KKEUT',
  '8-9': '7_KKEUT',


  /* =====================================================
     6끗
  ===================================================== */

  '1-5': '6_KKEUT',
  '2-4': '6_KKEUT',
  '6-10': '6_KKEUT',
  '7-9': '6_KKEUT',


  /* =====================================================
     5끗
  ===================================================== */

  '2-3': '5_KKEUT',
  '5-10': '5_KKEUT',
  '6-9': '5_KKEUT',
  '7-8': '5_KKEUT',


  /* =====================================================
     4끗
  ===================================================== */

  '5-9': '4_KKEUT',
  '6-8': '4_KKEUT',


  /* =====================================================
     3끗
  ===================================================== */

  '3-10': '3_KKEUT',
  '4-9': '3_KKEUT',
  '5-8': '3_KKEUT',
  '6-7': '3_KKEUT',


  /* =====================================================
     2끗
  ===================================================== */

  '2-10': '2_KKEUT',
  '3-9': '2_KKEUT',
  '4-8': '2_KKEUT',
  '5-7': '2_KKEUT',


  /* =====================================================
     1끗
  ===================================================== */

  '2-9': '1_KKEUT',
  '4-7': '1_KKEUT',
  '5-6': '1_KKEUT',


  /* =====================================================
     망통
  ===================================================== */

  '2-8': 'MANGTONG',
  '3-7': 'MANGTONG'

};



/* =========================================================
   msg - 족보별 혜택 설정

   ★ 나중에 여기만 수정하시면 됩니다.

   name
   → 결과 팝업에 보이는 족보명

   description
   → 결과 설명/운세 문구

   benefit
   → 실제 혜택 문구

   couponNo
   → 실제 Cafe24 쿠폰번호
========================================================= */

const msgResultSettings = {

  '38_GWANG_DDAENG': {
    name: '38광땡',
    description: '',
    benefit: '',
    couponNo: msgDefaultCouponNo
  },

  '18_GWANG_DDAENG': {
    name: '18광땡',
    description: '',
    benefit: '',
    couponNo: msgDefaultCouponNo
  },

  '13_GWANG_DDAENG': {
    name: '13광땡',
    description: '',
    benefit: '',
    couponNo: msgDefaultCouponNo
  },

  'ALI': {
    name: '알리',
    description: '',
    benefit: '',
    couponNo: msgDefaultCouponNo
  },

  'DOKSA': {
    name: '독사',
    description: '',
    benefit: '',
    couponNo: msgDefaultCouponNo
  },

  'GUBBING': {
    name: '구삥',
    description: '',
    benefit: '',
    couponNo: msgDefaultCouponNo
  },

  'JANGBBING': {
    name: '장삥',
    description: '',
    benefit: '',
    couponNo: msgDefaultCouponNo
  },

  'JANGSA': {
    name: '장사',
    description: '',
    benefit: '',
    couponNo: msgDefaultCouponNo
  },

  'SSERYUK': {
    name: '세륙',
    description: '',
    benefit: '',
    couponNo: msgDefaultCouponNo
  },

  'GABO': {
    name: '갑오',
    description: '',
    benefit: '',
    couponNo: msgDefaultCouponNo
  },

  '8_KKEUT': {
    name: '8끗',
    description: '',
    benefit: '',
    couponNo: msgDefaultCouponNo
  },

  '7_KKEUT': {
    name: '7끗',
    description: '',
    benefit: '',
    couponNo: msgDefaultCouponNo
  },

  '6_KKEUT': {
    name: '6끗',
    description: '',
    benefit: '',
    couponNo: msgDefaultCouponNo
  },

  '5_KKEUT': {
    name: '5끗',
    description: '',
    benefit: '',
    couponNo: msgDefaultCouponNo
  },

  '4_KKEUT': {
    name: '4끗',
    description: '',
    benefit: '',
    couponNo: msgDefaultCouponNo
  },

  '3_KKEUT': {
    name: '3끗',
    description: '',
    benefit: '',
    couponNo: msgDefaultCouponNo
  },

  '2_KKEUT': {
    name: '2끗',
    description: '',
    benefit: '',
    couponNo: msgDefaultCouponNo
  },

  '1_KKEUT': {
    name: '1끗',
    description: '',
    benefit: '',
    couponNo: msgDefaultCouponNo
  },

  'MANGTONG': {
    name: '망통',
    description: '',
    benefit: '',
    couponNo: msgDefaultCouponNo
  }

};



/* =========================================================
   msg - 카드 조합 결과 판정
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


  const msgResultCode =
    msgCombinationMap[
      msgCombinationKey
    ];


  if (!msgResultCode) {

    throw new Error(
      `INVALID_CARD_COMBINATION: ${msgCombinationKey}`
    );
  }


  const msgResultSetting =
    msgResultSettings[
      msgResultCode
    ];


  if (!msgResultSetting) {

    throw new Error(
      `RESULT_SETTING_NOT_FOUND: ${msgResultCode}`
    );
  }


  return {

    code:
      msgResultCode,

    name:
      msgResultSetting.name,

    description:
      msgResultSetting.description,

    benefit:
      msgResultSetting.benefit,

    couponNo:
      msgResultSetting.couponNo,

    card1:
      msgFirst,

    card2:
      msgSecond
  };
}



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
   msg - selection used=false 원복
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
       1. OAuth code + selection state
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

      return msgRes.redirect(
        302,
        `${msgEventPageUrl}?msg_status=auth_error`
      );
    }


    if (
      !msgSelectionId ||
      !/^[a-f0-9]{48}$/i.test(
        msgSelectionId
      )
    ) {

      return msgRes.redirect(
        302,
        `${msgEventPageUrl}?msg_status=selection_error`
      );
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

      return msgRes.redirect(
        302,
        `${msgEventPageUrl}?msg_status=server_error`
      );
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
       4. 선택정보 조회
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
        'msg selection error:',
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
       5. 방금 선택한 카드 족보 계산
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


    const msgResultDescription =
      msgResult.description;


    const msgResultBenefit =
      msgResult.benefit;


    const msgCouponNo =
      msgResult.couponNo;



    /* =====================================================
       6. Customer Access Token 발급
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
       7. 실제 Cafe24 회원 ID
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
       8. 회원 고유식별자
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
       9. 기존 참여 여부
    ===================================================== */

    const {
      data: msgExistingParticipant,
      error: msgParticipantSelectError
    } = await msgSupabase

      .from('msg_event_participants')

      .select(
        'id, status, result_code, coupon_no, participated_at'
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
        'msg participant select error:',
        msgParticipantSelectError
      );


      return msgRes.redirect(
        302,
        `${msgEventPageUrl}?msg_status=server_error`
      );
    }



    /* =====================================================
       10. 이미 참여한 회원

       쿠폰 재발급 X

       하지만 방금 뽑은 카드와
       이번 족보 결과는 보여줍니다.
    ===================================================== */

    if (msgExistingParticipant) {

      const {
        error: msgAlreadySelectionError
      } = await msgSupabase

        .from('msg_event_selections')

        .update({
          used: true
        })

        .eq(
          'selection_id',
          msgSelectionId
        );


      if (msgAlreadySelectionError) {

        console.error(
          'msg already selection update error:',
          msgAlreadySelectionError
        );
      }


      const msgAlreadyRedirectUrl =
        new URL(
          msgEventPageUrl
        );


      msgAlreadyRedirectUrl.searchParams.set(
        'msg_status',
        'already'
      );


      msgAlreadyRedirectUrl.searchParams.set(
        'msg_result',
        msgResultCode
      );


      msgAlreadyRedirectUrl.searchParams.set(
        'msg_result_name',
        msgResultName
      );


      msgAlreadyRedirectUrl.searchParams.set(
        'msg_card1',
        String(
          msgResult.card1
        )
      );


      msgAlreadyRedirectUrl.searchParams.set(
        'msg_card2',
        String(
          msgResult.card2
        )
      );


      if (msgResultDescription) {

        msgAlreadyRedirectUrl.searchParams.set(
          'msg_description',
          msgResultDescription
        );
      }


      if (msgResultBenefit) {

        msgAlreadyRedirectUrl.searchParams.set(
          'msg_benefit',
          msgResultBenefit
        );
      }


      return msgRes.redirect(
        302,
        msgAlreadyRedirectUrl.toString()
      );
    }



    /* =====================================================
       11. 최초 참여 PROCESSING 기록
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

        const msgDuplicateRedirectUrl =
          new URL(
            msgEventPageUrl
          );


        msgDuplicateRedirectUrl.searchParams.set(
          'msg_status',
          'already'
        );


        msgDuplicateRedirectUrl.searchParams.set(
          'msg_result',
          msgResultCode
        );


        msgDuplicateRedirectUrl.searchParams.set(
          'msg_result_name',
          msgResultName
        );


        msgDuplicateRedirectUrl.searchParams.set(
          'msg_card1',
          String(msgResult.card1)
        );


        msgDuplicateRedirectUrl.searchParams.set(
          'msg_card2',
          String(msgResult.card2)
        );


        return msgRes.redirect(
          302,
          msgDuplicateRedirectUrl.toString()
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
       12. selection 사용 처리
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
       13. 관리자 토큰 조회
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
       14. 관리자 토큰 만료 확인
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
       15. 필요하면 관리자 토큰 갱신
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
       16. 쿠폰 발급 1차
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
       17. 401 → 토큰갱신 후 1회 재시도
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
       18. 쿠폰 발급 실패
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
       19. 쿠폰 성공 → participant 완료
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

      console.error(
        'msg participant update error:',
        msgParticipantUpdateError
      );


      /*
       * 쿠폰 자체는 이미 발급됐으므로
       * selection을 false로 되돌리지 않습니다.
       */

      return msgRes.redirect(
        302,
        `${msgEventPageUrl}?msg_status=db_update_error`
      );
    }



    /* =====================================================
       20. 성공 → 결과페이지 복귀
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


    msgRedirectUrl.searchParams.set(
      'msg_card1',
      String(
        msgResult.card1
      )
    );


    msgRedirectUrl.searchParams.set(
      'msg_card2',
      String(
        msgResult.card2
      )
    );


    if (msgResultDescription) {

      msgRedirectUrl.searchParams.set(
        'msg_description',
        msgResultDescription
      );
    }


    if (msgResultBenefit) {

      msgRedirectUrl.searchParams.set(
        'msg_benefit',
        msgResultBenefit
      );
    }


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