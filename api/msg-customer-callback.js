import { createClient } from '@supabase/supabase-js';


/* =========================================================
   msg - 이벤트 기본 설정
========================================================= */

const msgEventCode =
    'feld_chuseok_2026';


const msgEventPageUrl =
    'https://feld.co.kr/msg/26chuseok.html';


const msgCustomerRedirectUri =
    'https://feld-event-msg.vercel.app/api/msg-customer-callback';


/*
 * 현재 테스트용 공통 쿠폰
 */

const msgDefaultCouponNo =
    '6085943114800000356';



/* =========================================================
   msg - 45개 전체 족보
========================================================= */

const msgCombinationMap = {

    /* 광땡 */

    '3-8': '38_GWANG_DDAENG',
    '1-8': '18_GWANG_DDAENG',
    '1-3': '13_GWANG_DDAENG',


    /* 특수 족보 */

    '1-2': 'ALI',
    '1-4': 'DOKSA',
    '1-9': 'GUBBING',
    '1-10': 'JANGBBING',
    '4-10': 'JANGSA',
    '4-6': 'SSERYUK',


    /* 갑오 */

    '2-7': 'GABO',
    '3-6': 'GABO',
    '4-5': 'GABO',
    '9-10': 'GABO',


    /* 8끗 */

    '1-7': '8_KKEUT',
    '2-6': '8_KKEUT',
    '3-5': '8_KKEUT',
    '8-10': '8_KKEUT',


    /* 7끗 */

    '1-6': '7_KKEUT',
    '2-5': '7_KKEUT',
    '3-4': '7_KKEUT',
    '7-10': '7_KKEUT',
    '8-9': '7_KKEUT',


    /* 6끗 */

    '1-5': '6_KKEUT',
    '2-4': '6_KKEUT',
    '6-10': '6_KKEUT',
    '7-9': '6_KKEUT',


    /* 5끗 */

    '2-3': '5_KKEUT',
    '5-10': '5_KKEUT',
    '6-9': '5_KKEUT',
    '7-8': '5_KKEUT',


    /* 4끗 */

    '5-9': '4_KKEUT',
    '6-8': '4_KKEUT',


    /* 3끗 */

    '3-10': '3_KKEUT',
    '4-9': '3_KKEUT',
    '5-8': '3_KKEUT',
    '6-7': '3_KKEUT',


    /* 2끗 */

    '2-10': '2_KKEUT',
    '3-9': '2_KKEUT',
    '4-8': '2_KKEUT',
    '5-7': '2_KKEUT',


    /* 1끗 */

    '2-9': '1_KKEUT',
    '4-7': '1_KKEUT',
    '5-6': '1_KKEUT',


    /* 망통 */

    '2-8': 'MANGTONG',
    '3-7': 'MANGTONG'

};



/* =========================================================
   msg - 족보별 혜택
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
   msg - 카드 결과 판정
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


    if (
        !msgResultCode
    ) {

        throw new Error(
            `INVALID_CARD_COMBINATION: ${msgCombinationKey}`
        );
    }


    const msgResultSetting =
        msgResultSettings[
            msgResultCode
        ];


    if (
        !msgResultSetting
    ) {

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
   msg - 결과 URL 생성

   결과가 확정된 뒤 전체 패 공개를 위해
   msg_selection_id도 함께 전달
========================================================= */

