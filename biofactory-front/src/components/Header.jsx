import React from 'react';
import PropTypes from 'prop-types';

// 1. [新增] 接收 onLogoutClick 屬性
const Header = ({ onLoginClick, onLogoutClick, user }) => {
    return (
        <header className="relative bg-bg-soft border-b border-border py-5 text-center shadow-soft">
            <h1 className="text-[1.9rem] tracking-wider font-bold text-ink">
                智慧廠房戰情室
            </h1>

            <div className="absolute right-6 top-[18px]">
                {!user ? (
                    <button
                        onClick={onLoginClick}
                        className="bg-warn text-gray-900 font-bold py-2.5 px-5 rounded-sm shadow-soft hover:brightness-105 transition-all"
                    >
                        工安事件後台登入
                    </button>
                ) : (
                    <div className="flex items-center gap-3 bg-white px-3.5 py-2 border border-border rounded-sm shadow-soft text-ink-soft">
                        <span>登入身分：</span>
                        {/* 這裡稍後 MainLayout 會傳入中文姓名 */}
                        <span className="text-primary font-extrabold">{user.role}</span>
                        <span>（{user.name}）</span>
                        
                        {/* 2. [修正] 綁定 onClick 事件 */}
                        <button 
                            onClick={onLogoutClick}
                            className="bg-danger text-white px-3.5 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                        >
                            登出
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

Header.propTypes = {
    onLoginClick: PropTypes.func,
    onLogoutClick: PropTypes.func, // [新增] 型別檢查
    user: PropTypes.shape({
        name: PropTypes.string,
        role: PropTypes.string,
    }),
};

export default Header;