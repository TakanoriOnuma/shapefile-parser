import { FC, useMemo, useState, useEffect } from "react";
import L from "leaflet";

const isActive = (map: L.Map) => {
  // 既にマップが削除されている場合はpanesが空になっているので、それで判断する
  return Object.keys(map.getPanes()).length > 0;
};

export type MapProps = {
  /** Geo JSONデータ */
  geoJson: GeoJSON.GeoJSON;
};

export const Map: FC<MapProps> = ({ geoJson }) => {
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
    if (map == null || !isActive(map)) {
      return;
    }

    const layer = L.geoJSON(geoJson, {
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          layer.bindPopup(
            Object.entries(feature.properties)
              .map(([key, value]) => `${key}: ${value}`)
              .join("<br>"),
          );
        }
      },
    });
    map.addLayer(layer);
    map.fitBounds(layer.getBounds());

    return () => {
      map.removeLayer(layer);
    };
  }, [map, geoJson]);

  return (
    <div
      ref={ref}
      style={{
        aspectRatio: "16 / 9",
      }}
    ></div>
  );
};
