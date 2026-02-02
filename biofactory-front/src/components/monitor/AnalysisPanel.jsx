import React from 'react';
import PropTypes from 'prop-types';

const AnalysisPanel = ({ alertTypeStats = [] }) => {
  return (
    <div className="bg-panel border border-border rounded-lg p-3.5 px-5 shadow-soft text-ink">
      <h4 className="m-0 mb-2 text-primary text-lg">警示通報分析</h4>
      <ul className="m-0 pl-4 list-none">
        {alertTypeStats.map((stat, index) => (
          <li key={index} className="my-0.5">
            {stat.ALERTTYPENAME}：<b style={{ color: stat.ALERTTYPECOLOR }}>{stat.ALERTCOUNT}</b> 件
          </li>
        ))}
      </ul>
    </div>
  );
};

AnalysisPanel.propTypes = {
  alertTypeStats: PropTypes.arrayOf(
    PropTypes.shape({
      ALERTTYPENAME: PropTypes.string.isRequired,
      ALERTCOUNT: PropTypes.number.isRequired,
      ALERTTYPECOLOR: PropTypes.string,
    }),
  ).isRequired,
};

export default AnalysisPanel;
