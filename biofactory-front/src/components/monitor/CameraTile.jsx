import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

const CameraTile = ({ camera, onClick }) => {
  return (
    <div
      onClick={() => onClick(camera)}
      className={clsx(
        'bg-bg-gray rounded-md overflow-hidden border cursor-pointer transition-all shadow-soft flex flex-col items-center justify-end aspect-square min-w-[82px] max-w-[120px] hover:shadow-lg',
        camera.ALERT !== '無異常'
          ? 'border-red-200 shadow-[0_0_0_3px_rgba(239,68,68,0.08)]'
          : 'border-border',
      )}
    >
      {/* <img
                src={camera.IMAGEURL}
                alt="即時影像"
                className="w-full h-[55px] object-cover bg-bg-soft block"
            /> */}
      <div className="text-ink font-bold w-full text-center py-2 overflow-hidden text-ellipsis whitespace-nowrap  bg-panel-2 ">
        {camera.CAMNAME}
      </div>
      <div className="w-full h-[55px] text-center flex items-center justify-center">
        {camera.CAMID}
      </div>
      <div className="w-full bg-panel-2 px-1.5 py-1 text-[0.88em] flex items-center justify-between flex-col">
        <div className="flex items-center font-extrabold">
          <span
            className={clsx(
              'w-2.5 h-2.5 rounded-full mr-1 border-2 shadow-[0_0_0_2px_rgba(34,197,94,0.12)]',
              camera.ALERT !== '無異常'
                ? 'bg-danger border-red-100 animate-pulse shadow-[0_0_0_2px_rgba(239,68,68,0.12)]'
                : 'bg-success border-green-50',
            )}
          ></span>
          {camera.ALERT !== '無異常' ? (
            <span
              className="text-danger overflow-hidden text-ellipsis whitespace-nowrap max-w-[70px]"
              title={camera.ALERT}
            >
              {camera.ALERT}
            </span>
          ) : (
            <span className="text-accent font-bold">無異常</span>
          )}
        </div>
      </div>
    </div>
  );
};

CameraTile.propTypes = {
  camera: PropTypes.object.isRequired,
  onClick: PropTypes.func,
};

export default CameraTile;
