const socket = io();
const deviceInfo = getDeviceInfo();

const markers = {};

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    position => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { latitude, longitude });
    },
    error => {
      console.error(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000, // 5 sec timeout repeat request
      maximumAge: 0, // no caching
    }
  );
}

var shopLocation = L.marker([24.365475, 88.599898]).bindPopup(
    "HOME GARAGE BD <br> Saheb Bazar Rd, Rajshahi"
  ),
  denver = L.marker([39.74, -104.99]).bindPopup("This is Denver, CO.");

var cities = L.layerGroup([shopLocation]);

const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    'Real-Time Tracker Made By  <a href="https://mdsiamislamsagor-dev.web.app"><strong>SIAM DEV</strong></a>',
});

const osmHOT = L.tileLayer(
  "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
  {
    maxZoom: 19,
    attribution:
      'Real-Time Tracker Made By  <a href="https://mdsiamislamsagor-dev.web.app"><strong>SIAM DEV</strong></a>',
  }
);
var baseMaps = {
  OpenStreetMap: osm,
  "OpenStreetMap.HOT": osmHOT,
};

var overlayMaps = {
  Cities: cities,
};

var baseMaps = {
  OpenStreetMap: osm,
  "<span style='color: red'>OpenStreetMap.HOT</span>": osmHOT,
};

const map = L.map("map", {
  zoom: 10,
  layers: [osm, cities],
}).setView([0, 0], 15);
var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    'Real-Time Tracker Made By  <a href="https://mdsiamislamsagor-dev.web.app"><strong>SIAM DEV</strong></a>',
}).addTo(map);

var openTopoMap = L.tileLayer(
  "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 19,
    attribution:
      'Real-Time Tracker Made By  <a href="https://mdsiamislamsagor-dev.web.app"><strong>SIAM DEV</strong></a>',
  }
);

layerControl.addBaseLayer(openTopoMap, "OpenTopoMap");

socket.on("receive-location", data => {
  const { id, name, latitude, longitude } = data;
  map.setView([latitude, longitude]);
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(
        `User Id: ${id} <br> User Name: ${name} <br> Operating System: ${deviceInfo.os} <br> Device Type: ${deviceInfo.deviceType}`
      )
      .openPopup();
  }
});

socket.on("user-disconnected", id => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});

function getDeviceInfo() {
  const userAgent = navigator.userAgent;

  // Detect OS
  const os = (() => {
    if (userAgent.indexOf("Windows NT") !== -1) return "Windows";
    if (userAgent.indexOf("Mac OS X") !== -1) return "macOS";
    if (userAgent.indexOf("Android") !== -1) return "Android";
    if (userAgent.indexOf("iPhone") !== -1 || userAgent.indexOf("iPad") !== -1)
      return "iOS";
    if (userAgent.indexOf("Linux") !== -1) return "Linux";
    return "Unknown OS";
  })();

  // Detect Device Type
  const deviceType = /Mobi|Android/i.test(userAgent) ? "Mobile" : "Desktop";

  return { os, deviceType };
}
