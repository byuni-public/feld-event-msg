import { createClient } from '@supabase/supabase-js';


/* =========================================================
   msg - 이벤트 기본 설정
========================================================= */

const msgEventCode =
    'feld_chuseok_2026';


const msgEventPageUrl =
    'https://feld.co.kr/event/26chuseok/detail.html';


const msgCustomerRedirectUri =
    'https://feld-event-msg.vercel.app/api/msg-customer-callback';


/*
 * 현재 테스트용 공통 쿠폰
 */

const msgDefaultCouponNo =
    '6086011268300000362';



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
        name: '[3·8]회복대광(回福大光)',
        description: '봄 벚꽃의 온화한 기운과 가을 보름달 같은 풍성한 수분 보습이 만나, 민감함은 잠재우고 꽉 찬 수분 광채를 선사하는 최고 등급의 피부 천운입니다.',
        benefit: '운세카드 내 전제품 증정',
        couponNo: '6086072742400000387'
    },

    '18_GWANG_DDAENG': {
        name: '[1·8]불로보습',
        description: '한겨울에도 푸른 소나무의 굳건함과 밝은 달의 촉촉한 기운이 만나, 메마른 피부에 수분을 채우고 탄탄한 보습 장벽을 지켜줄 것입니다.',
        benefit: '에어리 본품 3개',
        couponNo: '6086072749300000388'
    },

    '13_GWANG_DDAENG': {
        name: '[1·3]청아수분',
        description: '소나무의 굳건한 장벽과 벚꽃의 부드러운 진정이 만나, 예민해진 피부를 편안하게 다독이고 건강한 피부 컨디션을 되찾아줄 것입니다.',
        benefit: '에어리 본품 3개',
        couponNo: '6086072749300000388'
    },

    'ALI': {
        name: '[1·2]조화',
        description: '눈 속에서 숨을 고르는 매화와 소나무가 만나 지친 피부에 깊은 안식을 선사하고, 완벽한 유수분 밸런스를 되찾아줄 것 입니다.',
        benefit: '5,000원 할인',
        couponNo: '6086072758000000390'
    },

    'DOKSA': {
        name: '[1·4]수호',
        description: '소나무의 단단한 힘과 등나무의 쫀쫀한 응집력이 결합하여, 외부 자극으로부터 피부를 탄탄하게 지키는 철벽 수호막을 세워줄 것입니다.',
        benefit: '5,000원 할인',
        couponNo: '6086072758000000390'
    },

    'GUBBING': {
        name: '[1·9]풍요',
        description: '국화의 편안한 진정과 등나무의 탄탄한 힘이 어우러져, 예민함은 잠재우고 흐트러진 피부 컨디션을 매끈하게 정돈해줍니다.',
        benefit: '5,000원 할인',
        couponNo: '6086072758000000390'
    },

    'JANGBBING': {
        name: '[1·10]결실',
        description: '등나무의 탄력과 단풍의 따뜻한 감싸안음이 만나, 계절 변화와 외부 환경에도 흔들리지 않는 최상의 피부 컨디션을 완성합니다.',
        benefit: '5,000원 할인',
        couponNo: '6086072758000000390'
    },

    'JANGSA': {
        name: '[4·10]활력',
        description: '모란처럼 모공 요철을 말끔히 비우고 등나무처럼 쫀쫀하게 끌어올려, 결점 없는 도자기 피부로 생기와 활력을 되찾습니다.',
        benefit: '5,000원 할인',
        couponNo: '6086072758000000390'
    },

    'SSERYUK': {
        name: '[4·6]밀착',
        description: '쫀쫀한 등나무와 한여름 태양을 막아주는 싸리가 만나, 자외선은 빈틈없이 차단하고 수분은 들뜸 없이 밀착되는 피부 보호막을 이룹니다.',
        benefit: '5,000원 할인',
        couponNo: '6086072758000000390'
    },

    'GABO': {
        name: '[9복]만복',
        benefit: '5,000원 할인',
        couponNo: '6086072758000000390'
    },

    '8_KKEUT': {
        name: '[8복]생기',
        description: '피부에 고운 생기와 윤기가 활짝 피어날 기분 좋은 운세입니다.',
        benefit: '3,000원 할인',
        couponNo: '6086072759500000391'
    },

    '7_KKEUT': {
        name: '[7복]단비',
        description: '단비처럼 피부 속 깊은 곳까지 수분이 촉촉하게 적셔질 것입니다.',
        benefit: '3,000원 할인',
        couponNo: '6086072759500000391'
    },

    '6_KKEUT': {
        name: '[6복]윤기',
        description: '곱고 은은한 윤기가 피부에 반갑게 차오릅니다.',
        benefit: '3,000원 할인',
        couponNo: '6086072759500000391'
    },

    '5_KKEUT': {
        name: '[5복]평온',
        description: '지친 피부에 편안한 휴식과 안정이 찾아옵니다.',
        benefit: '3,000원 할인',
        couponNo: '6086072759500000391'
    },

    '4_KKEUT': {
        name: '[4복]불로',
        description: '세월을 비켜가듯 속부터 탱탱하게 피부 탄력이 차오릅니다.',
        benefit: '3,000원 할인',
        couponNo: '6086072759500000391'
    },

    '3_KKEUT': {
        name: '[3복]영양',
        description: '피부에 필요한 알짜배기 영양이 쏙쏙 채워집니다.',
        benefit: '3,000원 할인',
        couponNo: '6086072759500000391'
    },

    '2_KKEUT': {
        name: '[2복]결빛',
        description: '내일이 더 기대되는 부드럽고 고운 피부 결을 만날 기회가 옵니다.',
        benefit: '3,000원 할인',
        couponNo: '6086072759500000391'
    },

    '1_KKEUT': {
        name: '[1복]도약',
        description: '건강한 피부로 거듭나는 고운 첫걸음을 시작할 수 있습니다.',
        benefit: '3,000원 할인',
        couponNo: '6086072759500000391'
    },

    'MANGTONG': {
        name: '새로',
        description: '묵은 피부 고민은 싹 비워내고, 고운 피부로 다시 태어날 기회입니다.',
        benefit: '피토캄 클렌저 30ml 증정',
        couponNo: '6086072755900000389'
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
