import { FC, useState } from "react";
import { Map } from "./components/Map";
import { GeoFileLoader, GeoFileInfo } from "./components/GeoFileLoader";
import { GeoFileInfoCheck } from "./components/GeoFileInfoCheck";

const App: FC = () => {
  const [geoFileInfoList, setGeoFileInfoList] = useState<GeoFileInfo[]>([]);
  const [isVisibleFileNameMap, setIsVisibleFileNameMap] = useState<
    Record<string, boolean>
  >({});

  const filteredGeoJsonList = geoFileInfoList
    .filter((geoFileInfo) => isVisibleFileNameMap[geoFileInfo.rawFile.name])
    .map((geoFileInfo) => geoFileInfo.geojson);

  return (
    <div>
      <div>Hello, World!</div>
      <GeoFileLoader
        onFileLoaded={(geoFileInfo) => {
          // 同じファイル名がある場合は追加しない
          const sameFile = geoFileInfoList.find(
            (item) => item.rawFile.name === geoFileInfo.rawFile.name,
          );
          if (sameFile != null) {
            return;
          }
          setGeoFileInfoList([...geoFileInfoList, geoFileInfo]);
          setIsVisibleFileNameMap({
            ...isVisibleFileNameMap,
            [geoFileInfo.rawFile.name]: true,
          });
        }}
      />
      <ul>
        {geoFileInfoList.map((geoFileInfo) => (
          <li key={geoFileInfo.rawFile.name}>
            <GeoFileInfoCheck
              geoFileInfo={geoFileInfo}
              isChecked={isVisibleFileNameMap[geoFileInfo.rawFile.name]}
              onChangeChecked={(isChecked) => {
                setIsVisibleFileNameMap({
                  ...isVisibleFileNameMap,
                  [geoFileInfo.rawFile.name]: isChecked,
                });
              }}
            />
          </li>
        ))}
      </ul>
      <Map geoJsonList={filteredGeoJsonList} />
    </div>
  );
};

export default App;
