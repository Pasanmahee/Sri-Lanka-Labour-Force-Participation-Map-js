let labourForceData;
let districts;


const mappa = new Mappa('Leaflet');
let trainMap;
let canvas;
let dataSource;

let data = [];

let currentColor;

const options ={
    lat: 7.8731 ,
    lng : 80.7718 ,
    zoom: 7,
    style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
}

function preload(){
    labourForceData= loadTable('Labour_force_participation_by_province_and_district_2010-2014.csv','header');
    districts = loadJSON("districts.json");
}

function setup() {
 canvas = createCanvas(800,800);
 trainMap = mappa.tileMap(options);
 trainMap.overlay(canvas);

 dataSource = select('#dataSource'); // get the DOM element from the HTML
 dataSource.changed(processData);

 currentColor = color(255, 0, 200, 100); // default color
 processData();
}

function draw() {
  clear();
  for (let district of data) {
    const pix = trainMap.latLngToPixel(district.lat, district.lon);
    fill(currentColor);
    const zoom = trainMap.zoom();
    const scl = pow(1.5, zoom) * sin(frameCount * 0.1); // * sin(frameCount * 0.1);
    ellipse(pix.x, pix.y, district.diameter * scl);
  }
}

function processData() {
  data = []; // always clear the array when picking a new type

  let type = dataSource.value();
  switch (type) {
    case 'labour_foce_participation_2011':
      currentColor = color(64, 250, 200, 100);
      break;
    case '2012 Labour foce participation':
      currentColor = color(255, 0, 200, 100);
      break;
    case '2013 Labour foce participation':
      currentColor = color(200, 0, 100, 100);
      break;
  }

  let maxValue = 0; // changed to something more generic, as we no longer only work with subs
  let minValue = Infinity;

  for (let row of labourForceData.rows) {
    let district = row.get('District_id');
    let latlon = districts[district];
    if (latlon) {
      let lat = latlon[0];
      let lon = latlon[1];
      let count = Number(row.get(type));
      data.push({
        lat,
        lon,
        count
      });
      if (count > maxValue) {
        maxValue = count;
      }
      if (count < minValue) {
        minValue = count;
      }
    }
  }

  let minD = sqrt(minValue);
  let maxD = sqrt(maxValue);

  for (let district of data) {
    district.diameter = map(sqrt(district.count), minD, maxD, 1, 5);
  }
}
