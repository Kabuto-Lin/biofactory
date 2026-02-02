import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Pagination from '../Pagination';

const EventPanel = ({ alertCounts = [], alertList = [], onEventClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // 從 alertCounts 取得統計數字
  const counts = useMemo(() => {
    const result = {
      total: 0,
      open: 0,
      handle: 0,
      close: 0,
      pastOpen: 0,
    };

    alertCounts.forEach((item) => {
      switch (item.ALERTSTATUS) {
        case '總通報':
          result.total = item.COUNT_NUM;
          break;
        case '未處理':
          result.open = item.COUNT_NUM;
          break;
        case '處理中':
          result.handle = item.COUNT_NUM;
          break;
        case '已結案':
          result.close = item.COUNT_NUM;
          break;
        case '過去未結案':
          result.pastOpen = item.COUNT_NUM;
          break;
      }
    });

    return result;
  }, [alertCounts]);

  // 分頁處理
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return alertList.slice(startIndex, startIndex + itemsPerPage);
  }, [alertList, currentPage, itemsPerPage]);

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setItemsPerPage(size);
  };

  // 根據狀態碼取得狀態樣式
  const getStatusClass = (status) => {
    switch (status) {
      case '01':
        return 'text-danger';
      case '02':
        return 'text-warn';
      case '03':
        return 'text-success';
      default:
        return 'text-ink';
    }
  };

  // 根據異常型態取得顏色樣式
  const getTypeClass = (alerttype) => {
    const typeColorMap = {
      fire: 'text-danger',
      PPE: 'text-accent',
      smoke: 'text-cyan',
      e_fence: 'text-orange',
      e_misconduct: 'text-pink-500',
    };
    return typeColorMap[alerttype] || 'text-ink';
  };

  return (
    <div className="bg-panel border border-border rounded-lg shadow-md overflow-hidden flex flex-col min-h-[320px]">
      {/* Header */}
      <div className="p-4 bg-bg-soft border-b border-border flex items-center justify-between gap-2">
        <span className="text-[1.12rem] font-black text-ink min-w-[50px]">事件通報</span>
        <div className="flex gap-2 items-center">
          <StatItem label="總通報" value={counts.total} />
          <StatItem label="未處理" value={counts.open} />
          <StatItem label="處理中" value={counts.handle} />
          <StatItem label="已結案" value={counts.close} />
          {counts.pastOpen > 0 && <StatItem label="過去未結案" value={counts.pastOpen} />}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto bg-white">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-panel-2 text-ink">
              <th className="p-2.5 px-2 text-left border-b border-border">編號</th>
              <th className="p-2.5 px-2 text-left border-b border-border">型態</th>
              <th className="p-2.5 px-2 text-left border-b border-border">地點</th>
              <th className="p-2.5 px-2 text-left border-b border-border">時間</th>
              <th className="p-2.5 px-2 text-left border-b border-border">狀態</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEvents.map((event) => (
              <tr
                key={event.ALERTNO}
                onClick={() => onEventClick(event)}
                className="cursor-pointer hover:bg-bg-soft transition-colors border-b border-border last:border-0"
              >
                <td className="p-2.5 px-2">{event.ALERTNO}</td>
                <td className={clsx('p-2.5 px-2 font-black', getTypeClass(event.ALERTTYPE))}>
                  {event.ALERTTYPENAME}
                </td>
                <td className="p-2.5 px-2">
                  <div className="font-bold">{event.CAMNAME}</div>
                  <div className="text-xs text-ink-soft">{event.CAMID}</div>
                </td>
                <td className="p-2.5 px-2 text-sm">{event.ALERTTIME}</td>
                <td
                  className={clsx('p-2.5 px-2 font-extrabold', getStatusClass(event.ALERTSTATUS))}
                >
                  {event.ALERTSTATUSNAME}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="border-t border-border bg-bg-soft px-4 py-2">
        <Pagination
          totalItems={alertList.length}
          itemsPerPageOptions={[5, 8, 10, 20]}
          onPageChange={handlePageChange}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
};

const StatItem = ({ label, value, highlight }) => (
  <span
    className={clsx(
      'border rounded-lg p-2 font-extrabold min-w-[80px] text-center',
      highlight ? 'bg-warn/10 border-warn text-warn' : 'bg-white border-border text-ink',
    )}
  >
    <span className={highlight ? 'text-warn' : 'text-primary'}>{value}</span> <br />
    {label}
  </span>
);

EventPanel.propTypes = {
  alertCounts: PropTypes.arrayOf(
    PropTypes.shape({
      ALERTSTATUS: PropTypes.string.isRequired,
      COUNT_NUM: PropTypes.number.isRequired,
    }),
  ).isRequired,
  alertList: PropTypes.arrayOf(
    PropTypes.shape({
      ALERTNO: PropTypes.number.isRequired,
      ALERTTITLE: PropTypes.string,
      CAMNAME: PropTypes.string.isRequired,
      CAMID: PropTypes.string.isRequired,
      ALERTTIME: PropTypes.string.isRequired,
      ALERTTYPE: PropTypes.string.isRequired,
      ALERTTYPENAME: PropTypes.string.isRequired,
      ALERTSTATUS: PropTypes.string.isRequired,
      ALERTSTATUSNAME: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onEventClick: PropTypes.func,
};

export default EventPanel;
