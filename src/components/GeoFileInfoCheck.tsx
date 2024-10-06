import { FC } from "react";
import { GeoFileInfo } from "./GeoFileLoader";

const getFileKey = (geoFileInfo: GeoFileInfo) => {
  return geoFileInfo.rawFiles.map((file) => file.name).join(",");
};

/**
 * バイナリファイルをローカルに保存する
 * @param fileName - ファイル名
 * @param blob - blobデータ
 */
const saveGeoJsonFile = (fileName: string, json: GeoJSON.GeoJSON) => {
  const aElement = document.createElement("a");
  const blob = new Blob([JSON.stringify(json, null, 2)], {
    type: "application/json",
  });
  aElement.href = window.URL.createObjectURL(blob);
  aElement.setAttribute("download", fileName);
  aElement.click();
  window.URL.revokeObjectURL(aElement.href);
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
