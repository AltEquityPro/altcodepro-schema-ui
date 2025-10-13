"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import mapboxgl from "mapbox-gl";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

import { MapElement } from "../../types";
import { resolveBinding, classesFromStyleProps, cn } from "../../lib/utils";

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

/**
 * 🌍 Universal Map Renderer
 * Supports Google Maps, Mapbox GL, and Leaflet (OpenStreetMap)
 * Features: markers, routes, heatmaps, dynamic data binding, and theme sync.
 */
export function MapRenderer({ element, state, t }: MapRendererProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [mapInstance, setMapInstance] = useState<any>(null);
    const [googleApi, setGoogleApi] = useState<any>(null);
    const [mapError, setMapError] = useState<string | null>(null);

    // Resolve dynamic bindings
    const center = resolveBinding(element.center, state, t) as [number, number];
    const zoom = resolveBinding(element.zoom, state, t) ?? 10;
    const provider = resolveBinding(element.provider, state, t) ?? "osm";
    const height = resolveBinding(element.height, state, t) ?? 400;
    const markers = resolveBinding(element.markers, state, t) ?? [];
    const routes = resolveBinding(element.routes, state, t) ?? [];
    const heatmap = resolveBinding(element.heatmap, state, t) ?? [];
    const dataSourceId = element.dataSourceId;
    const controls = {
        fullscreen: true,
        zoom: true,
        scale: true,
        geolocate: false,
        streetView: false,
        ...(element.controls || {}),
    };

    /* -------------------------------------------------------
       INITIALIZE MAP INSTANCE
    ------------------------------------------------------- */
    useEffect(() => {
        if (!mapRef.current) return;

        const initMap = async () => {
            try {
                let map: any = null;

                /* ---------- GOOGLE MAPS ---------- */
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

                    map = new google.maps.Map(mapRef.current!, {
                        center: { lat: center[0], lng: center[1] },
                        zoom,
                        mapId: googleConfig.mapId,
                        fullscreenControl: controls.fullscreen,
                        zoomControl: controls.zoom,
                        streetViewControl: controls.streetView,
                        scaleControl: controls.scale,
                    });

                    // Add markers
                    markers.forEach((m: any) => {
                        const marker = new google.maps.Marker({
                            position: { lat: m.lat, lng: m.lng },
                            map,
                            icon: m.iconUrl,
                        });
                        if (m.popup) {
                            const info = new google.maps.InfoWindow({ content: m.popup });
                            marker.addListener("click", () => info.open(map, marker));
                        }
                    });

                    // Add routes
                    routes.forEach((r: any) => {
                        new google.maps.Polyline({
                            path: r.coords.map(([lat, lng]: any) => ({ lat, lng })),
                            map,
                            strokeColor: "#3b82f6",
                            strokeOpacity: 0.8,
                            strokeWeight: 3,
                        });
                    });

                    // Add heatmap
                    if (heatmap.length) {
                        new google.maps.visualization.HeatmapLayer({
                            data: heatmap.map(([lat, lng, w]: any) => ({
                                location: new google.maps.LatLng(lat, lng),
                                weight: w ?? 1,
                            })),
                            map,
                        });
                    }
                }

                /* ---------- MAPBOX ---------- */
                else if (provider === "mapbox") {
                    const mapboxConfig = element.mapbox ?? {};
                    const accessToken = resolveBinding(mapboxConfig.accessToken, state, t);
                    if (!accessToken) throw new Error("Mapbox access token required");

                    mapboxgl.accessToken = accessToken;

                    map = new mapboxgl.Map({
                        container: mapRef.current!,
                        style: mapboxConfig.styleId ?? "mapbox://styles/mapbox/streets-v11",
                        center,
                        zoom,
                    });

                    if (controls.fullscreen) map.addControl(new mapboxgl.FullscreenControl());
                    if (controls.zoom) map.addControl(new mapboxgl.NavigationControl());
                    if (controls.scale) map.addControl(new mapboxgl.ScaleControl());
                    if (controls.geolocate) map.addControl(new mapboxgl.GeolocateControl());

                    map.on("load", () => {
                        // Routes
                        routes.forEach((r: any, i: number) => {
                            const id = `route-${i}`;
                            if (map.getSource(id)) return;
                            map.addSource(id, {
                                type: "geojson",
                                data: {
                                    type: "Feature",
                                    geometry: {
                                        type: "LineString",
                                        coordinates: r.coords.map(([lat, lng]: any) => [lng, lat]),
                                    },
                                },
                            });
                            map.addLayer({
                                id,
                                type: "line",
                                source: id,
                                paint: { "line-color": "#3b82f6", "line-width": 3 },
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
                                    "heatmap-radius": 25,
                                    "heatmap-opacity": 0.7,
                                },
                            });
                        }

                        // Markers
                        markers.forEach((m: any) => {
                            const el = document.createElement("div");
                            el.className = "rounded-full border-2 border-white shadow";
                            el.style.width = "16px";
                            el.style.height = "16px";
                            el.style.backgroundColor = m.color || "#ef4444";
                            new mapboxgl.Marker(el)
                                .setLngLat([m.lng, m.lat])
                                .setPopup(m.popup ? new mapboxgl.Popup().setHTML(m.popup) : undefined)
                                .addTo(map);
                        });
                    });
                }

                /* ---------- LEAFLET / OSM ---------- */
                else {
                    map = L.map(mapRef.current!).setView(center, zoom);

                    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                        attribution: "© OpenStreetMap contributors",
                        maxZoom: 19,
                    }).addTo(map);

                    if (controls.scale) new L.Control.Scale().addTo(map);

                    // Markers
                    markers.forEach((m: any) => {
                        const marker = L.marker([m.lat, m.lng], {
                            icon: m.iconUrl
                                ? L.icon({
                                    iconUrl: m.iconUrl,
                                    iconSize: [32, 32],
                                    iconAnchor: [16, 32],
                                    popupAnchor: [0, -32],
                                })
                                : undefined,
                        }).addTo(map);
                        if (m.popup) marker.bindPopup(m.popup);
                    });

                    // Routes
                    routes.forEach((r: any) => {
                        L.polyline(r.coords, { color: "#3b82f6", weight: 3 }).addTo(map);
                    });

                    // Heatmap
                    if (heatmap.length) {
                        L.heatLayer(
                            heatmap.map(([lat, lng, w]: any) => [lat, lng, w ?? 1]),
                            { radius: 25, blur: 15, max: 1.0 }
                        ).addTo(map);
                    }
                }

                setMapInstance(map);
            } catch (err: any) {
                console.error("Map initialization error:", err);
                setMapError(err.message || String(err));
            }
        };

        initMap();

        // Cleanup
        return () => {
            try {
                if (mapInstance) {
                    if (provider === "mapbox" || provider === "osm") mapInstance.remove();
                }
            } catch {
                // ignore cleanup errors
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provider, center, zoom]);

    /* -------------------------------------------------------
       DYNAMIC DATA UPDATES
    ------------------------------------------------------- */
    useEffect(() => {
        if (!dataSourceId || !mapInstance || !state[dataSourceId]) return;
        const data = state[dataSourceId];

        if (Array.isArray(data)) {
            // Add markers dynamically
            if (provider === "google" && googleApi) {
                data.forEach((item) => {
                    const marker = new googleApi.maps.Marker({
                        position: { lat: item.lat, lng: item.lng },
                        map: mapInstance,
                        icon: item.iconUrl,
                    });
                    if (item.popup) {
                        const info = new googleApi.maps.InfoWindow({ content: item.popup });
                        marker.addListener("click", () => info.open(mapInstance, marker));
                    }
                });
            } else if (provider === "mapbox") {
                data.forEach((item) => {
                    const el = document.createElement("div");
                    el.style.backgroundImage = `url(${item.iconUrl || ""})`;
                    el.style.width = "32px";
                    el.style.height = "32px";
                    el.style.backgroundSize = "cover";
                    new mapboxgl.Marker(el)
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

    /* -------------------------------------------------------
       RENDER
    ------------------------------------------------------- */
    if (mapError) {
        return <div className="text-red-600 p-4">Error loading map: {mapError}</div>;
    }

    return (
        <div
            ref={mapRef}
            className={cn(classesFromStyleProps(element.styles), "w-full rounded-xl overflow-hidden")}
            style={{ height: typeof height === "number" ? `${height}px` : height }}
        />
    );
}
