/**
 * GeoJsonファイルをローカルに保存する
 * @param fileName - ファイル名
 * @param json - GeoJSONデータ
 */
export const saveGeoJsonFile = (fileName: string, json: GeoJSON.GeoJSON) => {
  const aElement = document.createElement("a");
  const blob = new Blob([JSON.stringify(json, null, 2)], {
    type: "application/json",
  });
  aElement.href = window.URL.createObjectURL(blob);
  aElement.setAttribute("download", fileName);
  aElement.click();
  window.URL.revokeObjectURL(aElement.href);
};
