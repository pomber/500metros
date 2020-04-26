import "ol/ol.css";
import Feature from "ol/Feature";
import Geolocation from "ol/Geolocation";
import Map from "ol/Map";
import View from "ol/View";
import Point from "ol/geom/Point";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource } from "ol/source";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import { fromLonLat, METERS_PER_UNIT } from "ol/proj";

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

// setInterval(() => {
//   console.log(METERS_PER_UNIT["m"], map.getView().getResolution());
// });

var geolocation = new Geolocation({
  // enableHighAccuracy must be set to true to have the heading value.
  trackingOptions: {
    enableHighAccuracy: true,
  },
  projection: view.getProjection(),
});

geolocation.setTracking(true);

// update the HTML page when the position changes.
geolocation.on("change", function () {
  // el("speed").innerText = geolocation.getSpeed() + " [m/s]";
});

// handle geolocation error.
geolocation.on("error", function (error) {
  console.log("error", error.message);
});

// var accuracyFeature = new Feature();
// geolocation.on("change:accuracyGeometry", function () {
//   accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
// });

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

geolocation.on("change:position", function () {
  var coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
  view.setCenter(coordinates);
});

new VectorLayer({
  map: map,
  source: new VectorSource({
    features: [positionFeature],
  }),
});

var svg = document.getElementById("svg");
updateSvg();
svg.style.visibility = "visible";
view.on("change:resolution", updateSvg);

function updateSvg() {
  var H = svg.clientHeight * map.getView().getResolution();
  var W = svg.clientWidth * map.getView().getResolution();
  svg.setAttribute("viewBox", `${-W / 2} ${-H / 2} ${W} ${H}`);
}
