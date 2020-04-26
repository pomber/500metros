import "ol/ol.css";
import Feature from "ol/Feature";
import Geolocation from "ol/Geolocation";
import Map from "ol/Map";
import View from "ol/View";
import Point from "ol/geom/Point";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource } from "ol/source";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import { fromLonLat } from "ol/proj";

var view = new View({
  center: fromLonLat([-58.3816, -34.6037]),
  zoom: 15,
});

var map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: "map",
  view: view,
});

var geolocation = new Geolocation({
  trackingOptions: {
    enableHighAccuracy: true,
  },
  projection: view.getProjection(),
});

geolocation.setTracking(true);

// handle geolocation error.
geolocation.on("error", function (error) {
  console.log("error", error.message);
});

var positionFeature = new Feature();
positionFeature.setStyle(
  new Style({
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({
        color: "#3399CC",
      }),
      stroke: new Stroke({
        color: "#fff",
        width: 2,
      }),
    }),
  })
);

var autocenter = true;
geolocation.on("change:position", function () {
  var coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
  if (autocenter && coordinates) {
    view.setCenter(coordinates);
    autocenter = false;
  }
});

new VectorLayer({
  map: map,
  source: new VectorSource({
    features: [positionFeature],
  }),
});

var svg = document.querySelector(".svg");
updateSvg();
view.on("change:resolution", updateSvg);
window.addEventListener("resize", updateSvg);

function updateSvg() {
  var H = svg.clientHeight * map.getView().getResolution();
  var W = svg.clientWidth * map.getView().getResolution();
  svg.setAttribute("viewBox", `${-W / 2} ${-H / 2} ${W} ${H}`);
}

document.querySelector(".my-location").addEventListener("click", () => {
  const isTracking = geolocation.getTracking();
  if (isTracking) {
    var coordinates = geolocation.getPosition();
    view.setCenter(coordinates);
  } else {
    geolocation.setTracking(true);
  }
});
