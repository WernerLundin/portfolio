async function fetchWeatherData(lat, lon) {
  const url = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${lon}/lat/${lat}/data.json`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
  }
}

const filters = {
  temp: "t",
  humidity: "r",
  windDirection: "wd",
  windSpeed: "ws",
};

// Gets the current weathers parameters. Uses filter to get specific parameters.
async function getParameter(lat, lon, filter) {
  const data = await fetchWeatherData(lat, lon);

  const latestParameter = [];
  const params = data.timeSeries[0].parameters;
  params.forEach((element) => {
    if (element.name == filter) {
      latestParameter.push(element);
    }
  });

  return latestParameter;
}

// Gets weather from every other hour.
async function weather2h(lat, lon) {
  const data = await fetchWeatherData(lat, lon);
  const weather2h = [];
  const timeSeries = data.timeSeries;

  for (let i = 0; i < timeSeries.length; i++) {
    if (i % 2 === 0) {
      weather2h.push(timeSeries[i]);
    }
  }
  console.log(weather2h);
  return weather2h;
}

async function obj2h(lat, lon) {
  const weather2hArr = await weather2h(lat, lon);

  const validTime = [];
  const tempArr = [];
  const wSArr = [];
  weather2hArr.forEach((element) => {
    validTime.push(element.validTime);
    element.parameters.forEach((e) => {
      if (e.name == "t") {
        tempArr.push(e.values[0]);
      }
      if (e.name == "ws") {
        wSArr.push(e.values[0]);
      }
    });
  });
  const obj = {
    validTime: validTime,
    tempArr: tempArr,
    wSArr: wSArr,
  };

  console.log(obj);
  return obj;
}
function weatherParser(validTime, temp, windSpeed) {
  const obj = {
    validTime: validTime,
    temp: temp,
    windSpeed: windSpeed,
  };
  return JSON.stringify(obj);
}
async function weather2htest(lat, lon) {
  const arr = await obj2h(lat, lon);

  const returnValue = [];

  for (let index = 0; index < arr.validTime.length; index++) {
    returnValue.push({
      validTime: arr.validTime[index],
      temp: arr.tempArr[index],
      windSpeed: arr.wSArr[index],
    });
  }
  console.log(returnValue);
  return returnValue;
}
async function test() {
  const element = await weather2htest(59, 18);
  console.log(element);
}
// test();
// Uses getParameters to get the wind direction and sets compass direction
async function windDirection(lat, lon) {
  const wd = await getParameter(lat, lon, filters.windDirection);
  const arrow = document.querySelector("#arrow");
  let returnValue = "";
  const degrees = `rotate(${wd[0].values[0]}deg)`;
  arrow.style.transform = degrees;

  if (wd[0].values[0] >= 337 || wd[0].values[0] <= 22) {
    console.log("Norr");
    returnValue = returnValue + "Norr";
  } else if (wd[0].values[0] >= 23 && wd[0].values[0] <= 68) {
    console.log("Nordöst");
    returnValue = returnValue + "Nordöst";
  } else if (wd[0].values[0] >= 69 && wd[0].values[0] <= 114) {
    console.log("Öst");
    returnValue = returnValue + "Öst";
  } else if (wd[0].values[0] >= 115 && wd[0].values[0] <= 160) {
    console.log("Sydöst");
    returnValue = returnValue + "Sydöst";
  } else if (wd[0].values[0] >= 161 && wd[0].values[0] <= 206) {
    console.log("Syd");
    returnValue = returnValue + "Syd";
  } else if (wd[0].values[0] >= 207 && wd[0].values[0] <= 252) {
    console.log("Sydväst");
    returnValue = returnValue + "Sydväst";
  } else if (wd[0].values[0] >= 253 && wd[0].values[0] <= 298) {
    console.log("Väst");
    returnValue = returnValue + "Väst";
  } else if (wd[0].values[0] >= 299 && wd[0].values[0] <= 336) {
    console.log("Nordväst");
    returnValue = returnValue + "Nordväst";
  } else {
    console.log("fel");
  }
  return returnValue;
}
//event listner for refresh button.
const refreshButton = document.querySelector("#saved-weather-button");
const savedList = document.createElement("ul");
savedList.setAttribute("id", "list");

refreshButton.addEventListener("click", async (e) => {
  const res = await fetch("http://localhost:3000/days");
  const savedWeatherArr = await res.json();
  savedList.innerHTML = "";
  savedWeatherArr.forEach((element) => {
    const li = document.createElement("li");
    li.setAttribute("class", "list-item");
    const deleteButton = document.createElement("button");
    deleteButton.setAttribute("class", "save-and-delete-button");
    deleteButton.innerHTML = "Delete";
    deleteButton.setAttribute("id", element._id);
    li.innerHTML = `Datum ${element.validTime}, Temperatur ${element.temperature}, Windhastighet ${element.windSpeed}`;
    deleteButton.addEventListener("click", async (e) => {
      if (e.target.id === element._id) {
        console.log(element._id);

        await fetch(`http://localhost:3000/${element._id}`, {
          method: "delete",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    });
    li.appendChild(deleteButton);

    savedList.appendChild(li);
  });
  document.querySelector("#saved-weather-list").appendChild(savedList);
});

