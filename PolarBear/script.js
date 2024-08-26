// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken =
  "pk.eyJ1IjoiYmluZ293aW5kIiwiYSI6ImNscjZmbWVvZDI5ZzQyc3BuczhndTcxazcifQ.2FksaphqSUrWIEXGkB_Vuw"; // 替换为你的 Mapbox Access Token

// 初始化地图
const map = new mapboxgl.Map({
  container: "map", // 对应 HTML 中地图的容器 ID
  style: "mapbox://styles/bingowind/cm09n9owr00mk01qt4whnas1p", // 替换为你的 Mapbox 样式 URL
  center: [-165, 70], // 设置地图初始中心坐标 [经度, 纬度]
  zoom: 5 // 设置初始缩放级别
});

const data_url =
  "https://api.mapbox.com/datasets/v1/bingowind/cm09lnkb99nvs1mlprkgg0b9i/features?access_token=pk.eyJ1IjoiYmluZ293aW5kIiwiYSI6ImNscjZmbWVvZDI5ZzQyc3BuczhndTcxazcifQ.2FksaphqSUrWIEXGkB_Vuw";

map.on("load", () => {
  map.addLayer({
    id: "crimes",
    //type: 'circle',
    source: {
      type: "geojson",
      data: data_url
    },
    paint: {
      "circle-radius": 10,
      "circle-color": "#eb4d4b",
      "circle-opacity": 0.9
    }
  });

  type = "all";
  filterType = ["!=", ["get", "Crime Type"], "placeholder"];
  filterMonth = ["=="[("get", "Month")], "2021-01"];

  if (type == "all") {
    filterType = ["!=", ["get", "Crime type"], "placeholder"];
  } else if (type == "shoplifting") {
    filterType = ["==", ["get", "Crime type"], "Burglary"];
  } else if (type == "bike") {
    filterType = ["==", ["get", "Crime type"], "Burglary"];
  } else {
    console.log("error");
  }
  map.setFilter("crimes", ["all", filterMonth, filterType]);
});
document.getElementById("slider").addEventListener("input", (event) => {
  //Get the month value from the slider
  const month = parseInt(event.target.value);

  // get the correct format for the data
  formatted_month = "2021-" + ("0" + month).slice(-2);
  //Create a filter

  filterMonth = ["==", ["get", "Month"], formatted_month];
  //set the map filter
  map.setFilter("crimes", ["all", filterType, filterMonth]);

  // update text in the UI
  document.getElementById("active-month").innerText = month;
});
//Radio button interaction code goes below
document.getElementById("filters").addEventListener("change", (event) => {
  const type = event.target.value;
  console.log(type);
  // update the map filter
  if (type == "all") {
    filterType = ["!=", ["get", "Crime type"], "placeholder"];
  } else if (type == "shoplifting") {
    filterType = ["==", ["get", "Crime type"], "Drugs"];
  } else if (type == "bike") {
    filterType = ["==", ["get", "Crime type"], "Burglary"];
  } else {
    console.log("error");
  }
  console.log(filterType);
  map.setFilter("crimes", ["all", filterMonth, filterType]);
});

// 添加地图控件（如缩放、旋转等）
map.addControl(new mapboxgl.NavigationControl());

// 可以根据需要添加更多功能，比如：
// 添加一个标记
new mapboxgl.Marker()
  .setLngLat([-74.5, 40]) // 设置标记位置
  .addTo(map); // 添加到地图

// 添加一个弹出框
const popup = new mapboxgl.Popup({ offset: 25 }).setText(
  "Hello, this is a popup!"
);

new mapboxgl.Marker()
  .setLngLat([-74.5, 40]) // 设置弹出框位置
  .setPopup(popup) // 关联弹出框
  .addTo(map); // 添加到地图