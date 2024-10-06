import { FC } from "react";
import { GeoFileInfo } from "./GeoFileLoader";
import { saveGeoJsonFile } from "../utils/saveGeoJsonFile";

const getFileKey = (geoFileInfo: GeoFileInfo) => {
  return geoFileInfo.rawFiles.map((file) => file.name).join(",");
};

export type GeoFileInfoCheckProps = {
  /** GeoJSONファイル情報 */
  geoFileInfo: GeoFileInfo;
  /** チェックされているか */
  isChecked: boolean;
  /**
   * チェック変更時
   * @param isChecked - チェックフラグ
   */
  onChangeChecked: (isChecked: boolean) => void;
};

export const GeoFileInfoCheck: FC<GeoFileInfoCheckProps> = ({
  geoFileInfo,
  isChecked,
  onChangeChecked,
}) => {
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(event) => {
            onChangeChecked(event.target.checked);
          }}
        />
        {getFileKey(geoFileInfo)}
      </label>
      {geoFileInfo.isConverted && (
        <button
          style={{
            marginLeft: 4,
          }}
          onClick={() => {
            saveGeoJsonFile(
              geoFileInfo.rawFiles[0].name.replace(".shp", ".geojson"),
              geoFileInfo.geojson,
            );
          }}
        >
          geojsonをダウンロード
        </button>
      )}
    </div>
  );
};
