import { FC, useState } from "react";
import { Map } from "./components/Map";

import jsonPointRaw from "../data/output/P17-12_13_FireStation.geojson?raw";
import jsonPolygonRaw from "../data/output/P17-12_13_FireStationJurisdiction.geojson?raw";

const jsonPoint = JSON.parse(jsonPointRaw);
console.log(jsonPoint);
const jsonPolygon = JSON.parse(jsonPolygonRaw);
console.log(jsonPolygon);

const App: FC = () => {
  const [flag, setFlag] = useState(true);

  return (
    <div>
      <div>Hello, World!</div>
      <button
        onClick={() => {
          setFlag(!flag);
        }}
      >
        toggle
      </button>
      <Map geoJsonList={flag ? [jsonPoint] : [jsonPoint, jsonPolygon]} />
    </div>
  );
};

export default App;
