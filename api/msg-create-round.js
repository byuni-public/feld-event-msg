import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';


/* =========================================================
   msg - 기본 설정
========================================================= */

const msgEventCode =
    'feld_chuseok_2026';


const msgAllowedOrigin =
    'https://feld.co.kr';


const msgRoundExpireMinutes =
    10;



/* =========================================================
   msg - 보안 랜덤 셔플
========================================================= */

function msgSecureShuffle(
    msgArray
) {

    const msgShuffled =
        [...msgArray];


    for (
        let msgIndex =
            msgShuffled.length - 1;

        msgIndex > 0;

        msgIndex--
    ) {

        const msgRandomIndex =
            crypto.randomInt(
                0,
                msgIndex + 1
            );


        [
            msgShuffled[msgIndex],
            msgShuffled[msgRandomIndex]

        ] = [

            msgShuffled[msgRandomIndex],
            msgShuffled[msgIndex]

        ];

    }


    return msgShuffled;
}



/* =========================================================
   msg - API
========================================================= */

export default async function handler(
    msgReq,
    msgRes
) {


    /* =====================================================
       CORS
    ===================================================== */

    msgRes.setHeader(
        'Access-Control-Allow-Origin',
        msgAllowedOrigin
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



    if (
        msgReq.method ===
        'OPTIONS'
    ) {

        return msgRes
            .status(204)
            .end();

    }



    try {


        /* =================================================
           1. POST만 허용
        ================================================= */

        if (
            msgReq.method !==
            'POST'
        ) {

            return msgRes.status(405).json({

                success: false,

                code:
                    'METHOD_NOT_ALLOWED',

                message:
                    '허용되지 않은 요청입니다.'

            });

        }



        /* =================================================
           2. 환경변수
        ================================================= */

        const msgSupabaseUrl =
            process.env.SUPABASE_URL;


        const msgSupabaseSecretKey =
            process.env.SUPABASE_SECRET_KEY;



        if (
            !msgSupabaseUrl ||
            !msgSupabaseSecretKey
        ) {

            console.error(
                'msg create round env error'
            );


            return msgRes.status(500).json({

                success: false,

                code:
                    'ENV_ERROR',

                message:
                    '서버 설정 오류입니다.'

            });

        }



        /* =================================================
           3. Supabase 연결
        ================================================= */

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



        /* =================================================
           4. 카드 1~10 생성
        ================================================= */

        const msgCardValues =
            [
                1, 2, 3, 4, 5,
                6, 7, 8, 9, 10
            ];



        /* =================================================
           5. crypto 기반 랜덤 셔플
        ================================================= */

        const msgCardOrder =
            msgSecureShuffle(
                msgCardValues
            );



        /* =================================================
           6. round_id 생성
        ================================================= */

        const msgRoundId =

            crypto
                .randomBytes(24)
                .toString('hex');



        /* =================================================
           7. 만료시간
        ================================================= */

        const msgExpiresAt =
            new Date(

                Date.now() +

                (
                    msgRoundExpireMinutes *
                    60 *
                    1000
                )

            ).toISOString();



        /* =================================================
           8. DB 저장

           card_order는 서버 DB에만 저장합니다.
           브라우저에는 반환하지 않습니다.
        ================================================= */

        const {
            data: msgRoundData,
            error: msgRoundInsertError

        } = await msgSupabase

            .from(
                'msg_event_rounds'
            )

            .insert({

                round_id:
                    msgRoundId,

                event_code:
                    msgEventCode,

                card_order:
                    msgCardOrder,

                used:
                    false,

                expires_at:
                    msgExpiresAt

            })

            .select(
                'round_id, expires_at'
            )

            .single();



        if (
            msgRoundInsertError
        ) {

            console.error(
                'msg round insert error:',
                msgRoundInsertError
            );


            return msgRes.status(500).json({

                success: false,

                code:
                    'DB_ERROR',

                message:
                    '카드 준비에 실패했습니다.'

            });

        }



        /* =================================================
           9. 브라우저에는 실제 카드값을 절대 안 보냄
        ================================================= */

        return msgRes.status(200).json({

            success: true,

            code:
                'ROUND_CREATED',

            round_id:
                msgRoundData.round_id,

            expires_at:
                msgRoundData.expires_at,

            card_count:
                10

        });



    } catch (msgError) {

        console.error(
            'msg create round error:',
            msgError
        );


        return msgRes.status(500).json({

            success: false,

            code:
                'SERVER_ERROR',

            message:
                '서버 오류가 발생했습니다.'

        });

    }

}