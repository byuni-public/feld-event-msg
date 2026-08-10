import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export default async function handler(msgReq, msgRes) {
  try {
    /* ===============================
       POST만 허용
    =============================== */

    if (msgReq.method !== 'POST') {
      return msgRes.status(405).json({
        success: false,
        code: 'METHOD_NOT_ALLOWED',
        message: '허용되지 않은 요청입니다.'
      });
    }


    /* ===============================
       환경변수 확인
    =============================== */

    const msgSupabaseUrl =
      process.env.SUPABASE_URL;

    const msgSupabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY;


    if (
      !msgSupabaseUrl ||
      !msgSupabaseSecretKey
    ) {
      return msgRes.status(500).json({
        success: false,
        code: 'ENV_ERROR',
        message: '서버 환경변수가 부족합니다.'
      });
    }


    /* ===============================
       선택 카드 받기
    =============================== */

    const msgCard1 =
      Number(msgReq.body?.card_1);

    const msgCard2 =
      Number(msgReq.body?.card_2);


    /* ===============================
       카드값 검증
    =============================== */

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
        code: 'INVALID_CARD',
        message: '올바른 카드를 선택해주세요.'
      });
    }


    if (msgCard1 === msgCard2) {
      return msgRes.status(400).json({
        success: false,
        code: 'SAME_CARD',
        message: '서로 다른 카드 2장을 선택해주세요.'
      });
    }


    /* ===============================
       항상 작은 번호부터 저장

       8 + 3
       ↓
       3 + 8

       같은 조합으로 처리
    =============================== */

    const [
      msgSortedCard1,
      msgSortedCard2
    ] = [msgCard1, msgCard2]
      .sort((a, b) => a - b);


    /* ===============================
       Selection ID 생성
    =============================== */

    const msgSelectionId =
      crypto.randomBytes(24)
        .toString('hex');


    const msgEventCode =
      'feld_chuseok_2026';


    /* ===============================
       Supabase 연결
    =============================== */

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


    /* ===============================
       선택값 저장
    =============================== */

    const {
      error: msgInsertError
    } = await msgSupabase
      .from('msg_event_selections')
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
      });


    if (msgInsertError) {
      console.error(
        'msg selection insert error:',
        msgInsertError
      );

      return msgRes.status(500).json({
        success: false,
        code: 'DB_ERROR',
        message: '선택 정보 저장에 실패했습니다.'
      });
    }


    /* ===============================
       성공
    =============================== */

    return msgRes.status(200).json({
      success: true,
      selection_id:
        msgSelectionId,

      next_url:
        `/api/msg-customer-auth?selection_id=${encodeURIComponent(msgSelectionId)}`
    });


  } catch (msgError) {

    console.error(
      'msg create selection error:',
      msgError
    );


    return msgRes.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      message: '서버 오류가 발생했습니다.'
    });
  }
}