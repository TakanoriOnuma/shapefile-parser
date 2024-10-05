import { FC } from "react";
import { GeoFileInfo } from "./GeoFileLoader";

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
    </div>
  );
};
