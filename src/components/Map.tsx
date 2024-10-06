import { FC, useMemo, useState, useEffect } from "react";
import L from "leaflet";
import "leaflet.markercluster";

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

  const ref = useMemo(() => {
    let map: L.Map | null = null;
    return (element: HTMLElement | null) => {
      if (element == null) {
        map?.remove();
        setMap(null);
        return;
      }

      map = L.map(element);
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

      setMap(map);
    };
  }, []);

  useEffect(() => {
    if (map == null || !isActive(map) || geoJsonList.length <= 0) {
      return;
    }

    const layer = L.geoJSON(geoJsonList, {
      onEachFeature: (feature, layer) => {
        const entries = Object.entries(feature.properties);
        if (entries.length > 0) {
          layer.bindPopup(
            entries.map(([key, value]) => `${key}: ${value}`).join("<br>"),
          );
        }
      },
    });

    const markerClusterLayer = L.markerClusterGroup();
    markerClusterLayer.addLayer(layer);

    map.addLayer(markerClusterLayer);
    const bounds = markerClusterLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(markerClusterLayer.getBounds());
    }

    return () => {
      map.removeLayer(markerClusterLayer);
    };
  }, [map, geoJsonList]);

  return (
    <div>
      <div
        ref={ref}
        style={{
          aspectRatio: "16 / 9",
        }}
      ></div>
      <button
        style={{ marginTop: 5 }}
        onClick={() => {
          map?.eachLayer((layer) => {
            if (layer instanceof L.MarkerClusterGroup) {
              saveGeoJsonFile("output.geojson", layer.toGeoJSON());
            }
          });
        }}
      >
        マップ上に表示しているデータをgeojsonとしてダウンロード
      </button>
    </div>
  );
};
