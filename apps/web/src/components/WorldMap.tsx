"use client";

import React, { useEffect, useRef, useState } from "react";
import Globe, { GlobeMethods } from "react-globe.gl";

interface WorldMapProps {
  userLocations: { [key: string]: number };
}

const WorldMap: React.FC<WorldMapProps> = ({ userLocations }) => {
  const globeEl = useRef<GlobeMethods | undefined>(undefined);
  const [countries, setCountries] = useState<{ features: any[] }>({
    features: [],
  });
  const [maxUsers, setMaxUsers] = useState(1);

  useEffect(() => {
    // Auto-rotate
    if (globeEl.current) {
      globeEl.current.controls().autoRotate = true;
      globeEl.current.controls().autoRotateSpeed = 0.3;
    }

    // Load country polygons data
    fetch("/ne_110m_admin_0_countries.geojson")
      .then((res) => res.json())
      .then((countries) => {
        setCountries(countries);
      });
  }, []);

  useEffect(() => {
    // Calculate max users for color scaling
    const max = Math.max(...Object.values(userLocations), 1);
    setMaxUsers(max);
  }, [userLocations]);

  const getPolygonColor = (feature: any) => {
    const countryName = feature.properties.NAME;
    const userCount = userLocations[countryName] || 0;

    if (userCount > 0) {
      // Scale color based on user count
      const intensity = userCount / maxUsers;
      return `rgba(255, 0, 0, ${0.3 + intensity * 0.7})`; // Red color, more intense with more users
    }
    return "rgba(100, 100, 100, 0.1)"; // Default color for countries with no users
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#2A2A40] rounded-lg overflow-hidden border border-[#444455]">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        polygonsData={countries.features}
        polygonAltitude={0.06}
        polygonCapColor={getPolygonColor}
        polygonSideColor={() => "rgba(0, 200, 0, 0.15)"}
        polygonStrokeColor={() => "#111"}
        polygonLabel={({ properties: d }: any) =>
          `<b>${d.NAME}</b> ${
            userLocations[d.NAME] ? `(${userLocations[d.NAME]} users)` : ""
          }`
        }
      />
    </div>
  );
};

export default WorldMap;
