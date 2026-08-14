import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';


/* =========================================================
   msg - 기본 설정
========================================================= */

const msgEventCode =
    'feld_chuseok_2026';


const msgAllowedOrigin =
    'https://feld.co.kr';



/* =========================================================
   msg - Supabase
========================================================= */

const msgSupabase =
    createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SECRET_KEY,
        {
            auth: {
                persistSession: false
            }
        }
    );



/* =========================================================
   msg - 응답
========================================================= */

function msgSendJson(
    res,
    msgStatus,
    msgData
) {

    res.status(
        msgStatus
    ).json(
        msgData
    );

}



/* =========================================================
   msg - selection ID 검사
========================================================= */

function msgIsValidSelectionId(
    msgSelectionId
) {

    /*
     * 현재 selection_id가
     * crypto.randomBytes 기반 48자리 hex라는 전제
     *
     * 혹시 현재 selection ID 길이가 다르더라도
     * 영숫자/하이픈 형태는 아래에서 허용
     */

    if (
        typeof msgSelectionId !==
        'string'
    ) {

        return false;

    }


    if (
        msgSelectionId.length < 20 ||
        msgSelectionId.length > 100
    ) {

        return false;

    }


    return /^[a-zA-Z0-9_-]+$/.test(
        msgSelectionId
    );

}



/* =========================================================
   msg - API
========================================================= */

export default async function handler(
    req,
    res
) {

    /* =====================================================
       msg - CORS
    ===================================================== */

    res.setHeader(
        'Access-Control-Allow-Origin',
        msgAllowedOrigin
    );


    res.setHeader(
        'Access-Control-Allow-Methods',
        'POST, OPTIONS'
    );


    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type'
    );


    res.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate'
    );



    if (
        req.method ===
        'OPTIONS'
    ) {

        return res
            .status(204)
            .end();

    }



    if (
        req.method !==
        'POST'
    ) {

        return msgSendJson(
            res,
            405,
            {
                success: false,
                code: 'METHOD_NOT_ALLOWED'
            }
        );

    }



    try {

        /* =================================================
           msg - selection_id
        ================================================= */

        const msgSelectionId =
            String(
                req.body?.selection_id ||
                ''
            ).trim();



        if (
            !msgIsValidSelectionId(
                msgSelectionId
            )
        ) {

            return msgSendJson(
                res,
                400,
                {
                    success: false,
                    code: 'INVALID_SELECTION_ID'
                }
            );

        }



        /* =================================================
           msg - 선택 정보 조회

           used=true가 된 selection만 공개 가능
        ================================================= */

        const {
            data:
                msgSelection,

            error:
                msgSelectionError

        } =
            await msgSupabase
                .from(
                    'msg_event_selections'
                )
                .select(
                    `
                    selection_id,
                    event_code,
                    round_id,
                    card_1,
                    card_2,
                    used
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



        if (
            msgSelectionError
        ) {

            console.error(
                'msg reveal selection query error:',
                msgSelectionError
            );


            return msgSendJson(
                res,
                500,
                {
                    success: false,
                    code: 'SELECTION_QUERY_FAILED'
                }
            );

        }



        if (
            !msgSelection
        ) {

            return msgSendJson(
                res,
                404,
                {
                    success: false,
                    code: 'SELECTION_NOT_FOUND'
                }
            );

        }



        /* =================================================
           msg - 결과 확정 전에는 공개 금지
        ================================================= */

        if (
            msgSelection.used !==
            true
        ) {

            return msgSendJson(
                res,
                403,
                {
                    success: false,
                    code: 'SELECTION_NOT_REVEALED'
                }
            );

        }



        if (
            !msgSelection.round_id
        ) {

            return msgSendJson(
                res,
                404,
                {
                    success: false,
                    code: 'ROUND_ID_NOT_FOUND'
                }
            );

        }



        /* =================================================
           msg - 실제 랜덤 배열 조회
        ================================================= */

        const {
            data:
                msgRound,

            error:
                msgRoundError

        } =
            await msgSupabase
                .from(
                    'msg_event_rounds'
                )
                .select(
                    `
                    round_id,
                    card_order,
                    used
                    `
                )
                .eq(
                    'round_id',
                    msgSelection.round_id
                )
                .eq(
                    'event_code',
                    msgEventCode
                )
                .maybeSingle();



        if (
            msgRoundError
        ) {

            console.error(
                'msg reveal round query error:',
                msgRoundError
            );


            return msgSendJson(
                res,
                500,
                {
                    success: false,
                    code: 'ROUND_QUERY_FAILED'
                }
            );

        }



        if (
            !msgRound
        ) {

            return msgSendJson(
                res,
                404,
                {
                    success: false,
                    code: 'ROUND_NOT_FOUND'
                }
            );

        }



        /* =================================================
           msg - 카드 배열 검사
        ================================================= */

        const msgCardOrder =
            msgRound.card_order;



        if (
            !Array.isArray(
                msgCardOrder
            ) ||
            msgCardOrder.length !== 10
        ) {

            return msgSendJson(
                res,
                500,
                {
                    success: false,
                    code: 'INVALID_CARD_ORDER'
                }
            );

        }



        const msgValidCards =
            msgCardOrder.every(
                (
                    msgCard
                ) =>
                    Number.isInteger(
                        Number(
                            msgCard
                        )
                    ) &&
                    Number(
                        msgCard
                    ) >= 1 &&
                    Number(
                        msgCard
                    ) <= 10
            );



        if (
            !msgValidCards
        ) {

            return msgSendJson(
                res,
                500,
                {
                    success: false,
                    code: 'INVALID_CARD_DATA'
                }
            );

        }



        /* =================================================
           msg - 결과 확정 후에만 전체 배열 공개
        ================================================= */

        return msgSendJson(
            res,
            200,
            {
                success: true,

                code:
                    'CARDS_REVEALED',

                selection_id:
                    msgSelection.selection_id,

                cards:
                    msgCardOrder.map(
                        (
                            msgCard
                        ) =>
                            Number(
                                msgCard
                            )
                    )
            }
        );


    } catch (msgError) {

        console.error(
            'msg reveal server error:',
            msgError
        );


        return msgSendJson(
            res,
            500,
            {
                success: false,
                code: 'SERVER_ERROR'
            }
        );

    }

}