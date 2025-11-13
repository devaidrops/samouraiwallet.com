import clsx from "clsx";

const Ratings = ({
  rating,
  className,
  starImages = {
    starEmpty: "/img/blue-star-empty.svg",
    starFull: "/img/blue-star-full.svg",
    starHalf: "/img/blue-star-half.svg",
  },
  mobile
}) => {
  return (
    <>
      <div className={clsx("stars", mobile && "max-sm:!hidden", className)}>
        {new Array(Math.floor(rating)).fill("").map((_, i) => (
          <div key={i} className="star">
            <img className="default-star size-4" src={starImages.starEmpty} alt="Star" />
            <img className="size-4" src={starImages.starFull} alt="Star" />
          </div>
        ))}
        {new Array(rating - Math.floor(rating) > 0 ? 1 : 0).fill("").map((_, i) => (
          <div key={i} className="star relative">
            <img className="default-star size-4" src={starImages.starEmpty} alt="Star" />
            <div className="absolute top-0 left-0 overflow-hidden h-4" style={{ width: `${(rating - Math.floor(rating)) * 100}%` }}>
              <img className="size-4 min-w-4" src={starImages.starFull}  alt="Star" />
            </div>
          </div>
        ))}
        {new Array(Math.floor(5 - rating)).fill("").map((_, i) => (
          <div key={i} className="star">
            <img className="default-star size-4" src={starImages.starEmpty} alt="Star" />
          </div>
        ))}
      </div>
      <div className={clsx("stars", mobile ? "sm:!hidden" : "!hidden", className)}>

        <div className="star relative">
          <img className="default-star size-4" src={starImages.starEmpty} alt="Star" />
          <div
            className="absolute top-0 left-0 overflow-hidden h-4"
            style={{ width: `${100 / 5 * rating}%` }}
          >
            <img className="size-4 min-w-4" src={starImages.starFull} alt="Star" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Ratings;