function msgMakeResultUrl({
    msgStatus,
    msgResult,
    msgSelectionId = '',
    msgIncludeBenefit = true
}) {

    const msgRedirectUrl =
        new URL(
            msgEventPageUrl
        );


    msgRedirectUrl.searchParams.set(
        'msg_status',
        msgStatus
    );


    msgRedirectUrl.searchParams.set(
        'msg_result',
        msgResult.code
    );


    msgRedirectUrl.searchParams.set(
        'msg_result_name',
        msgResult.name
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


    /*
     * 전체 카드 공개 API에 사용할 selection_id
     */

    if (
        msgSelectionId
    ) {

        msgRedirectUrl.searchParams.set(
            'msg_selection_id',
            msgSelectionId
        );

    }


    if (
        msgResult.description
    ) {

        msgRedirectUrl.searchParams.set(
            'msg_description',
            msgResult.description
        );

    }


    if (
        msgIncludeBenefit &&
        msgResult.benefit
    ) {

        msgRedirectUrl.searchParams.set(
            'msg_benefit',
            msgResult.benefit
        );

    }


    return msgRedirectUrl.toString();
}



/* =========================================================
   msg - 관리자 토큰 갱신
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
        ).toString(
            'base64'
        );


    const msgRefreshResponse =
        await fetch(

            `https://${msgMallId}.cafe24api.com/api/v2/oauth/token`,

            {
                method:
                    'POST',

                headers: {

                    Authorization:
                        `Basic ${msgBasicAuth}`,

                    'Content-Type':
                        'application/x-www-form-urlencoded'

                },

                body:
                    new URLSearchParams({

                        grant_type:
                            'refresh_token',

                        refresh_token:
                            msgRefreshToken

                    })

            }

        );


    let msgRefreshData;


    try {

        msgRefreshData =
            await msgRefreshResponse.json();

    } catch {

        msgRefreshData = {};

    }


    if (
        !msgRefreshResponse.ok
    ) {

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

        .from(
            'cafe24_tokens'
        )

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


    if (
        msgTokenUpdateError
    ) {

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
                method:
                    'POST',

                headers: {

                    Authorization:
                        `Bearer ${msgAccessToken}`,

                    'Content-Type':
                        'application/json',

                    'X-Cafe24-Api-Version':
                        '2026-03-01'

                },

                body:
                    JSON.stringify({

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
   msg - selection 원복
========================================================= */

async function msgReleaseSelection({
    msgSupabase,
    msgSelectionId
}) {

    try {

        await msgSupabase

            .from(
                'msg_event_selections'
            )

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
   msg - participant 실패 처리
========================================================= */

async function msgMarkParticipantFailed({
    msgSupabase,
    msgParticipantId,
    msgErrorMessage,
    msgResultCode = null,
    msgCouponNo = null
}) {

    try {

        const msgUpdateData = {

            status:
                'FAILED',

            error_message:
                msgErrorMessage,

            updated_at:
                new Date().toISOString()

        };


        if (
            msgResultCode
        ) {

            msgUpdateData.result_code =
                msgResultCode;

        }


        if (
            msgCouponNo
        ) {

            msgUpdateData.coupon_no =
                msgCouponNo;

        }


        await msgSupabase

            .from(
                'msg_event_participants'
            )

            .update(
                msgUpdateData
            )

            .eq(
                'id',
                msgParticipantId
            );


    } catch (msgError) {

        console.error(
            'msg participant failed update error:',
            msgError
        );

    }
}



/* =========================================================
   msg - Customer OAuth Callback
========================================================= */

export default async function handler(
    msgReq,
    msgRes
) {

    try {


        /* =====================================================
           1. OAuth 값
        ===================================================== */

        const msgCode =
            String(
                msgReq.query.code || ''
            ).trim();


        const msgSelectionId =
            String(
                msgReq.query.state || ''
            ).trim();


        if (
            !msgCode
        ) {

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


        const msgMallId =
            process.env.CAFE24_MALL_ID;


        const msgSupabaseUrl =
            process.env.SUPABASE_URL;


        const msgSupabaseSecretKey =
            process.env.SUPABASE_SECRET_KEY;



        if (
            !msgClientId ||
            !msgClientSecret ||
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
           4. 속도 개선

           selection 조회와
           Customer Access Token 발급을 동시에 실행
        ===================================================== */

        const msgSelectionPromise =

            msgSupabase

                .from(
                    'msg_event_selections'
                )

                .select(
                    'selection_id, event_code, round_id, card_1, card_2, used, created_at'
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



        const msgCustomerBasicAuth =
            Buffer.from(
                `${msgClientId}:${msgClientSecret}`
            ).toString(
                'base64'
            );


        const msgTokenPromise =
            fetch(

                'https://feld.co.kr/api/v2/oauth/token',

                {
                    method:
                        'POST',

                    headers: {

                        Authorization:
                            `Basic ${msgCustomerBasicAuth}`,

                        'Content-Type':
                            'application/x-www-form-urlencoded'

                    },

                    body:
                        new URLSearchParams({

                            grant_type:
                                'authorization_code',

                            code:
                                msgCode,

                            redirect_uri:
                                msgCustomerRedirectUri

                        })

                }

            );



        const [
            msgSelectionResult,
            msgTokenResponse

        ] = await Promise.all([

            msgSelectionPromise,
            msgTokenPromise

        ]);



        /* =====================================================
           5. selection 확인
        ===================================================== */

        const msgSelection =
            msgSelectionResult.data;


        const msgSelectionError =
            msgSelectionResult.error;



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


        if (
            msgSelection.used
        ) {

            return msgRes.redirect(
                302,
                `${msgEventPageUrl}?msg_status=used`
            );

        }



        /* =====================================================
           6. 족보 계산
        ===================================================== */

        const msgResult =
            msgGetCardResult(
                msgSelection.card_1,
                msgSelection.card_2
            );


        const msgResultCode =
            msgResult.code;


        const msgCouponNo =
            msgResult.couponNo;



        /* =====================================================
           7. Customer Token 확인
        ===================================================== */

        let msgTokenData;


        try {

            msgTokenData =
                await msgTokenResponse.json();

        } catch {

            msgTokenData = {};

        }


        if (
            !msgTokenResponse.ok
        ) {

            console.error(
                'msg customer token error:',
                msgTokenData
            );


            return msgRes.redirect(
                302,
                `${msgEventPageUrl}?msg_status=auth_error`
            );

        }



        const msgMemberId =
            msgTokenData.user_id;


        if (
            !msgMemberId ||
            !msgTokenData.access_token
        ) {

            return msgRes.redirect(
                302,
                `${msgEventPageUrl}?msg_status=auth_error`
            );

        }



        /* =====================================================
           8. Cafe24 회원 고유식별자
        ===================================================== */

        const msgIdentifierResponse =
            await fetch(

                'https://feld.co.kr/api/v2/customers/identifier',

                {
                    method:
                        'GET',

                    headers: {

                        Authorization:
                            `Basic ${msgTokenData.access_token}`

                    }

                }

            );


        let msgIdentifierData;


        try {

            msgIdentifierData =
                await msgIdentifierResponse.json();

        } catch {

            msgIdentifierData = {};

        }



        if (
            !msgIdentifierResponse.ok
        ) {

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



        if (
            !msgUserIdentifier
        ) {

            return msgRes.redirect(
                302,
                `${msgEventPageUrl}?msg_status=auth_error`
            );

        }



        /* =====================================================
           9. 플레이 기록 + 기존 참여여부를 동시에 처리
        ===================================================== */

        const msgParticipantSelectPromise =

            msgSupabase

                .from(
                    'msg_event_participants'
                )

                .select(
                    `
                    id,
                    status,
                    result_code,
                    coupon_no,
                    cafe24_user_id,
                    participated_at
                    `
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



        const msgPlayInsertPromise =

            msgSupabase

                .from(
                    'msg_event_plays'
                )

                .insert({

                    event_code:
                        msgEventCode,

                    cafe24_user_id:
                        msgMemberId,

                    user_identifier:
                        msgUserIdentifier,

                    selection_id:
                        msgSelectionId,

                    card_1:
                        msgResult.card1,

                    card_2:
                        msgResult.card2,

                    result_code:
                        msgResult.code,

                    result_name:
                        msgResult.name,

                    coupon_no:
                        msgCouponNo,

                    coupon_issued:
                        false,

                    played_at:
                        new Date().toISOString()

                })

                .select(
                    'id, selection_id'
                )

                .single();



        const [
            msgParticipantSelectResult,
            msgPlayInsertResult

        ] = await Promise.all([

            msgParticipantSelectPromise,
            msgPlayInsertPromise

        ]);



        const msgExistingParticipant =
            msgParticipantSelectResult.data;


        const msgParticipantSelectError =
            msgParticipantSelectResult.error;


        const msgPlayInsertError =
            msgPlayInsertResult.error;



        if (
            msgPlayInsertError
        ) {

            console.error(
                'msg play record insert error:',
                msgPlayInsertError
            );

        }



        if (
            msgParticipantSelectError
        ) {

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

           쿠폰 X
           새 카드 결과 O
           전체 패 공개 O
        ===================================================== */

        if (
            msgExistingParticipant
        ) {

            const {
                error: msgAlreadySelectionError

            } = await msgSupabase

                .from(
                    'msg_event_selections'
                )

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
                );


            if (
                msgAlreadySelectionError
            ) {

                console.error(
                    'msg already selection update error:',
                    msgAlreadySelectionError
                );

            }


            return msgRes.redirect(
                302,
                msgMakeResultUrl({

                    msgStatus:
                        'already',

                    msgResult,

                    msgSelectionId,

                    msgIncludeBenefit:
                        false

                })
            );

        }



        /* =====================================================
           11. 신규 참여
        ===================================================== */

        const msgNow =
            new Date().toISOString();



        const msgParticipantInsertPromise =

            msgSupabase

                .from(
                    'msg_event_participants'
                )

                .insert({

                    event_code:
                        msgEventCode,

                    member_id:
                        msgUserIdentifier,

                    cafe24_user_id:
                        msgMemberId,

                    result_code:
                        msgResultCode,

                    coupon_no:
                        msgCouponNo,

                    status:
                        'PROCESSING',

                    participated_at:
                        msgNow,

                    updated_at:
                        msgNow

                })

                .select(
                    'id, status'
                )

                .single();



        const msgAdminTokenPromise =

            msgSupabase

                .from(
                    'cafe24_tokens'
                )

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



        const [
            msgParticipantInsertResult,
            msgAdminTokenResult

        ] = await Promise.all([

            msgParticipantInsertPromise,
            msgAdminTokenPromise

        ]);



        const msgNewParticipant =
            msgParticipantInsertResult.data;


        const msgInsertError =
            msgParticipantInsertResult.error;



        /* =====================================================
           12. 동시에 다른 요청이 먼저 참여 처리
        ===================================================== */

        if (
            msgInsertError
        ) {

            if (
                msgInsertError.code ===
                '23505'
            ) {

                await msgSupabase

                    .from(
                        'msg_event_selections'
                    )

                    .update({
                        used: true
                    })

                    .eq(
                        'selection_id',
                        msgSelectionId
                    );


                return msgRes.redirect(
                    302,
                    msgMakeResultUrl({

                        msgStatus:
                            'already',

                        msgResult,

                        msgSelectionId,

                        msgIncludeBenefit:
                            false

                    })
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
           13. selection 선점
        ===================================================== */

        const {
            data: msgClaimedSelection,
            error: msgClaimError

        } = await msgSupabase

            .from(
                'msg_event_selections'
            )

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


            await msgMarkParticipantFailed({

                msgSupabase,

                msgParticipantId:
                    msgNewParticipant.id,

                msgErrorMessage:
                    'Selection claim failed'

            });


            return msgRes.redirect(
                302,
                `${msgEventPageUrl}?msg_status=selection_error`
            );

        }



        /* =====================================================
           14. 관리자 토큰 확인
        ===================================================== */

        const msgCafe24Token =
            msgAdminTokenResult.data;


        const msgAdminTokenError =
            msgAdminTokenResult.error;



        if (
            msgAdminTokenError ||
            !msgCafe24Token
        ) {

            console.error(
                'msg admin token error:',
                msgAdminTokenError
            );


            await Promise.all([

                msgReleaseSelection({
                    msgSupabase,
                    msgSelectionId
                }),

                msgMarkParticipantFailed({

                    msgSupabase,

                    msgParticipantId:
                        msgNewParticipant.id,

                    msgErrorMessage:
                        'Admin token not found'

                })

            ]);


            return msgRes.redirect(
                302,
                `${msgEventPageUrl}?msg_status=server_error`
            );

        }



        /* =====================================================
           15. 관리자 Access Token
        ===================================================== */

        let msgAdminAccessToken =
            msgCafe24Token.access_token;


        const msgExpiresAt =

            msgCafe24Token
                .access_token_expires_at

                ? new Date(
                    msgCafe24Token
                        .access_token_expires_at
                ).getTime()

                : null;



        const msgShouldRefresh =

            !msgExpiresAt ||

            msgExpiresAt <=
            Date.now() +
            (5 * 60 * 1000);



        /* =====================================================
           16. 필요하면 관리자 토큰 갱신
        ===================================================== */

        if (
            msgShouldRefresh
        ) {

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


                await Promise.all([

                    msgReleaseSelection({
                        msgSupabase,
                        msgSelectionId
                    }),

                    msgMarkParticipantFailed({

                        msgSupabase,

                        msgParticipantId:
                            msgNewParticipant.id,

                        msgErrorMessage:
                            'Admin token refresh failed'

                    })

                ]);


                return msgRes.redirect(
                    302,
                    `${msgEventPageUrl}?msg_status=server_error`
                );

            }

        }



        /* =====================================================
           17. 쿠폰 발급
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
           18. 401 → 토큰갱신 후 1회 재시도
        ===================================================== */

        if (
            msgCouponResponse.status ===
            401
        ) {

            try {

                const {
                    data: msgLatestToken,
                    error: msgLatestTokenError

                } = await msgSupabase

                    .from(
                        'cafe24_tokens'
                    )

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
                    !msgLatestToken
                        ?.refresh_token
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
           19. 쿠폰 발급 실패
        ===================================================== */

        if (
            !msgCouponResponse.ok
        ) {

            console.error(
                'msg coupon issue error:',
                msgCouponData
            );


            await Promise.all([

                msgReleaseSelection({
                    msgSupabase,
                    msgSelectionId
                }),

                msgMarkParticipantFailed({

                    msgSupabase,

                    msgParticipantId:
                        msgNewParticipant.id,

                    msgErrorMessage:
                        JSON.stringify(
                            msgCouponData
                        ),

                    msgResultCode,

                    msgCouponNo

                })

            ]);


            return msgRes.redirect(
                302,
                `${msgEventPageUrl}?msg_status=coupon_error`
            );

        }



        /* =====================================================
           20. 쿠폰 성공
        ===================================================== */

        const [
            msgParticipantUpdateResult,
            msgPlayUpdateResult

        ] = await Promise.all([

            msgSupabase

                .from(
                    'msg_event_participants'
                )

                .update({

                    status:
                        'ISSUED',

                    result_code:
                        msgResultCode,

                    coupon_no:
                        msgCouponNo,

                    cafe24_user_id:
                        msgMemberId,

                    error_message:
                        null,

                    updated_at:
                        new Date().toISOString()

                })

                .eq(
                    'id',
                    msgNewParticipant.id
                ),


            msgSupabase

                .from(
                    'msg_event_plays'
                )

                .update({

                    coupon_issued:
                        true

                })

                .eq(
                    'selection_id',
                    msgSelectionId
                )

        ]);



        const msgParticipantUpdateError =
            msgParticipantUpdateResult.error;


        const msgPlayUpdateError =
            msgPlayUpdateResult.error;



        if (
            msgPlayUpdateError
        ) {

            console.error(
                'msg play coupon update error:',
                msgPlayUpdateError
            );

        }



        if (
            msgParticipantUpdateError
        ) {

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
           21. 성공

           selection_id도 결과페이지로 전달
        ===================================================== */

        return msgRes.redirect(
            302,
            msgMakeResultUrl({

                msgStatus:
                    'success',

                msgResult,

                msgSelectionId,

                msgIncludeBenefit:
                    true

            })
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
