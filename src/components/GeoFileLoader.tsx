import { FC, useState } from "react";
import * as shapefile from "shapefile";
import { partition } from "lodash-es";
import toast from "react-hot-toast";

/** GeoJSONファイル情報 */
export type GeoFileInfo = {
  /** GeoJSONデータ */
  geojson: GeoJSON.GeoJSON;
  /** shapeファイルから変換してGeoJSONを得ているか */
  isConverted?: boolean;
  /** 元のファイル情報リスト */
  rawFiles: File[];
};

export type GeoFileLoaderProps = {
  /**
   * ファイルを読み込めた時
   * @param geoFileInfoList - GeoJSONファイル情報
   */
  onFileLoaded: (geoFileInfoList: GeoFileInfo[]) => void;
};

const ACCEPT_SHAPE_FILE_EXTENSIONS = [".shp", ".dbf"];
const ACCEPT_JSON_FILE_EXTENSIONS = [".geojson", ".json"];

type LoadedJsonFileData = {
  type: "json";
  data: GeoJSON.GeoJSON;
  rawFile: File;
};

type LoadedShapeFileData = {
  type: "shape" | "dbf";
  data: ArrayBuffer;
  rawFile: File;
};

type LoadedFileData = LoadedJsonFileData | LoadedShapeFileData;

/**
 * ファイルを読み込む
 * @param file - ファイル
 */
const loadFile = (file: File) => {
  return new Promise<LoadedFileData>((resolve, reject) => {
    const fileType = (() => {
      if (ACCEPT_JSON_FILE_EXTENSIONS.some((ext) => file.name.endsWith(ext))) {
        return "json";
      }
      if (ACCEPT_SHAPE_FILE_EXTENSIONS.some((ext) => file.name.endsWith(ext))) {
        return file.name.endsWith(".shp") ? "shape" : "dbf";
      }
      throw new Error("jsonまたはshapeファイルを選択してください");
    })();

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (result == null) {
        return;
      }
      if (fileType === "json") {
        // Errorのthrowが親でcatchできなかったのでrejectで対応
        try {
          resolve({
            type: "json",
            data: JSON.parse(result as string),
            rawFile: file,
          });
        } catch (err) {
          console.error(err);
          reject(new Error("JSONファイルの読み込みに失敗しました"));
        }
        return;
      } else {
        resolve({ type: fileType, data: result as ArrayBuffer, rawFile: file });
      }
    };

    if (fileType === "json") {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
};

/**
 * .shpと.dbfのペアを作成する
 * @param loadedFileDataList - 読み込み済みファイルデータリスト
 */
const makeShapePair = (loadedFileDataList: LoadedShapeFileData[]) => {
  const fileNameMap: Record<string, LoadedShapeFileData> = Object.assign(
    {},
    ...loadedFileDataList.map((data): Record<string, LoadedShapeFileData> => {
      const key = data.rawFile.name;
      return {
        [key]: data,
      };
    }),
  );
  const fileNames = Object.keys(fileNameMap);

  const shapePairList: {
    shape: LoadedShapeFileData;
    dbf: LoadedShapeFileData;
  }[] = [];
  fileNames.forEach((fileName) => {
    const baseName = fileName.replace(".shp", "");
    const shape = fileNameMap[`${baseName}.shp`];
    const dbf = fileNameMap[`${baseName}.dbf`];
    if (shape == null || dbf == null) {
      return;
    }
    shapePairList.push({ shape, dbf });
    delete fileNameMap[`${baseName}.shp`];
    delete fileNameMap[`${baseName}.dbf`];
  });

  return {
    shapePairList,
    remainList: Object.values(fileNameMap),
  };
};

export const GeoFileLoader: FC<GeoFileLoaderProps> = ({ onFileLoaded }) => {
  const [poolShapeFileList, setPoolShapeFileList] = useState<
    LoadedShapeFileData[]
  >([]);
  return (
    <div>
      <div>
        shapefile({ACCEPT_SHAPE_FILE_EXTENSIONS.join(", ")}
        )またはgeojson(
        {ACCEPT_JSON_FILE_EXTENSIONS.join(", ")}
        )をアップロードしてください。複数のファイルを選択することもできます。
      </div>
      <input
        value=""
        type="file"
        accept={[
          ...ACCEPT_SHAPE_FILE_EXTENSIONS,
          ...ACCEPT_JSON_FILE_EXTENSIONS,
        ].join(",")}
        multiple
        onChange={async (event) => {
          const { files } = event.target;
          if (files == null) {
            return;
          }

          const loadedFileDataList = await Promise.all(
            Array.from(files).map((file) => loadFile(file)),
          ).catch((err) => {
            toast.error(String(err));
            return null;
          });
          if (loadedFileDataList == null) {
            return;
          }

          const [jsonFileDataList, shapeFileDataList] = partition(
            loadedFileDataList,
            (data) => data.type === "json",
          );
          const { shapePairList, remainList } = makeShapePair([
            ...poolShapeFileList,
            ...shapeFileDataList,
          ]);

          const geoFileInfoList = await Promise.all(
            shapePairList.map(async (shapePair): Promise<GeoFileInfo> => {
              const geojson = await shapefile.read(
                shapePair.shape.data,
                shapePair.dbf.data,
                {
                  encoding: "shift-jis",
                },
              );
              return {
                geojson,
                isConverted: true,
                rawFiles: [shapePair.shape.rawFile, shapePair.dbf.rawFile],
              };
            }),
          );
          onFileLoaded([
            ...jsonFileDataList.map((data) => ({
              geojson: data.data,
              isConverted: false,
              rawFiles: [data.rawFile],
            })),
            ...geoFileInfoList,
          ]);
          setPoolShapeFileList(remainList);
        }}
      />
      {poolShapeFileList.map((fileData) => {
        switch (fileData.type) {
          case "shape":
            return (
              <div key={fileData.rawFile.name}>
                {fileData.rawFile.name}の読み込みが完了しました。
                <button
                  style={{ marginLeft: 4 }}
                  onClick={async () => {
                    const geojson = await shapefile.read(
                      fileData.data,
                      undefined,
                      {
                        encoding: "shift-jis",
                      },
                    );

                    onFileLoaded([
                      {
                        geojson,
                        isConverted: true,
                        rawFiles: [fileData.rawFile],
                      },
                    ]);
                    setPoolShapeFileList(
                      poolShapeFileList.filter((data) => data !== fileData),
                    );
                  }}
                >
                  {fileData.rawFile.name.replace(".shp", ".dbf")}
                  ファイルをアップロードせずに登録
                </button>
              </div>
            );
          case "dbf":
            return (
              <div key={fileData.rawFile.name}>
                {fileData.rawFile.name}の読み込みが完了しました。
                {fileData.rawFile.name.replace(".dbf", ".shp")}
                ファイルもアップロードしてください。
              </div>
            );
        }
        return null;
      })}
    </div>
  );
};
