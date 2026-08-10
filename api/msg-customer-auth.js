import { createClient } from '@supabase/supabase-js';


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

      return msgRes.status(400).json({
        success: false,
        code: 'NO_SELECTION_ID',
        message: '카드 선택 정보가 없습니다.'
      });
    }


    /*
     * msg-create-selection에서
     * randomBytes(24).toString('hex')
     * 로 만들었으므로 48자리 hex인지 확인
     */

    if (
      !/^[a-f0-9]{48}$/i.test(
        msgSelectionId
      )
    ) {

      return msgRes.status(400).json({
        success: false,
        code: 'INVALID_SELECTION_ID',
        message: '잘못된 카드 선택 정보입니다.'
      });
    }



    /* =====================================================
       2. 환경변수
    ===================================================== */

    const msgClientId =
      process.env.CAFE24_CLIENT_ID;


    const msgRedirectUri =
      process.env.CAFE24_CUSTOMER_REDIRECT_URI;


    const msgSupabaseUrl =
      process.env.SUPABASE_URL;


    const msgSupabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY;



    if (
      !msgClientId ||
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
       4. 실제 존재하는 선택인지 확인
    ===================================================== */

    const {
      data: msgSelection,
      error: msgSelectionError
    } = await msgSupabase

      .from('msg_event_selections')

      .select(
        'selection_id, event_code, card_1, card_2, used'
      )

      .eq(
        'selection_id',
        msgSelectionId
      )

      .eq(
        'event_code',
        'feld_chuseok_2026'
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


      return msgRes.status(400).json({
        success: false,
        code: 'SELECTION_NOT_FOUND',
        message: '카드 선택 정보를 확인할 수 없습니다.'
      });
    }



    if (msgSelection.used) {

      return msgRes.redirect(
        302,
        'https://feld.co.kr/msg/26chuseok.html?msg_status=used'
      );
    }



    /* =====================================================
       5. Cafe24 Customer OAuth 주소 생성

       selection_id를 state로 전달
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


    msgAuthorizeUrl.searchParams.set(
      'redirect_uri',
      msgRedirectUri
    );


    msgAuthorizeUrl.searchParams.set(
      'scope',
      'mall.read_customer_identifier'
    );


    msgAuthorizeUrl.searchParams.set(
      'state',
      msgSelectionId
    );



    /* =====================================================
       6. Cafe24 회원 인증 페이지로 이동
    ===================================================== */

    return msgRes.redirect(
      302,
      msgAuthorizeUrl.toString()
    );


  } catch (msgError) {

    console.error(
      'msg customer auth error:',
      msgError
    );


    return msgRes.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: '회원 인증 준비 중 오류가 발생했습니다.'
    });
  }
}