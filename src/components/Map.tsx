import { FC, useMemo, useState, useEffect } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { saveGeoJsonFile } from "../utils/saveGeoJsonFile";

const isActive = (map: L.Map) => {
  // 既にマップが削除されている場合はpanesが空になっているので、それで判断する
  return Object.keys(map.getPanes()).length > 0;
};

export type MapProps = {
  /** Geo JSONデータ */
  geoJsonList: GeoJSON.GeoJSON[];
};

export const Map: FC<MapProps> = ({ geoJsonList }) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [markerClusterLayer, setMarkerClusterLayer] =
    useState<L.MarkerClusterGroup | null>(null);

  const ref = useMemo(() => {
    let map: L.Map | null = null;
    const handleKeyDown = (event: KeyboardEvent) => {
      // CtrlキーまたはCommandキーが押されている場合はスクロールズームを有効にする
      if (event.ctrlKey || event.metaKey) {
        map?.scrollWheelZoom.enable();
      }
    };
    const handleKeyUp = () => {
      map?.scrollWheelZoom.disable();
    };
    return (element: HTMLElement | null) => {
      if (element == null) {
        map?.remove();
        setMap(null);
        setMarkerClusterLayer(null);
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
        return;
      }

      map = L.map(element, {
        scrollWheelZoom: false,
      });
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);

      map.setView([35.681236, 139.767125], 15);
      const layer = L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          // 著作権の表示
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        },
      );
      map.addLayer(layer);

      const markerClusterLayer = L.markerClusterGroup();
      map.addLayer(markerClusterLayer);

      setMap(map);
      setMarkerClusterLayer(markerClusterLayer);
    };
  }, []);

  useEffect(() => {
    if (
      map == null ||
      !isActive(map) ||
      markerClusterLayer == null ||
      geoJsonList.length <= 0
    ) {
      return;
    }

    const layer = L.geoJSON(geoJsonList, {
      pointToLayer: (_, latlng) => {
        return L.marker(latlng, {
          // デフォルトアイコンをそのまま使うとビルド時に画像がリンク切れになってしまったのでimportして使用する
          // @see https://github.com/Leaflet/Leaflet/blob/v1.9.4/src/layer/marker/Icon.Default.js#L22-L31
          icon: L.icon({
            iconUrl: markerIcon,
            iconRetinaUrl: markerIcon2x,
            shadowUrl: markerShadow,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [41, 41],
          }),
        });
      },
      onEachFeature: (feature, layer) => {
        const entries = Object.entries(feature.properties);
        if (entries.length > 0) {
          layer.bindPopup(
            entries.map(([key, value]) => `${key}: ${value}`).join("<br>"),
          );
        }
      },
    });
    markerClusterLayer.addLayer(layer);

    const bounds = markerClusterLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds);
    }

    return () => {
      markerClusterLayer.removeLayer(layer);
    };
  }, [map, markerClusterLayer, geoJsonList]);

  return (
    <div>
      <div
        ref={ref}
        style={{
          aspectRatio: "16 / 9",
        }}
      ></div>
      {markerClusterLayer && (
        <button
          style={{ marginTop: 5 }}
          disabled={geoJsonList.length <= 0}
          onClick={() => {
            saveGeoJsonFile("output.geojson", markerClusterLayer.toGeoJSON());
          }}
        >
          マップ上に表示しているデータをgeojsonとしてダウンロード
        </button>
      )}
    </div>
  );
};
