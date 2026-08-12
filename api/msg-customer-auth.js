import { createClient } from '@supabase/supabase-js';


/* =========================================================
   msg - 기본 설정
========================================================= */

const msgEventCode =
    'feld_chuseok_2026';


const msgEventPageUrl =
    'https://feld.co.kr/msg/26chuseok.html';


const msgCustomerRedirectUri =
    'https://feld-event-msg.vercel.app/api/msg-customer-callback';



/* =========================================================
   msg - Customer OAuth 시작
========================================================= */

export default async function handler(
    msgReq,
    msgRes
) {

    try {

        /* =====================================================
           1. GET 요청만 허용
        ===================================================== */

        if (msgReq.method !== 'GET') {

            return msgRes.status(405).json({
                error: 'Method not allowed'
            });

        }



        /* =====================================================
           2. selection_id 확인
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
         * 형태로 생성했기 때문에
         * 48자리 HEX 값만 허용
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
           3. 환경변수 확인
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
                'msg missing environment variables',
                {
                    msgClientId:
                        Boolean(msgClientId),

                    msgSupabaseUrl:
                        Boolean(msgSupabaseUrl),

                    msgSupabaseSecretKey:
                        Boolean(msgSupabaseSecretKey)
                }
            );


            return msgRes.redirect(
                302,
                `${msgEventPageUrl}?msg_status=server_error`
            );

        }



        /* =====================================================
           4. Supabase 연결
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
           5. 선택정보 확인
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
                'msg selection lookup error:',
                msgSelectionError
            );


            return msgRes.redirect(
                302,
                `${msgEventPageUrl}?msg_status=selection_error`
            );

        }



        /* =====================================================
           6. selection 존재 여부
        ===================================================== */

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
           7. 이미 사용된 selection인지 확인
        ===================================================== */

        if (msgSelection.used === true) {

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
           8. Cafe24 Customer OAuth URL 생성

           중요:
           redirect_uri 안에 scope/state가 포함되지 않도록
           URLSearchParams를 사용하지 않고 직접 생성합니다.

           각각 완전히 독립된 Query Parameter입니다.
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
           9. 로그 확인용
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
            'msg card 1:',
            msgSelection.card_1
        );


        console.log(
            'msg card 2:',
            msgSelection.card_2
        );


        console.log(
            'msg redirect uri:',
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
           10. Cafe24 OAuth 로그인 페이지로 이동
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