document.querySelector("#södertälje").addEventListener("click", (event) => {
  event.preventDefault();

  document.querySelector("#lat").value = 59.2;
  document.querySelector("#lon").value = 17.6;
});
document.querySelector("#stockholm").addEventListener("click", (event) => {
  event.preventDefault();

  document.querySelector("#lat").value = 59.33;
  document.querySelector("#lon").value = 18;
});

document
  .querySelector("#weather-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    document.querySelector("#weather-div").innerHTML = "";
    document.querySelector("#weather-list").innerHTML = "";

    const lat = document.querySelector("#lat").value;
    const lon = document.querySelector("#lon").value;
    const wd = await windDirection(lat, lon);

    const ws = await getParameter(lat, lon, filters.windSpeed);
    const temperatureData = await getParameter(lat, lon, filters.temp);
    const weatherList = await weather2htest(lat, lon);

    const list = document.createElement("ul");

    list.setAttribute("id", "list");

    weatherList.forEach((element) => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.innerHTML = "Save";
      li.innerHTML = `Datum: ${element.validTime}, Temperatur: ${element.temp}, Windhastighet: ${element.windSpeed}`;
      li.setAttribute("id", element.validTime);
      li.setAttribute("class", "list-item");
      button.setAttribute("id", element.validTime);
      button.setAttribute("validTime", element.validTime);
      button.setAttribute("windSpeed", element.windSpeed);
      button.setAttribute("temp", element.temp);
      button.setAttribute("class", "save-and-delete-button");
      button.addEventListener("click", async (e) => {
        if (e.target.id === li.id) {
          console.log(e);
          const obj = weatherParser(
            e.target.attributes.validTime.value,
            e.target.attributes.temp.value,
            e.target.attributes.windSpeed.value
          );
          console.log(obj);
          const res = await fetch("http://localhost:3000", {
            method: "POST",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
            },
            body: obj,
          });

          console.log(res);
        }
      });

      li.appendChild(button);
      list.appendChild(li);
    });

    const pEl = document.createElement("p");
    pEl.innerHTML = `Det är ${temperatureData[0].values[0]} grader utomhus`;
    pEl.setAttribute("class", "p-element");
    const pEl2 = document.createElement("p");
    pEl2.innerHTML = `Vind hastigheten är ${ws[0].values[0]} m/s i riktingen ${wd}`;
    pEl2.setAttribute("class", "p-element");

    document.querySelector("#weather-list").appendChild(list);
    document.querySelector("#weather-div").appendChild(pEl);
    document.querySelector("#weather-div").appendChild(pEl2);
  });
