import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import CameraTile from './CameraTile';

const CameraWall = ({
  cameras,
  locations,
  selectedLocation = '',
  showAbnormalOnly = false,
  onCameraClick,
  onLocationChange,
  onAbnormalFilterChange,
}) => {
  // 根據區域分組攝影機
  const camerasByLocation = useMemo(() => {
    const grouped = {};
    cameras.forEach((cam) => {
      if (!grouped[cam.CAMLOCATION]) {
        grouped[cam.CAMLOCATION] = [];
      }
      grouped[cam.CAMLOCATION].push(cam);
    });
    return grouped;
  }, [cameras]);

  const areasToShow = selectedLocation ? [selectedLocation] : Object.keys(camerasByLocation);

  return (
    <div className="w-full lg:w-[67vw] min-w-[700px] max-w-[1100px]">
      {/* Header / Controls */}
      <div className="flex items-center gap-5 mb-1.5">
        <span className="text-[1.3rem] text-primary font-black tracking-wide">錄影監控牆</span>
        <span className="text-ink-soft">
          監視器數量：<b>{cameras.length}</b>
        </span>

        <div className="ml-[18px] flex items-center gap-2.5">
          <label htmlFor="areaSelect" className="font-bold text-ink-soft">
            區域：
          </label>
          <select
            id="areaSelect"
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="text-[1.02rem] bg-white text-ink border border-border rounded-sm px-3 py-1.5 min-w-[120px]"
          >
            <option value="">全部</option>
            {locations.map((loc) => (
              <option key={loc.KEY} value={loc.KEY}>
                {loc.DESC}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex gap-2.5">
          <button
            onClick={() => onAbnormalFilterChange(true)}
            className={`px-3.5 py-1.5 border rounded-sm font-bold shadow-soft transition-colors ${showAbnormalOnly ? 'bg-danger text-white border-danger' : 'bg-white text-ink border-border'}`}
          >
            僅顯示異常
          </button>
          <button
            onClick={() => onAbnormalFilterChange(false)}
            className={`px-3.5 py-1.5 border rounded-sm font-bold shadow-soft transition-colors ${!showAbnormalOnly ? 'bg-primary text-white border-primary' : 'bg-white text-ink border-border'}`}
          >
            全部顯示
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-8 gap-2.5 mb-3">
        {areasToShow.map((area) => {
          const areaCams = camerasByLocation[area] || [];
          if (areaCams.length === 0) return null;

          return (
            <React.Fragment key={area}>
              <div className="col-span-8 font-black text-[1.08em] mt-2.5 mb-0.5 text-primary">
                {area} {showAbnormalOnly && '（異常）'}
              </div>
              {areaCams.map((cam, index) => (
                <CameraTile key={cam.CAMID + index} camera={cam} onClick={onCameraClick} />
              ))}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

CameraWall.propTypes = {
  cameras: PropTypes.array.isRequired,
  locations: PropTypes.array.isRequired,
  selectedLocation: PropTypes.string,
  showAbnormalOnly: PropTypes.bool,
  onCameraClick: PropTypes.func,
  onLocationChange: PropTypes.func,
  onAbnormalFilterChange: PropTypes.func,
};

export default CameraWall;
