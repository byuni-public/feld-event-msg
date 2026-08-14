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
       msg - CORS
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
       msg - OPTIONS
    ========================================================= */

    if (
        msgReq.method ===
        'OPTIONS'
    ) {

        return msgRes
            .status(204)
            .end();

    }



    try {


        /* =====================================================
           1. POST만 허용
        ===================================================== */

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
                'msg create selection env error'
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
           3. 프론트에서 전달받은 값

           실제 카드번호가 아니라

           round_id
           position_1
           position_2

           만 받습니다.
        ===================================================== */

        const msgRoundId =
            String(
                msgReq.body?.round_id || ''
            ).trim();


        const msgPosition1 =
            Number(
                msgReq.body?.position_1
            );


        const msgPosition2 =
            Number(
                msgReq.body?.position_2
            );



        /* =====================================================
           4. round_id 검증
        ===================================================== */

        if (
            !msgRoundId ||
            !/^[a-f0-9]{48}$/i.test(
                msgRoundId
            )
        ) {

            return msgRes.status(400).json({

                success: false,

                code:
                    'INVALID_ROUND',

                message:
                    '유효하지 않은 카드 라운드입니다.'

            });

        }



        /* =====================================================
           5. 카드 위치 검증

           위치는 1~10
        ===================================================== */

        if (
            !Number.isInteger(
                msgPosition1
            ) ||

            !Number.isInteger(
                msgPosition2
            ) ||

            msgPosition1 < 1 ||
            msgPosition1 > 10 ||

            msgPosition2 < 1 ||
            msgPosition2 > 10
        ) {

            return msgRes.status(400).json({

                success: false,

                code:
                    'INVALID_POSITION',

                message:
                    '올바른 카드 위치를 선택해주세요.'

            });

        }



        /* =====================================================
           6. 같은 위치 선택 방지
        ===================================================== */

        if (
            msgPosition1 ===
            msgPosition2
        ) {

            return msgRes.status(400).json({

                success: false,

                code:
                    'SAME_POSITION',

                message:
                    '서로 다른 카드 2장을 선택해주세요.'

            });

        }



        /* =====================================================
           7. Supabase 연결
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
           8. 서버에 저장된 라운드 조회
        ===================================================== */

        const {
            data: msgRound,
            error: msgRoundError

        } = await msgSupabase

            .from(
                'msg_event_rounds'
            )

            .select(
                'round_id, event_code, card_order, used, expires_at'
            )

            .eq(
                'round_id',
                msgRoundId
            )

            .eq(
                'event_code',
                msgEventCode
            )

            .maybeSingle();



        if (
            msgRoundError ||
            !msgRound
        ) {

            console.error(
                'msg round lookup error:',
                msgRoundError
            );


            return msgRes.status(400).json({

                success: false,

                code:
                    'ROUND_NOT_FOUND',

                message:
                    '카드 라운드를 찾을 수 없습니다.'

            });

        }



        /* =====================================================
           9. 이미 사용한 라운드인지 확인
        ===================================================== */

        if (
            msgRound.used === true
        ) {

            return msgRes.status(409).json({

                success: false,

                code:
                    'ROUND_ALREADY_USED',

                message:
                    '이미 사용한 카드 라운드입니다.'

            });

        }



        /* =====================================================
           10. 라운드 만료 확인
        ===================================================== */

        const msgExpiresAt =
            new Date(
                msgRound.expires_at
            ).getTime();


        if (
            !Number.isFinite(
                msgExpiresAt
            ) ||

            msgExpiresAt <=
            Date.now()
        ) {

            return msgRes.status(410).json({

                success: false,

                code:
                    'ROUND_EXPIRED',

                message:
                    '카드 선택 시간이 만료되었습니다. 다시 시도해주세요.'

            });

        }



        /* =====================================================
           11. card_order 검증
        ===================================================== */

        const msgCardOrder =
            msgRound.card_order;


        if (
            !Array.isArray(
                msgCardOrder
            ) ||

            msgCardOrder.length !==
            10
        ) {

            console.error(
                'msg invalid card order:',
                msgCardOrder
            );


            return msgRes.status(500).json({

                success: false,

                code:
                    'INVALID_CARD_ORDER',

                message:
                    '카드 구성 오류가 발생했습니다.'

            });

        }



        /* =====================================================
           12. 실제 카드번호 계산

           position은 1부터 시작
           배열 index는 0부터 시작
        ===================================================== */

        const msgCard1 =
            Number(
                msgCardOrder[
                    msgPosition1 - 1
                ]
            );


        const msgCard2 =
            Number(
                msgCardOrder[
                    msgPosition2 - 1
                ]
            );



        /* =====================================================
           13. 서버 내부 카드값 재검증
        ===================================================== */

        if (
            !Number.isInteger(
                msgCard1
            ) ||

            !Number.isInteger(
                msgCard2
            ) ||

            msgCard1 < 1 ||
            msgCard1 > 10 ||

            msgCard2 < 1 ||
            msgCard2 > 10 ||

            msgCard1 ===
            msgCard2
        ) {

            console.error(
                'msg resolved card error:',
                {
                    msgCard1,
                    msgCard2,
                    msgPosition1,
                    msgPosition2
                }
            );


            return msgRes.status(500).json({

                success: false,

                code:
                    'CARD_RESOLVE_ERROR',

                message:
                    '카드 판정 오류가 발생했습니다.'

            });

        }



        /* =====================================================
           14. 카드번호 정렬
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
           15. Selection ID 생성
        ===================================================== */

        const msgSelectionId =

            crypto
                .randomBytes(24)
                .toString('hex');



        /* =====================================================
           16. selection 저장
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

                round_id:
                    msgRoundId,

                card_1:
                    msgSortedCard1,

                card_2:
                    msgSortedCard2,

                used:
                    false

            })

            .select(
                'id, selection_id'
            )

            .single();



        if (
            msgInsertError
        ) {

            console.error(
                'msg selection insert error:',
                msgInsertError
            );


            return msgRes.status(500).json({

                success: false,

                code:
                    'DB_ERROR',

                message:
                    '선택 정보 저장에 실패했습니다.'

            });

        }



        /* =====================================================
           17. 라운드 사용 처리

           브라우저가 같은 round_id를 반복 제출하지 못하도록
           selection 생성 후 사용 완료 처리
        ===================================================== */

        const {
            data: msgUsedRound,
            error: msgRoundUseError

        } = await msgSupabase

            .from(
                'msg_event_rounds'
            )

            .update({

                used:
                    true

            })

            .eq(
                'round_id',
                msgRoundId
            )

            .eq(
                'used',
                false
            )

            .select(
                'round_id, used'
            )

            .maybeSingle();



        if (
            msgRoundUseError ||
            !msgUsedRound
        ) {

            console.error(
                'msg round use error:',
                msgRoundUseError
            );


            /*
             * selection은 만들어졌지만
             * round 선점이 실패했으므로
             * 해당 selection 삭제
             */

            await msgSupabase

                .from(
                    'msg_event_selections'
                )

                .delete()

                .eq(
                    'selection_id',
                    msgSelectionId
                );


            return msgRes.status(409).json({

                success: false,

                code:
                    'ROUND_ALREADY_USED',

                message:
                    '이미 처리된 카드 라운드입니다.'

            });

        }



        /* =====================================================
           18. Cafe24 OAuth URL
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
           19. 로그

           실제 카드값은 서버 로그에서만 확인 가능
        ===================================================== */

        console.log(
            'msg secure selection created:',
            {
                roundId:
                    msgRoundId,

                position1:
                    msgPosition1,

                position2:
                    msgPosition2,

                card1:
                    msgSortedCard1,

                card2:
                    msgSortedCard2,

                selectionId:
                    msgSelectionId
            }
        );



        /* =====================================================
           20. 응답

           중요:
           card_1 / card_2는 브라우저에 반환하지 않습니다.
        ===================================================== */

        return msgRes.status(200).json({

            success: true,

            code:
                'SELECTION_CREATED',

            selection_id:
                msgSelectionData.selection_id,

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
                '서버 오류가 발생했습니다.'

        });

    }

}