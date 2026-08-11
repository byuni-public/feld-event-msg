import { createClient } from '@supabase/supabase-js';


/* =========================================================
   msg - 이벤트 설정
========================================================= */

const msgEventCode =
  'feld_chuseok_2026';


const msgEventPageUrl =
  'https://feld.co.kr/msg/26chuseok.html';


const msgCustomerRedirectUri =
  'https://feld-event-msg.vercel.app/api/msg-customer-callback';



export default async function handler(
  msgReq,
  msgRes
) {

  try {

    /* =====================================================
       1. selection_id 확인
    ===================================================== */

    const msgSelectionId =
      String(
        msgReq.query.selection_id || ''
      ).trim();


    if (!msgSelectionId) {

      return msgRes.redirect(
        302,
        `${msgEventPageUrl}?msg_status=selection_error`
      );
    }


    if (
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


    const msgSupabaseUrl =
      process.env.SUPABASE_URL;


    const msgSupabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY;


    if (
      !msgClientId ||
      !msgSupabaseUrl ||
      !msgSupabaseSecretKey
    ) {

      console.error(
        'msg customer auth env error'
      );


      return msgRes.redirect(
        302,
        `${msgEventPageUrl}?msg_status=server_error`
      );
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

      .from(
        'msg_event_selections'
      )

      .select(
        'selection_id, event_code, card_1, card_2, used'
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
        'msg selection auth lookup error:',
        msgSelectionError
      );


      return msgRes.redirect(
        302,
        `${msgEventPageUrl}?msg_status=selection_error`
      );
    }



    /* =====================================================
       5. 이미 사용된 selection
    ===================================================== */

    if (msgSelection.used) {

      return msgRes.redirect(
        302,
        `${msgEventPageUrl}?msg_status=used`
      );
    }



    /* =====================================================
       6. Cafe24 Customer OAuth 주소 생성
    ===================================================== */

    const msgAuthorizeUrl =
      new URL(
        'https://feld.co.kr/api/v2/oauth/authorize'
      );


    msgAuthorizeUrl.searchParams.set(
      'response_type',
      'code'
    );


    msgAuthorizeUrl.searchParams.set(
      'client_id',
      msgClientId
    );


    /*
     * 중요:
     * Cafe24 Developers에 등록된 URI와
     * 반드시 완전히 동일해야 합니다.
     */

    msgAuthorizeUrl.searchParams.set(
      'redirect_uri',
      msgCustomerRedirectUri
    );


    msgAuthorizeUrl.searchParams.set(
      'scope',
      'mall.read_customer_identifier'
    );


    /*
     * 선택정보를 OAuth 이후에도
     * 유지하기 위해 selection_id를 state로 전달
     */

    msgAuthorizeUrl.searchParams.set(
      'state',
      msgSelectionId
    );



    console.log(
      'msg customer oauth redirect uri:',
      msgCustomerRedirectUri
    );


    /* =====================================================
       7. Cafe24 회원 인증으로 이동
    ===================================================== */

    console.log(
      'msg FINAL AUTHORIZE URL:',
      msgAuthorizeUrl.toString()
    );

    console.log(
      'msg FINAL REDIRECT URI:',
      msgCustomerRedirectUri
    );

    return msgRes.redirect(
      302,
      msgAuthorizeUrl.toString()
    );


  } catch (msgError) {

    console.error(
      'msg customer auth error:',
      msgError
    );


    return msgRes.redirect(
      302,
      `${msgEventPageUrl}?msg_status=server_error`
    );
  }
}