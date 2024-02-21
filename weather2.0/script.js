mapboxgl.accessToken =
  "pk.eyJ1IjoiYmluZ293aW5kIiwiYSI6ImNscjZmbWVvZDI5ZzQyc3BuczhndTcxazcifQ.2FksaphqSUrWIEXGkB_Vuw";
const all = "mapbox://styles/bingowind/cls3a3f8r016f01r4c4i93a9m";
const m200 = "mapbox://styles/bingowind/cls39e05r00fz01qldmku88hh";
const m600 = "mapbox://styles/bingowind/cls39h61b001201r0f3ml3fi7";
const m914 = "mapbox://styles/bingowind/cls3a08ee001701r0fv1lgso2";
const munro = "mapbox://styles/bingowind/cls3a2c2000t901qsha4m2m7u";

const map = new mapboxgl.Map({
  container: "map",
  style: all,
  center: [-4.4335, 55.9864], // change to your centre
  zoom: 10
});

const layerList = document.getElementById("menu");
const inputs = layerList.getElementsByTagName("input");

//On click the radio button, toggle the style of the map.
for (const input of inputs) {
  input.onclick = (layer) => {
    if (layer.target.id == "all") {
      map.setStyle(all);
      layers: ["hillsinscot"]
    }
    if (layer.target.id == "m200") {
      map.setStyle(m200);
      layers: ["hills200"]
    }
    if (layer.target.id == "m600") {
      map.setStyle(m600);
      layers: ["hills600"]
    }
    if (layer.target.id == "m914") {
      map.setStyle(m914);
      layers: ["hills914"]
    }
    if (layer.target.id == "munro") {
      map.setStyle(munro);
      layers: ["munro"]
    }
  };
}

map.on("load", () => {
map.addSource("hover", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] }
  });
  map.addLayer({
    id: "dz-hover",
    type: "point",
    source: "hover",
    layout: {},
  });
});


  map.on("mousemove", (event) => {
  const dzone = map.queryRenderedFeatures(event.point, {
    layers: ["hillsinscot"]
  });
    const a = map.queryRenderedFeatures(event.point, {
    layers: ["hills200"]
  });
    const b = map.queryRenderedFeatures(event.point, {
    layers: ["hills600"]
  });
    const c = map.queryRenderedFeatures(event.point, {
    layers: ["hills914"]
  });
    const d = map.queryRenderedFeatures(event.point, {
    layers: ["munro"]
  });
  document.getElementById("pd").innerHTML = dzone.length
    ? `<h3>${dzone[0].properties.hillname}</h3><p>Hight:${dzone[0].properties.metres}m  (Feet:${dzone[0].properties.feet}) </p>`
    : 
    document.getElementById("pd").innerHTML = a.length
    ? `<h3>${a[0].properties.hillname}</h3><p>Hight:${a[0].properties.metres}m  (Feet:${a[0].properties.feet})</p>`
    : document.getElementById("pd").innerHTML = b.length
    ? `<h3>${b[0].properties.hillname}</h3><p>Hight:${b[0].properties.metres}m  (Feet:${b[0].properties.feet})</p>`
    : document.getElementById("pd").innerHTML = c.length
    ? `<h3>${c[0].properties.hillname}</h3><p>Hight:${c[0].properties.metres}m  (Feet:${c[0].properties.feet})</p>`
    : document.getElementById("pd").innerHTML = d.length
    ? `<h3>${d[0].properties.hillname}</h3> <p>Hight:${d[0].properties.metres}m  (Feet:${d[0].properties.feet})</p>`
    : `<p>Hover over a montain ;) <br>
    (click for updated weather imformation)</p>`;
  map.getSource("hover").setData({
    type: "FeatureCollection",
    features: dzone.map(function (f) {
      return { type: "Feature", geometry: f.geometry };
    })
  });
});


 


map.on('click', function(e) {
  const latitude = e.lngLat.lat; 
  const longitude = e.lngLat.lng; 

  const apiKey = '2826149967d27b96e563655b0d1f96fe';
 const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;

  fetch(url)
  .then(response => {
    if (response.ok) {
      return response.json();
    }
    throw new Error('Network response was not ok.');
  })
  .then(data => {
    // current weather
    const currentWeather = data.current.weather[0].description;
    const currentTemp = data.current.temp;
    const feelsLike = data.current.feels_like;
    const windSpeed = data.current.wind_speed;
    
    // next 5 hours
 const currentTimestamp = Math.floor(Date.now() / 1000); // get current time
    const futureHours = data.hourly.filter(hour => hour.dt > currentTimestamp); // filter future time
    const futureThreeHours = futureHours.slice(0, 5); // get next 3 hours

    const hourlyForecast = futureThreeHours.map(hour => {
      const time = new Date(hour.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      return `${time}: ${hour.weather[0].description}, Temp: ${hour.temp}°C`;
    }).join('<br>');
    
    // next day
    const tomorrowForecast = data.daily[1];
    const tomorrowWeather = tomorrowForecast.weather[0].description;
    const tomorrowTemp = {min: tomorrowForecast.temp.min, max: tomorrowForecast.temp.max};
    
    document.getElementById('popup').style.display = 'block';
    document.getElementById('popup').innerHTML = `
      <strong>Current Weather:</strong> ${currentWeather}，<br>Temp: ${currentTemp}°C, feels like: ${feelsLike}°C, Wind speed: ${windSpeed} m/s<br>
      <strong>Weather for the next 5 hours:</strong><br>${hourlyForecast}<br>
      <strong>Weather for the next day:</strong> ${tomorrowWeather}, Max: ${tomorrowTemp.max}°C, Min: ${tomorrowTemp.min}°C
    `;
  })
  
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
});

map.on('mouseleave', function() {
  // 隐藏天气信息
  document.getElementById('popup').style.display = 'none';
});



const geocoder = new MapboxGeocoder({
  // Initialize the geocoder
  accessToken: mapboxgl.accessToken, // Set the access token
  mapboxgl: mapboxgl, // Set the mapbox-gl instance
  marker: false, // Do not use the default marker style
  placeholder: "Search for places in Scotland", // Placeholder text for the search bar
  proximity: {
    longitude: 55.8642,
    latitude: 4.2518
  } // Coordinates of Glasgow center
});

map.addControl(geocoder, "top-left");

//map.addControl(new mapboxgl.NavigationControl(), "top-left");

map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
  }),
  "top-left"
);


const scale = new mapboxgl.ScaleControl({
  maxWidth: 80, //size of the scale bar
  unit: "metric"
});
map.addControl(scale);