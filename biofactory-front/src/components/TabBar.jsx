import React from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';

/**
 * @component TabBar
 * @description 頁面切換導航列
 */
const TabBar = ({ showBackend = false }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: 'monitor', label: '監控牆', path: '/' },
    { id: 'analytics', label: '數據分析', path: '/analytics' },
    { id: 'backend-home', label: '後台', path: '/backend', hidden: !showBackend },
    // { id: 'sna001f', label: '通報人員設定', path: '/SNA001F', hidden: !showBackend },
    // { id: 'sna002f', label: '設定', path: '/SNA002F', hidden: !showBackend },
  ];

  return (
    <div className="sticky top-0 z-50 w-full max-w-[1920px] mx-auto mb-2.5 pl-[30px] border-b-2 border-border bg-bg flex">
      {tabs.map((tab) => {
        if (tab.hidden) return null;
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={clsx(
              'pt-3 pb-2.5 px-10 pl-8 border-b-[3px] font-extrabold text-[1.12rem] transition-colors',
              isActive
                ? 'text-primary border-primary bg-panel-2'
                : 'text-ink-soft border-transparent hover:text-ink',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

TabBar.propTypes = {
  showBackend: PropTypes.bool,
};

export default TabBar;
