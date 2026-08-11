import { createClient } from '@supabase/supabase-js';


/* =========================================================
   msg - 이벤트 기본 설정
========================================================= */

const msgEventCode =
  'feld_chuseok_2026';


const msgEventPageUrl =
  'https://feld.co.kr/msg/26chuseok.html';


/*
 * Cafe24 Developers에 등록한
 * Customer OAuth Redirect URI
 */

const msgCustomerRedirectUri =
  'https://feld-event-msg.vercel.app/api/msg-customer-callback';



/* =========================================================
   msg - 메인 Customer OAuth 시작
========================================================= */

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


    /*
     * msg-create-selection.js에서
     *
     * crypto.randomBytes(24).toString('hex')
     *
     * 로 만들기 때문에
     * 정상 selection_id는 48자리 hex
     */

    if (
      !msgSelectionId ||
      !/^[a-f0-9]{48}$/i.test(
        msgSelectionId
      )
    ) {

      console.error(
        'msg invalid selection id:',
        msgSelectionId
      );


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
        'msg customer auth env error',
        {
          clientId:
            Boolean(msgClientId),

          supabaseUrl:
            Boolean(msgSupabaseUrl),

          supabaseSecretKey:
            Boolean(msgSupabaseSecretKey)
        }
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
            persistSession: false,
            autoRefreshToken: false
          }
        }
      );



    /* =====================================================
       4. selection 실제 존재 여부 확인
    ===================================================== */

    const {
      data: msgSelection,
      error: msgSelectionError
    } = await msgSupabase

      .from(
        'msg_event_selections'
      )

      .select(
        `
        selection_id,
        event_code,
        card_1,
        card_2,
        used,
        created_at
        `
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



    if (msgSelectionError) {

      console.error(
        'msg selection lookup DB error:',
        msgSelectionError
      );


      return msgRes.redirect(
        302,
        `${msgEventPageUrl}?msg_status=selection_error`
      );
    }



    if (!msgSelection) {

      console.error(
        'msg selection not found:',
        msgSelectionId
      );


      return msgRes.redirect(
        302,
        `${msgEventPageUrl}?msg_status=selection_error`
      );
    }



    /* =====================================================
       5. 이미 사용된 selection 확인
    ===================================================== */

    if (msgSelection.used) {

      console.log(
        'msg selection already used:',
        msgSelectionId
      );


      return msgRes.redirect(
        302,
        `${msgEventPageUrl}?msg_status=used`
      );
    }



    /* =====================================================
       6. Cafe24 Customer OAuth URL 생성

       중요:
       URLSearchParams를 사용하지 않고
       각 파라미터를 직접 분리해서 만듭니다.

       redirect_uri는 반드시 마지막에 둡니다.
    ===================================================== */

    const msgAuthorizeUrl =

      'https://feld.co.kr/api/v2/oauth/authorize' +

      '?response_type=code' +

      '&client_id=' +
      encodeURIComponent(
        msgClientId
      ) +

      '&scope=' +
      encodeURIComponent(
        'mall.read_customer_identifier'
      ) +

      '&state=' +
      encodeURIComponent(
        msgSelectionId
      ) +

      '&redirect_uri=' +
      encodeURIComponent(
        msgCustomerRedirectUri
      );



    /* =====================================================
       7. 디버깅 로그

       정상이라면 Vercel 로그에서:

       &scope=...
       &state=...
       &redirect_uri=...

       이렇게 각각 분리되어 보여야 합니다.
    ===================================================== */

    console.log(
      'msg ========================================'
    );


    console.log(
      'msg CUSTOMER OAUTH START'
    );


    console.log(
      'msg selection id:',
      msgSelectionId
    );


    console.log(
      'msg selected cards:',
      msgSelection.card_1,
      msgSelection.card_2
    );


    console.log(
      'msg customer redirect uri:',
      msgCustomerRedirectUri
    );


    console.log(
      'msg FINAL AUTHORIZE URL:',
      msgAuthorizeUrl
    );


    console.log(
      'msg ========================================'
    );



    /* =====================================================
       8. Cafe24 회원 로그인 / OAuth 페이지 이동
    ===================================================== */

    return msgRes.redirect(
      302,
      msgAuthorizeUrl
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
