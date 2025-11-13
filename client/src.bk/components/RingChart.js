import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Ratings from "./Ratings";

const RingChart = ({ chartOptions, rating }) => {
  return (
    <div className="relative ring-chart-wrapper">
      <CircularProgressbar
        value={rating * 20}
        styles={{
          path: {
            stroke: chartOptions.colors[0],
          },
          trail: {
            stroke: chartOptions.colors[1],
          },
        }}
      />
      <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center gap-1 flex-col">
        <div className="text-[#7A8399] text-sm font-medium">
          {chartOptions.labels[0]}
        </div>
        <div className="font-black text-3xl">{rating.toFixed(1)}</div>
        <Ratings rating={rating} />
      </div>
    </div>
  );
};

export default RingChart;
