// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken =
  "pk.eyJ1IjoiYmluZ293aW5kIiwiYSI6ImNscjZmbWVvZDI5ZzQyc3BuczhndTcxazcifQ.2FksaphqSUrWIEXGkB_Vuw";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/bingowind/cm09n9owr00mk01qt4whnas1p",
  center: [-160, 70], // 初始化地图的中心
  zoom: 5 // 初始化地图的缩放级别
});

// 加载数据集
const datasetUrl =
  "https://api.mapbox.com/datasets/v1/bingowind/cm09v9g3e0kn21up8dbeuncog/features?access_token=pk.eyJ1IjoiYmluZ293aW5kIiwiYSI6ImNscjZmbWVvZDI5ZzQyc3BuczhndTcxazcifQ.2FksaphqSUrWIEXGkB_Vuw";
let bearData = [];
const popup = new mapboxgl.Popup();

map.on("load", () => {
  // 添加数据源，类型为geojson
  map.addSource("bears", {
    type: "geojson",
    data: datasetUrl
  });

  // 添加图层
  map.addLayer({
    id: "bear-layer",
    //type: "circle",
    type: "symbol",
    source: "bears",
    //paint: {
    // "circle-radius": 5,
    // "circle-color": "#007cbf"
    // }
    layout: {
      "icon-image": "polarbear",
      "icon-size": 0.1
    }
  });

  // 加载数据并填充选择框
  fetchData();
});

map.on("click", "bear-layer", (e) => {
  const features = e.features[0];
  const coordinates = features.geometry.coordinates.slice();
  const { animal, date, time, LocationQuality } = features.properties;

  // 保证坐标正确
  while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
  }

  // 设置弹窗内容
  popup
    .setLngLat(coordinates)
    .setHTML(
      `<strong>ID:</strong> ${animal}<br><strong>Date:</strong> ${date}<br><strong>Time:</strong> ${time}<br><strong>Location Quality:</strong> ${LocationQuality}`
    )
    .addTo(map);
});

// 鼠标悬停样式变化
map.on("mouseenter", "bear-layer", () => {
  map.getCanvas().style.cursor = "pointer";
});

// 鼠标移出时恢复样式
map.on("mouseleave", "bear-layer", () => {
  map.getCanvas().style.cursor = "";
});

// 获取所有的北极熊ID并填充下拉菜单
function fetchData() {
  // 请求数据并填充选择框
  map.on("sourcedata", (e) => {
    if (e.sourceId === "bears" && e.isSourceLoaded) {
      bearData = map.querySourceFeatures("bears");
      populateBearSelect();
    }
  });
}

function populateBearSelect() {
  const bearSelect = document.getElementById("bearSelect");
  const bearIds = [
    ...new Set(bearData.map((feature) => feature.properties.animal))
  ];
  bearIds.sort();

  bearIds.forEach((id) => {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = id;
    bearSelect.appendChild(option);
  });
}

function parseDateString(dateString) {
  // 将MM/DD/YYYY格式转换为YYYY-MM-DD
  const [month, day, year] = dateString.split("/");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function filterData() {
  const bearSelect = document.getElementById("bearSelect").value;
  const startDateInput = document.getElementById("startDate").value;
  const endDateInput = document.getElementById("endDate").value;

  // 将输入的日期转换为Date对象
  const startDate = startDateInput ? new Date(startDateInput) : null;
  const endDate = endDateInput ? new Date(endDateInput) : null;

  const filters = ["all"];

  if (bearSelect) {
    filters.push(["==", ["get", "animal"], bearSelect]);
  }

  if (startDate || endDate) {
    bearData.forEach((feature) => {
      const featureDate = new Date(parseDateString(feature.properties.date));
      if (startDate && featureDate < startDate) {
        filters.push([
          ">=",
          ["get", "date"],
          startDate.toISOString().split("T")[0]
        ]);
      }
      if (endDate && featureDate > endDate) {
        filters.push([
          "<=",
          ["get", "date"],
          endDate.toISOString().split("T")[0]
        ]);
      }
    });
  }
  map.setFilter("bear-layer", null);

  map.setFilter("bear-layer", filters);
}

map.addControl(new mapboxgl.NavigationControl(), "top-right");

// 添加比例尺控件
map.addControl(
  new mapboxgl.ScaleControl({
    maxWidth: 80,
    unit: "metric" // 可以是'metric'或'imperial'
  }),
  "bottom-right"
);