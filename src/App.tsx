import { FC, useState } from "react";
import { Map } from "./components/Map";
import { GeoFileLoader, GeoFileInfo } from "./components/GeoFileLoader";
import { GeoFileInfoCheck } from "./components/GeoFileInfoCheck";

const getFileKey = (geoFileInfo: GeoFileInfo) => {
  return geoFileInfo.rawFiles.map((file) => file.name).join(",");
};

const App: FC = () => {
  const [geoFileInfoList, setGeoFileInfoList] = useState<GeoFileInfo[]>([]);
  const [isVisibleFileNameMap, setIsVisibleFileNameMap] = useState<
    Record<string, boolean>
  >({});

  const filteredGeoJsonList = geoFileInfoList
    .filter((geoFileInfo) => isVisibleFileNameMap[getFileKey(geoFileInfo)])
    .map((geoFileInfo) => geoFileInfo.geojson);

  return (
    <div>
      <div>Hello, World!</div>
      <GeoFileLoader
        onFileLoaded={(newGeoFileInfoList) => {
          setGeoFileInfoList([
            // 同じファイル名がある場合は上書きする
            ...geoFileInfoList.filter(
              (item) =>
                !newGeoFileInfoList.some(
                  (newItem) => getFileKey(newItem) === getFileKey(item),
                ),
            ),
            ...newGeoFileInfoList,
          ]);
          setIsVisibleFileNameMap(
            Object.assign(
              {
                ...isVisibleFileNameMap,
              },
              ...newGeoFileInfoList.map((item) => ({
                [getFileKey(item)]: true,
              })),
            ),
          );
        }}
      />
      <ul>
        {geoFileInfoList.map((geoFileInfo) => (
          <li key={getFileKey(geoFileInfo)}>
            <GeoFileInfoCheck
              geoFileInfo={geoFileInfo}
              isChecked={isVisibleFileNameMap[getFileKey(geoFileInfo)]}
              onChangeChecked={(isChecked) => {
                setIsVisibleFileNameMap({
                  ...isVisibleFileNameMap,
                  [getFileKey(geoFileInfo)]: isChecked,
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
