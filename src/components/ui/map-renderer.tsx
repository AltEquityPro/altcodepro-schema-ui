// src/components/ui/map-renderer.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { MapElement } from "../../types";
import { resolveBinding, classesFromStyleProps, cn } from "../../lib/utils";
import { Loader } from "@googlemaps/js-api-loader";
import mapboxgl from "mapbox-gl";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

// TypeScript declaration for Leaflet.heat
declare module "leaflet" {
    namespace heatLayer {
        interface HeatLayerOptions {
            minOpacity?: number;
            maxZoom?: number;
            max?: number;
            radius?: number;
            blur?: number;
            gradient?: { [key: number]: string };
        }
    }
    function heatLayer(
        latlngs: Array<[number, number, number?]>,
        options?: heatLayer.HeatLayerOptions
    ): Layer;
}

interface MapRendererProps {
    element: MapElement;
    state: Record<string, any>;
    t: (k: string) => string;
}

export function MapRenderer({ element, state, t }: MapRendererProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapInstance, setMapInstance] = useState<any>(null);
    const [googleApi, setGoogleApi] = useState<any>(null);
    const [mapError, setMapError] = useState<string | null>(null);

    // Resolve bindings
    const center = resolveBinding(element.center, state, t) as [number, number];
    const zoom = resolveBinding(element.zoom, state, t) ?? 10;
    const provider = resolveBinding(element.provider, state, t) ?? "osm";
    const height = resolveBinding(element.height, state, t) ?? 400;
    const markers = resolveBinding(element.markers, state, t) ?? [];
    const routes = resolveBinding(element.routes, state, t) ?? [];
    const heatmap = resolveBinding(element.heatmap, state, t) ?? [];
    const dataSourceId = element.dataSourceId;
    const controls = element.controls ?? {
        fullscreen: true,
        geolocate: false,
        scale: false,
        streetView: false,
        zoom: true,
    };

    // Initialize map
    useEffect(() => {
        if (!mapRef.current) return;

        const initializeMap = async () => {
            try {
                if (provider === "google") {
                    const googleConfig = element.google ?? {};
                    const apiKey = resolveBinding(googleConfig.apiKey, state, t);
                    if (!apiKey) throw new Error("Google Maps API key required");

                    const loader = new Loader({
                        apiKey,
                        version: "weekly",
                        libraries: ["visualization"],
                    });
                    const google = await loader.load();
                    setGoogleApi(google);

                    const map = new google.maps.Map(mapRef.current!, {
                        center: { lat: center[0], lng: center[1] },
                        zoom,
                        mapId: googleConfig.mapId,
                        fullscreenControl: controls.fullscreen,
                        zoomControl: controls.zoom,
                        streetViewControl: controls.streetView,
                        scaleControl: controls.scale,
                    });

                    // Markers
                    markers.forEach((m: any) => {
                        const gMarker = new google.maps.Marker({
                            position: { lat: m.lat, lng: m.lng },
                            map,
                            icon: m.iconUrl,
                        });
                        if (m.popup) {
                            const infoWindow = new google.maps.InfoWindow({ content: m.popup });
                            gMarker.addListener("click", () => infoWindow.open(map, gMarker));
                        }
                    });

                    // Routes
                    routes.forEach((r: any) => {
                        new google.maps.Polyline({
                            path: r.coords.map(([lat, lng]: any) => ({ lat, lng })),
                            map,
                            strokeColor: "#FF0000",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                        });
                    });

                    // Heatmap
                    if (heatmap.length) {
                        new google.maps.visualization.HeatmapLayer({
                            data: heatmap.map(([lat, lng, w]: any) => ({
                                location: new google.maps.LatLng(lat, lng),
                                weight: w ?? 1,
                            })),
                            map,
                        });
                    }

                    setMapInstance(map);
                } else if (provider === "mapbox") {
                    const mapboxConfig = element.mapbox ?? {};
                    const accessToken = resolveBinding(mapboxConfig.accessToken, state, t);
                    if (!accessToken) throw new Error("Mapbox access token required");

                    mapboxgl.accessToken = accessToken;
                    const map = new mapboxgl.Map({
                        container: mapRef.current!,
                        style:
                            mapboxConfig.styleId ?? "mapbox://styles/mapbox/streets-v11",
                        center,
                        zoom,
                    });

                    if (controls.fullscreen) map.addControl(new mapboxgl.FullscreenControl());
                    if (controls.geolocate) map.addControl(new mapboxgl.GeolocateControl());
                    if (controls.zoom) map.addControl(new mapboxgl.NavigationControl());
                    if (controls.scale) map.addControl(new mapboxgl.ScaleControl());

                    // Wait until style loads before adding layers
                    map.on("load", () => {
                        // Routes
                        routes.forEach((r: { coords: any[]; }, i: any) => {
                            map.addSource(`route-${i}`, {
                                type: "geojson",
                                data: {
                                    type: "Feature",
                                    geometry: {
                                        type: "LineString",
                                        coordinates: r.coords.map(([lat, lng]: any) => [lng, lat]),
                                    },
                                } as any,
                            });
                            map.addLayer({
                                id: `route-${i}`,
                                type: "line",
                                source: `route-${i}`,
                                paint: { "line-color": "#FF0000", "line-width": 2 },
                            });
                        });

                        // Heatmap
                        if (heatmap.length) {
                            map.addSource("heatmap", {
                                type: "geojson",
                                data: {
                                    type: "FeatureCollection",
                                    features: heatmap.map(([lat, lng, w]: any) => ({
                                        type: "Feature",
                                        geometry: { type: "Point", coordinates: [lng, lat] },
                                        properties: { weight: w ?? 1 },
                                    })),
                                },
                            });
                            map.addLayer({
                                id: "heatmap",
                                type: "heatmap",
                                source: "heatmap",
                                paint: {
                                    "heatmap-weight": ["get", "weight"],
                                    "heatmap-radius": 30,
                                    "heatmap-opacity": 0.8,
                                },
                            });
                        }
                    });

                    setMapInstance(map);
                } else {
                    // Leaflet (OSM)
                    const map = L.map(mapRef.current!).setView(center, zoom);
                    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                        attribution: "© OpenStreetMap contributors",
                        maxZoom: 19,
                    }).addTo(map);

                    if (controls.zoom) map.addControl(new L.Control.Zoom());
                    if (controls.scale) map.addControl(new L.Control.Scale());

                    // Routes
                    routes.forEach((r: any) => {
                        L.polyline(r.coords, { color: "#FF0000", weight: 2 }).addTo(map);
                    });

                    // Heatmap
                    if (heatmap.length) {
                        L.heatLayer(
                            heatmap.map(([lat, lng, w]: any) => [lat, lng, w ?? 1]),
                            { radius: 25, blur: 15, max: 1.0 }
                        ).addTo(map);
                    }

                    setMapInstance(map);
                }
            } catch (err: any) {
                setMapError(err.message ?? String(err));
            }
        };

        initializeMap();

        return () => {
            if (mapInstance) {
                if (provider === "mapbox") mapInstance.remove();
                else if (provider === "osm") mapInstance.remove();
                setMapInstance(null);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provider, center, zoom]);

    // Handle dynamic data updates (markers/routes/heatmap)
    useEffect(() => {
        if (!dataSourceId || !mapInstance || !state[dataSourceId]) return;
        const data = state[dataSourceId];

        if (Array.isArray(data)) {
            if (provider === "google" && googleApi) {
                data.forEach((item) => {
                    const gMarker = new googleApi.maps.Marker({
                        position: { lat: item.lat, lng: item.lng },
                        map: mapInstance,
                        icon: item.iconUrl,
                    });
                    if (item.popup) {
                        const infoWindow = new googleApi.maps.InfoWindow({ content: item.popup });
                        gMarker.addListener("click", () => infoWindow.open(mapInstance, gMarker));
                    }
                });
            } else if (provider === "mapbox") {
                data.forEach((item) => {
                    const markerEl = document.createElement("div");
                    if (item.iconUrl) {
                        markerEl.style.backgroundImage = `url(${item.iconUrl})`;
                        markerEl.style.width = "32px";
                        markerEl.style.height = "32px";
                        markerEl.style.backgroundSize = "cover";
                    }
                    new mapboxgl.Marker(markerEl)
                        .setLngLat([item.lng, item.lat])
                        .setPopup(item.popup ? new mapboxgl.Popup().setHTML(item.popup) : undefined)
                        .addTo(mapInstance);
                });
            } else {
                data.forEach((item) => {
                    const marker = L.marker([item.lat, item.lng], {
                        icon: item.iconUrl
                            ? L.icon({
                                iconUrl: item.iconUrl,
                                iconSize: [32, 32],
                                iconAnchor: [16, 32],
                                popupAnchor: [0, -32],
                            })
                            : undefined,
                    }).addTo(mapInstance);
                    if (item.popup) marker.bindPopup(item.popup);
                });
            }
        }
    }, [dataSourceId, state, mapInstance, provider, googleApi]);

    if (mapError) {
        return <div className="text-red-600 p-4">Error loading map: {mapError}</div>;
    }

    return (
        <div
            ref={mapRef}
            className={cn(classesFromStyleProps(element.styles), "w-full")}
            style={{ height: typeof height === "number" ? `${height}px` : height }}
        />
    );
}
