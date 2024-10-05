import { FC, useState } from "react";
import * as shapefile from "shapefile";

/** GeoJSONファイル情報 */
export type GeoFileInfo = {
  /** GeoJSONデータ */
  geojson: GeoJSON.GeoJSON;
  /** shapeファイルから変換してGeoJSONを得ているか */
  isConverted?: boolean;
  /** 元のファイル情報 */
  rawFile: File;
};

export type GeoFileLoaderProps = {
  /**
   * ファイルを読み込めた時
   * @param geoFileInfo - GeoJSONファイル情報
   */
  onFileLoaded: (geoFileInfo: GeoFileInfo) => void;
};

const ACCEPT_SHAPE_FILE_EXTENSIONS = [".shp", ".dbf"];
const ACCEPT_JSON_FILE_EXTENSIONS = [".geojson", ".json"];
const ACCEPT_FILE_EXTENSIONS = [
  ...ACCEPT_SHAPE_FILE_EXTENSIONS,
  ...ACCEPT_JSON_FILE_EXTENSIONS,
];

export const GeoFileLoader: FC<GeoFileLoaderProps> = ({ onFileLoaded }) => {
  const [shapeFileWithBuffer, setShapeFileWithBuffer] = useState<{
    file: File;
    buffer: ArrayBuffer;
  } | null>(null);
  const [dbfFileWithBuffer, setDbfFileWithBuffer] = useState<{
    file: File;
    buffer: ArrayBuffer;
  } | null>(null);
  return (
    <div>
      <input
        value=""
        type="file"
        onChange={(event) => {
          const { files } = event.target;
          if (files == null) {
            return;
          }
          const file = files[0];
          if (!ACCEPT_FILE_EXTENSIONS.some((ext) => file.name.endsWith(ext))) {
            return;
          }
          const isJson = ACCEPT_JSON_FILE_EXTENSIONS.some((ext) =>
            file.name.endsWith(ext),
          );

          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result;
            if (result == null) {
              return;
            }

            if (isJson) {
              const geojson = JSON.parse(result as string);
              onFileLoaded({
                geojson,
                isConverted: false,
                rawFile: file,
              });
              setShapeFileWithBuffer(null);
              setDbfFileWithBuffer(null);
              return;
            }

            if (file.name.endsWith(".shp") && dbfFileWithBuffer == null) {
              setShapeFileWithBuffer({ file, buffer: result as ArrayBuffer });
              return;
            }
            if (file.name.endsWith(".dbf") && shapeFileWithBuffer == null) {
              setDbfFileWithBuffer({ file, buffer: result as ArrayBuffer });
              return;
            }

            shapefile
              .read(
                shapeFileWithBuffer?.buffer ?? result,
                dbfFileWithBuffer?.buffer ?? result,
                {
                  encoding: "shift-jis",
                },
              )
              .then((geojson) => {
                onFileLoaded({
                  geojson,
                  isConverted: true,
                  rawFile: shapeFileWithBuffer?.file ?? file,
                });
                setShapeFileWithBuffer(null);
                setDbfFileWithBuffer(null);
              });
          };

          if (isJson) {
            reader.readAsText(file);
          } else {
            reader.readAsArrayBuffer(file);
          }
        }}
      />
      {shapeFileWithBuffer != null && (
        <div>
          {shapeFileWithBuffer.file.name}を選択中
          <button
            style={{ marginLeft: 4 }}
            onClick={() => {
              shapefile
                .read(shapeFileWithBuffer.buffer, undefined, {
                  encoding: "shift-jis",
                })
                .then((geojson) => {
                  onFileLoaded({
                    geojson,
                    isConverted: true,
                    rawFile: shapeFileWithBuffer.file,
                  });
                  setShapeFileWithBuffer(null);
                });
            }}
          >
            defファイルをアップロードせずに登録
          </button>
        </div>
      )}
      {dbfFileWithBuffer != null && (
        <div>
          {dbfFileWithBuffer.file.name}を選択中。shapeファイルを選択してください
        </div>
      )}
    </div>
  );
};
