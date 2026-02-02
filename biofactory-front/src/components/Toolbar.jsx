import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';

const Toolbar = ({ title, start, center, end }) => {
  return (
    <>
      {title ? (
        <div className="mb-4 text-2xl">
          <FontAwesomeIcon icon={faGear} className="mr-2" />
          {title}
        </div>
      ) : null}
      <div className="flex justify-between w-full">
        <div className="h-full my-auto">{start}</div>
        <div className="h-full my-auto">{center}</div>
        <div className="h-full my-auto">{end}</div>
      </div>
    </>
  );
};
export default Toolbar;
