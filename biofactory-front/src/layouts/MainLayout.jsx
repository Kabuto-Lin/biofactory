import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TabBar from '../components/TabBar';
import Modal from '../components/Modal';
import { getToken, logout, BASEURL } from '../services/api';

const MainLayout = () => {
  // 2. 初始化
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({
    PNO: '',      
    PWD: '',     
    CODE: '',        
    sessionId: ''    
  });
  const [captchaUrl, setCaptchaUrl] = useState('');

  useEffect(() => {
    const checkLoginStatus = () => {
      const storedData = localStorage.getItem('userData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setUser({
            name: parsedData.userName || parsedData.userId, 
            role: parsedData.userRole || '使用者' 
          });
        } catch (e) {
          console.error("解析使用者資料失敗", e);
          localStorage.removeItem('userData');
        }
      }
    };
    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    if (!window.confirm('確定要登出嗎？')) return;

    try {
      await logout();
    } catch (error) {
      console.error('登出 API 呼叫失敗', error);
    } finally {
      localStorage.removeItem('userData');
      setUser(null);
      alert('已成功登出');
      // 登出後回到首頁
      navigate('/'); 
    }
  };

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const refreshCaptcha = useCallback(async () => {
    try {
      const url = `${BASEURL}api/Auth/GetCaptcha`;
      
      const response = await fetch(url);
      const contentDisposition = response.headers.get('Content-Disposition');
      let sessionId = null;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?([^;'"]+)['"]?/);
        filenameMatch && (sessionId = filenameMatch[1]);
      }

      if (sessionId) {
        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);
        
        setCaptchaUrl(imageUrl);
        setLoginForm(prev => ({ ...prev, sessionId: sessionId, CODE: '' }));
      }
    } catch (error) {
      console.error('驗證碼讀取失敗:', error);
    }
  }, []);

  useEffect(() => {
    if (showLoginModal) {
      refreshCaptcha();
    }
    return () => {
      if (captchaUrl) URL.revokeObjectURL(captchaUrl);
    };
  }, [showLoginModal, refreshCaptcha]);

  const handleLoginSubmit = async () => {
    if (!loginForm.PNO || !loginForm.PWD || !loginForm.CODE) {
      alert('請輸入帳號、密碼與驗證碼');
      return;
    }

    try {
      const result = await getToken(loginForm);
      
      console.log('登入成功，Token:', result);
      
      localStorage.setItem('userData', JSON.stringify(result));
      
      setUser({
        name: result.userName || result.userId,
        role: result.userRole || '使用者'
      });
      
      alert('登入成功！');
      setShowLoginModal(false);

      // 3. 登入成功後跳轉到後台首頁
      navigate('/backend');
      
    } catch (error) {
      console.error('登入失敗:', error);
      alert(`登入失敗: ${error.message}`);
      refreshCaptcha();
    }
  };

  const handleLoginCancel = () => {
    setLoginForm({ PNO: '', PWD: '', CODE: '', sessionId: '' });
    setShowLoginModal(false);
  };

  return (
    <div className="min-h-screen bg-bg text-ink font-sans">
      <Header 
        onLoginClick={handleLogin} 
        onLogoutClick={handleLogout} 
        user={user} 
      />
      <TabBar showBackend={!!user} />

      <main className="w-full max-w-[1920px] mx-auto min-h-[90vh]">
        <Outlet />
      </main>

      <Modal
        show={showLoginModal}
        setShow={setShowLoginModal}
        title="工安事件後台登入"
        submit={handleLoginSubmit}
        cancel={handleLoginCancel}
        className="!min-w-[500px]"
        footer={false}
      >
        <div className="py-6 px-4">
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">帳號</label>
            <input
              type="text"
              placeholder="帳號 (PNO)"
              value={loginForm.PNO}
              onChange={(e) => setLoginForm({ ...loginForm, PNO: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="mb-4">
             <label className="block text-sm font-bold mb-1">密碼</label>
            <input
              type="password"
              placeholder="密碼 (PWD)"
              value={loginForm.PWD}
              onChange={(e) => setLoginForm({ ...loginForm, PWD: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleLoginSubmit();
                }
              }}
            />
          </div>

          <div className="mb-6 flex gap-2 items-center">
            <div className="flex-1">
               <label className="block text-sm font-bold mb-1">驗證碼</label>
              <input
                type="text"
                placeholder="輸入驗證碼"
                value={loginForm.CODE}
                onChange={(e) => setLoginForm({ ...loginForm, CODE: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLoginSubmit();
                  }
                }}
              />
            </div>
            
            <div className="flex flex-col items-center mt-6">
                {captchaUrl ? (
                    <img 
                        src={captchaUrl} 
                        alt="Captcha" 
                        className="h-12 border cursor-pointer" 
                        onClick={refreshCaptcha} 
                        title="點擊刷新驗證碼"
                    />
                ) : (
                    <div className="h-12 w-24 bg-gray-200 flex items-center justify-center text-xs">載入中...</div>
                )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLoginSubmit}
            className="w-full bg-warn font-bold py-2 px-6 rounded hover:bg-warn/90 transition-colors"
          >
            登入
          </button>
        </div>
      </Modal>

      <div id="modal-root"></div>
    </div>
  );
};

export default MainLayout;