import { FC, useMemo, useState, useEffect } from "react";
import L from "leaflet";

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

    const layers = geoJsonList.map((geoJson) => {
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
      return layer;
    });

    layers.forEach((layer) => {
      map.addLayer(layer);
    });
    const extendedBounds = layers.reduce((bounds, layer) => {
      return bounds.extend(layer.getBounds());
    }, layers[0].getBounds());
    map.fitBounds(extendedBounds);

    return () => {
      layers.forEach((layer) => {
        map.removeLayer(layer);
      });
    };
  }, [map, geoJsonList]);

  return (
    <div
      ref={ref}
      style={{
        aspectRatio: "16 / 9",
      }}
    ></div>
  );
};
