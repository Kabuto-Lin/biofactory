import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../Modal';

const CameraDetailModal = ({ camera, isOpen, onClose }) => {
  const [viewMode, setViewMode] = useState('default'); // 'default', 'rtsp', 'event'

  useEffect(() => {
    setViewMode('default');
  }, [camera, isOpen]);

  if (!camera) return null;

  // Helper to determine what to show
  const renderContent = () => {
    // 1. RTSP Mode
    if (viewMode === 'rtsp') {
      return (
        <video src={camera.RTSPURL} controls autoPlay className="w-full h-full object-contain">
          您的瀏覽器不支援影片播放。
        </video>
      );
    }

    // 2. Event Video Mode
    if (viewMode === 'event') {
      return (
        <video src={camera.VIDEOURL} controls autoPlay className="w-full h-full object-cover">
          您的瀏覽器不支援影片播放。
        </video>
      );
    }

    // 3. Default Mode (Image or Placeholder)
    if (camera.ALERT === '無異常') {
      return <span className="font-bold text-5xl">{camera.CAMID}</span>;
    } else {
      return (
        <>
          <img
            src={camera.IMAGEURL}
            alt="Live Feed"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div
            className="hidden w-full h-full items-center justify-center text-ink-soft text-lg font-bold"
            style={{ display: 'none' }}
          >
            照片路徑異常
          </div>
          <div className="absolute top-2 left-2 bg-panel-2/90 border border-border px-2 py-0.5 rounded text-sm font-bold">
            異常狀況
          </div>
        </>
      );
    }
  };

  return (
    <Modal
      show={isOpen}
      setShow={(val) => !val && onClose()}
      header={false}
      footer={false}
      className="min-w-[420px] max-w-[90vw]"
    >
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <h2 className="text-[1.3rem] font-bold text-primary m-0 mb-1">
            {camera.CAMID} - {camera.CAMNAME}
          </h2>
          <button
            className="text-2xl text-ink-soft hover:text-ink leading-none bg-transparent border-none cursor-pointer"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {camera.ALERT && (
          <div className="mb-1">
            <div className="font-black text-lg" style={{ color: camera.TEXTCOLOR }}>{camera.ALERT}</div>
            {/* <div className="text-ink text-base">{camera.ALERTDETAIL}</div> */}
          </div>
        )}

        <div className="relative w-full h-[320px] bg-bg-gray flex items-center justify-center rounded-lg overflow-hidden">
          {renderContent()}
        </div>

        <div className="mt-2 flex gap-2">
          <button
            onClick={() => setViewMode('rtsp')}
            className="bg-panel-2 border rounded-lg px-4 py-2 cursor-pointer hover:bg-bg-gray transition-colors"
          >
            即時影像
          </button>

          {camera.ALERT !== '無異常' && (
            <button
              onClick={() => setViewMode('event')}
              className="bg-primary text-white border-none rounded-lg px-4 py-2 font-black cursor-pointer hover:bg-primary-dark transition-colors"
            >
              觀看事件影片
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

CameraDetailModal.propTypes = {
  camera: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onPlayEvent: PropTypes.func,
};

export default CameraDetailModal;
