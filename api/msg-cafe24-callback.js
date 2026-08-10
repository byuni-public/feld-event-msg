export default {
  fetch(msgRequest) {
    const msgUrl = new URL(msgRequest.url);

    const msgCode = msgUrl.searchParams.get('code');
    const msgState = msgUrl.searchParams.get('state');

    return Response.json({
      success: true,
      message: 'Cafe24 OAuth Callback OK',
      codeReceived: !!msgCode,
      stateReceived: !!msgState
    });
  }
};