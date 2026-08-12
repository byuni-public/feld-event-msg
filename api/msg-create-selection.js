import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';


/* =========================================================
   msg - 기본 설정
========================================================= */

const msgEventCode =
    'feld_chuseok_2026';


const msgCustomerRedirectUri =
    'https://feld-event-msg.vercel.app/api/msg-customer-callback';


const msgCustomerScope =
    'mall.read_customer_identifier';



export default async function handler(
    msgReq,
    msgRes
) {


    /* =========================================================
       msg - CORS 설정
    ========================================================= */

    msgRes.setHeader(
        'Access-Control-Allow-Origin',
        'https://feld.co.kr'
    );


    msgRes.setHeader(
        'Access-Control-Allow-Methods',
        'POST, OPTIONS'
    );


    msgRes.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type'
    );


    msgRes.setHeader(
        'Cache-Control',
        'no-store'
    );



    /* =========================================================
       msg - OPTIONS 사전 요청
    ========================================================= */

    if (msgReq.method === 'OPTIONS') {

        return msgRes
            .status(204)
            .end();

    }



    try {


        /* =====================================================
           1. POST만 허용
        ===================================================== */

        if (msgReq.method !== 'POST') {

            return msgRes.status(405).json({

                success: false,

                code:
                    'METHOD_NOT_ALLOWED',

                message:
                    '허용되지 않은 요청입니다.'

            });

        }



        /* =====================================================
           2. 환경변수
        ===================================================== */

        const msgSupabaseUrl =
            process.env.SUPABASE_URL;


        const msgSupabaseSecretKey =
            process.env.SUPABASE_SECRET_KEY;


        const msgClientId =
            process.env.CAFE24_CLIENT_ID;



        if (
            !msgSupabaseUrl ||
            !msgSupabaseSecretKey ||
            !msgClientId
        ) {

            console.error(
                'msg create selection env error',
                {
                    supabaseUrl:
                        Boolean(msgSupabaseUrl),

                    supabaseSecretKey:
                        Boolean(msgSupabaseSecretKey),

                    clientId:
                        Boolean(msgClientId)
                }
            );


            return msgRes.status(500).json({

                success: false,

                code:
                    'ENV_ERROR',

                message:
                    '서버 환경변수가 부족합니다.'

            });

        }



        /* =====================================================
           3. 카드 선택값
        ===================================================== */

        const msgCard1 =
            Number(
                msgReq.body?.card_1
            );


        const msgCard2 =
            Number(
                msgReq.body?.card_2
            );



        /* =====================================================
           4. 카드값 검증
        ===================================================== */

        if (
            !Number.isInteger(msgCard1) ||
            !Number.isInteger(msgCard2) ||

            msgCard1 < 1 ||
            msgCard1 > 10 ||

            msgCard2 < 1 ||
            msgCard2 > 10
        ) {

            return msgRes.status(400).json({

                success: false,

                code:
                    'INVALID_CARD',

                message:
                    '올바른 카드를 선택해주세요.'

            });

        }



        /* =====================================================
           5. 같은 카드 선택 방지
        ===================================================== */

        if (
            msgCard1 === msgCard2
        ) {

            return msgRes.status(400).json({

                success: false,

                code:
                    'SAME_CARD',

                message:
                    '서로 다른 카드 2장을 선택해주세요.'

            });

        }



        /* =====================================================
           6. 작은 번호부터 정렬

           8 + 3
           ↓
           3 + 8
        ===================================================== */

        const [
            msgSortedCard1,
            msgSortedCard2

        ] = [

            msgCard1,
            msgCard2

        ].sort(
            (a, b) =>
                a - b
        );



        /* =====================================================
           7. Selection ID 생성
        ===================================================== */

        const msgSelectionId =

            crypto
                .randomBytes(24)
                .toString('hex');



        /* =====================================================
           8. Supabase 연결
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
           9. 선택정보 저장
        ===================================================== */

        const {
            data: msgSelectionData,
            error: msgInsertError

        } = await msgSupabase

            .from(
                'msg_event_selections'
            )

            .insert({

                selection_id:
                    msgSelectionId,

                event_code:
                    msgEventCode,

                card_1:
                    msgSortedCard1,

                card_2:
                    msgSortedCard2,

                used:
                    false

            })

            .select(
                'id, selection_id, card_1, card_2'
            )

            .single();



        /* =====================================================
           10. DB 저장 실패
        ===================================================== */

        if (msgInsertError) {

            console.error(
                'msg selection insert error:',
                msgInsertError
            );


            return msgRes.status(500).json({

                success: false,

                code:
                    'DB_ERROR',

                message:
                    '선택 정보 저장에 실패했습니다.',

                error: {

                    code:
                        msgInsertError.code || null,

                    message:
                        msgInsertError.message || null

                }

            });

        }



        /* =====================================================
           11. Cafe24 Customer OAuth URL 직접 생성

           기존에는:
           create-selection
           → customer-auth
           → Cafe24

           이제는:
           create-selection
           → Cafe24

           로 바로 이동합니다.
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
                msgCustomerScope
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
           12. 로그
        ===================================================== */

        console.log(
            'msg ========================================'
        );


        console.log(
            'msg SELECTION CREATED'
        );


        console.log(
            'msg selection id:',
            msgSelectionId
        );


        console.log(
            'msg cards:',
            msgSortedCard1,
            msgSortedCard2
        );


        console.log(
            'msg DIRECT OAUTH URL:',
            msgAuthorizeUrl
        );


        console.log(
            'msg ========================================'
        );



        /* =====================================================
           13. 성공

           중요:
           next_url이 더 이상 msg-customer-auth가 아니라
           Cafe24 OAuth 주소입니다.
        ===================================================== */

        return msgRes.status(200).json({

            success: true,

            code:
                'SELECTION_CREATED',

            message:
                '카드 선택 정보가 저장되었습니다.',

            selection_id:
                msgSelectionId,

            card_1:
                msgSortedCard1,

            card_2:
                msgSortedCard2,

            next_url:
                msgAuthorizeUrl

        });



    } catch (msgError) {


        console.error(
            'msg create selection error:',
            msgError
        );


        return msgRes.status(500).json({

            success: false,

            code:
                'SERVER_ERROR',

            message:
                '서버 오류가 발생했습니다.',

            error:
                msgError?.message || null

        });

    }

}