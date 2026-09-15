import { createClient } from '@supabase/supabase-js';


export default async function handler(msgReq, msgRes) {

    try {

        /* =====================================================
           1. Cafe24 callback 값
        ===================================================== */

        const msgCode =
            String(
                msgReq.query.code || ''
            ).trim();


        const msgState =
            String(
                msgReq.query.state || ''
            ).trim();


        if (
            !msgCode
        ) {

            return msgRes.status(400).json({
                success: false,
                message: 'Cafe24 authorization code가 없습니다.'
            });

        }



        /* =====================================================
           2. 환경변수
        ===================================================== */

        const msgMallId =
            process.env.CAFE24_MALL_ID;


        const msgClientId =
            process.env.CAFE24_CLIENT_ID;


        const msgClientSecret =
            process.env.CAFE24_CLIENT_SECRET;


        const msgRedirectUri =
            process.env.CAFE24_REDIRECT_URI;


        const msgSupabaseUrl =
            process.env.SUPABASE_URL;


        const msgSupabaseSecretKey =
            process.env.SUPABASE_SECRET_KEY;



        if (
            !msgMallId ||
            !msgClientId ||
            !msgClientSecret ||
            !msgRedirectUri ||
            !msgSupabaseUrl ||
            !msgSupabaseSecretKey
        ) {

            console.error(
                'msg missing env:',
                {
                    mallId:
                        Boolean(msgMallId),

                    clientId:
                        Boolean(msgClientId),

                    clientSecret:
                        Boolean(msgClientSecret),

                    redirectUri:
                        Boolean(msgRedirectUri),

                    supabaseUrl:
                        Boolean(msgSupabaseUrl),

                    supabaseKey:
                        Boolean(msgSupabaseSecretKey)
                }
            );


            return msgRes.status(500).json({
                success: false,
                message: '서버 환경변수 설정이 부족합니다.'
            });

        }



        /* =====================================================
           3. Cafe24 authorization code → token
        ===================================================== */

        const msgBasicAuth =
            Buffer.from(
                `${msgClientId}:${msgClientSecret}`
            ).toString(
                'base64'
            );


        const msgTokenResponse =
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
                                'authorization_code',

                            code:
                                msgCode,

                            redirect_uri:
                                msgRedirectUri

                        })

                }

            );


        let msgTokenData;


        try {

            msgTokenData =
                await msgTokenResponse.json();

        } catch {

            msgTokenData = {};

        }



        /* =====================================================
           4. Cafe24 token 발급 오류
        ===================================================== */

        if (
            !msgTokenResponse.ok
        ) {

            console.error(
                'msg Cafe24 token issue error:',
                msgTokenData
            );


            return msgRes
                .status(
                    msgTokenResponse.status
                )
                .json({

                    success:
                        false,

                    message:
                        'Cafe24 Access Token 발급 실패',

                    error:
                        msgTokenData

                });

        }



        /* =====================================================
           5. 필수 token 확인
        ===================================================== */

        if (
            !msgTokenData.access_token ||
            !msgTokenData.refresh_token
        ) {

            console.error(
                'msg invalid Cafe24 token response:',
                msgTokenData
            );


            return msgRes.status(500).json({

                success:
                    false,

                message:
                    'Cafe24에서 정상적인 토큰을 반환하지 않았습니다.'

            });

        }



        /* =====================================================
           6. Supabase 연결
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
           7. Cafe24 token DB 저장
        ===================================================== */

        const msgTokenMallId =
            msgTokenData.mall_id ||
            msgMallId;


        const {
            error: msgDbError
        } = await msgSupabase

            .from(
                'cafe24_tokens'
            )

            .upsert(
                {

                    mall_id:
                        msgTokenMallId,

                    access_token:
                        msgTokenData.access_token,

                    refresh_token:
                        msgTokenData.refresh_token,

                    access_token_expires_at:
                        msgTokenData.expires_at ||
                        null,

                    refresh_token_expires_at:
                        msgTokenData.refresh_token_expires_at ||
                        null,

                    updated_at:
                        new Date().toISOString()

                },

                {
                    onConflict:
                        'mall_id'
                }

            );



        /* =====================================================
           8. DB 오류
        ===================================================== */

        if (
            msgDbError
        ) {

            console.error(
                'msg Supabase token save error:',
                msgDbError
            );


            return msgRes.status(500).json({

                success:
                    false,

                message:
                    'Cafe24 토큰은 발급됐지만 DB 저장에 실패했습니다.'

            });

        }



        /* =====================================================
           9. 성공 로그
           토큰 실제값은 출력하지 않음
        ===================================================== */

        console.log(
            'msg Cafe24 admin OAuth success:',
            {
                mall_id:
                    msgTokenMallId,

                state:
                    msgState || null,

                access_token_saved:
                    true,

                refresh_token_saved:
                    true,

                access_token_expires_at:
                    msgTokenData.expires_at ||
                    null,

                refresh_token_expires_at:
                    msgTokenData.refresh_token_expires_at ||
                    null
            }
        );



        /* =====================================================
           10. 완료
        ===================================================== */

        return msgRes.status(200).json({

            success:
                true,

            message:
                'Cafe24 관리자 연동 및 새 토큰 저장이 완료되었습니다.',

            mall_id:
                msgTokenMallId,

            access_token_expires_at:
                msgTokenData.expires_at ||
                null,

            refresh_token_expires_at:
                msgTokenData.refresh_token_expires_at ||
                null

        });


    } catch (
        msgError
    ) {

        console.error(
            'msg Cafe24 callback error:',
            msgError
        );


        return msgRes.status(500).json({

            success:
                false,

            message:
                '서버 처리 중 오류가 발생했습니다.'

        });

    }

}
