export const loginAndGetToken = async () => {
  try {
    const response = await fetch('https://daic-api.ksi.com.tw/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();
    const jwtToken = data.access_token;

    // 儲存到 localStorage
    localStorage.setItem('jwtToken', jwtToken);

    return jwtToken;
  } catch (error) {
    console.error('登入失敗:', error);
  }
};
