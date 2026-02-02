import PropTypes from 'prop-types';
import Modal from '../Modal';
import clsx from 'clsx';

const EventDetailModal = ({ event, isOpen, onClose }) => {
  if (!event) return null;

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
    <Modal
      show={isOpen}
      setShow={(val) => !val && onClose()}
      header={false}
      footer={false}
      className="min-w-[500px] max-w-[90vw]"
    >
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <h2 className="text-[1.3rem] font-bold text-primary m-0">事件通報 #{event.ALERTNO}</h2>
          <button className="text-2xl text-ink-soft hover:text-ink leading-none" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* 事件資訊 */}
        <div className="flex flex-col gap-2 text-[1.05rem]">
          <div>
            <span className="font-normal">事件：</span>
            <span className={clsx('font-black', getTypeClass(event.ALERTTYPE))}>
              {event.ALERTTYPENAME}
            </span>
          </div>

          <div>
            <span className="font-normal">地點：</span>
            <span className="font-black">
              {event.CAMID}-{event.CAMNAME}
            </span>
          </div>

          <div>
            <span className="font-normal">通報時間：</span>
            <span className="font-black">{event.ALERTTIME}</span>
          </div>

          <div>
            <span className="font-normal">狀態：</span>
            <span className={clsx('font-black', getStatusClass(event.ALERTSTATUS))}>
              {event.ALERTSTATUSNAME}
            </span>
          </div>

          {event.CLOSE_TIME && (
            <div>
              <span className="font-normal">結案時間：</span>
              <span className="font-black">{event.CLOSE_TIME}</span>
            </div>
          )}
        </div>

        {/* 圖片 */}
        {event.IMAGEURL && (
          <div className="w-full bg-bg-soft rounded-lg overflow-hidden shadow-soft mt-2 relative min-h-[320px] flex items-center justify-center">
            <img
              src={event.IMAGEURL}
              alt="Event Footage"
              className="w-full h-auto max-h-[320px] object-cover block"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div
              className="hidden w-full h-full items-center justify-center text-ink-soft text-lg font-bold absolute"
              style={{ display: 'none' }}
            >
              照片路徑異常
            </div>
          </div>
        )}

        {/* 影片 */}
        {/* {event.VIDEOURL && (
          <div className="w-full bg-bg-soft rounded-lg overflow-hidden shadow-soft mt-2">
            <video
              src={event.VIDEOURL}
              controls
              className="w-full h-auto max-h-[320px] object-cover block"
            >
              您的瀏覽器不支援影片播放。
            </video>
          </div>
        )} */}

        {/* 缺失項目 */}
        {event.ALERTITEM && (
          <div className="text-ink-soft text-sm mt-2">缺失項目：{event.ALERTITEM}</div>
        )}
      </div>
    </Modal>
  );
};

EventDetailModal.propTypes = {
  event: PropTypes.shape({
    ALERTNO: PropTypes.number,
    ALERTTITLE: PropTypes.string,
    CAMNAME: PropTypes.string,
    CAMID: PropTypes.string,
    IMAGEURL: PropTypes.string,
    VIDEOURL: PropTypes.string,
    RTSPURL: PropTypes.string,
    ALERTTIME: PropTypes.string,
    ALERTTYPE: PropTypes.string,
    ALERTTYPENAME: PropTypes.string,
    ALERTITEM: PropTypes.string,
    ALERTSTATUS: PropTypes.string,
    ALERTSTATUSNAME: PropTypes.string,
    CLOSE_TIME: PropTypes.string,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default EventDetailModal;
