
        $(document).ready(function () {
            var pastStorage = JSON.parse(localStorage.getItem("cities"))
            var cities = ["Atlanta", "Moscow", "Seattle"]

            //Load default cities for new user, none item stored in local storage
            function loadDefaultCities() {
                for (var i = 0; i < cities.length; i++) {
                    // console.log(cities.length)
                    var newDiv = $("<button>");
                    newDiv.text(cities[i]);
                    newDiv.addClass("list-group-item hvr-shutter-out-horizontal");
                    newDiv.attr("data-name", cities[i])
                    newDiv.appendTo($("#search-cities"))
                }
            }

            //Load all the cities stored in local storage for past users
            function loadNewCities() {
                for (var i = 0; i < pastStorage.length; i++) {
                    // console.log(cities.length)
                    var newDiv = $("<button>");
                    newDiv.text(pastStorage[i]);
                    newDiv.addClass("list-group-item hvr-shutter-out-horizontal");
                    newDiv.attr("data-name", pastStorage[i]);
                    newDiv.appendTo($("#search-cities"))
                }
            }

            //Populate all data in the right dashboard
            function showWeather() {
                var nameOfTheCityClicked = ($(this).attr("data-name"));
                var weatherUrl = "http://api.openweathermap.org/data/2.5/weather?q=" + nameOfTheCityClicked + "&units=imperial&appid=4aa00dba2ffa0a80a6d24790f15d7055"
                var selectIcon = ($("#icon"))

                // console.log(weatherUrl)

                //populate the weather info
                $.ajax({
                    url: weatherUrl,
                    method: "GET"
                })
                    .then(function (response) {
                        // console.log(weatherUrl)
                        // console.log(response.main.temp)
                        //add city name
                        var localTime = moment().format("MMMM Do YYYY")
                        $("#city-name").text(nameOfTheCityClicked + " (" + localTime + ")")

                        //add temperature
                        var currentTemperature = response.main.temp;
                        $("#temperature").text("Temperature: " + currentTemperature + "\u00B0 F")

                        //add icon
                        // console.log(select)
                        var iconUrl = response.weather[0].icon
                        $(selectIcon).attr("src", "http://openweathermap.org/img/wn/" + iconUrl + "@2x.png")

                        //add humidity
                        var currentHumidity = response.main.humidity;
                        $("#humidity").text("Humidity: " + currentHumidity + "%")

                        //add wind-speed
                        var currentWindSpeed = response.wind["speed"]
                        $("#wind-speed").text("Wind speed: " + currentWindSpeed + " MPH")

                        //find longitude and latitude of current city
                        var lat = response.coord.lat;
                        var long = response.coord.lon
                        var forecastUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + long + "&exclude=current,minutely,hourly&appid=4aa00dba2ffa0a80a6d24790f15d7055&units=imperial"
                        var uvIndexUrl = "http://api.openweathermap.org/data/2.5/uvi?appid=4aa00dba2ffa0a80a6d24790f15d7055&lat=" + lat + "&lon=" + long

                        // add 5day forecast
                        $.ajax({
                            url: forecastUrl,
                            method: "GET"
                        })
                            .then(function (response) {
                                console.log(forecastUrl)
                                for (var i = 2; i < 7; i++) {
                                    // console.log($("#date" + i))
                                    $("#date" + i).text(moment().add(i - 1, "days").format("MM/D/YYYY"))
                                    $("#temperature" + i).text("Temp: " + response.daily[i - 1].temp.day + "\u00B0 F")
                                    $("#humidity" + i).text("Humidity: " + response.daily[i - 1].humidity + "%")
                                    var iconUrl = response.daily[i - 1].weather[0].icon
                                    $("#icon" + i).attr("src", "http://openweathermap.org/img/wn/" + iconUrl + "@2x.png")
                                }
                            })

                        //add uv index
                        $.ajax({
                            url: uvIndexUrl,
                            method: "GET"
                        })
                            .then(function (response) {
                                // console.log(response)
                                var uvIndex = response.value
                                $("#uv-index").text(uvIndex)
                                var indexInNumber = parseInt($("#uv-index").text())
                                $("#uv-index").toggleClass("red", indexInNumber >= 8);
                                $("#uv-index").toggleClass("orange", indexInNumber <= 7 && indexInNumber > 5)
                                $("#uv-index").toggleClass("yellow", indexInNumber <= 5 && indexInNumber > 2)
                                $("#uv-index").toggleClass("green", indexInNumber <= 2)
                            })
                    })

            }

            //upon click search, save city to local storage, create new button and display on left sidebar
            $("#search").on("click", function search(event) {
                event.preventDefault();
                var desireCity = $("#city").val().trim();
                if (!desireCity) { return }
                else {
                    $("#search-cities").empty()
                    if (pastStorage === null) {
                        cities.push(desireCity);
                        localStorage.setItem("cities", JSON.stringify(cities));
                        loadDefaultCities()
                        $("#city").val("")
                    }
                    else {
                        pastStorage.push(desireCity);
                        localStorage.setItem("cities", JSON.stringify(pastStorage));
                        // console.log("not empty")
                        loadNewCities()
                        $("#city").val("")
                    }
                }
            })

            //when click on the city, do an Ajax, call, get weather info of the city based on data-name and plug into the weather dashboard
            $(document).on("click", "button[data-name]", showWeather)

            //Upon loading screen, display weather info for the last searched city
            if (pastStorage === null) {
                loadDefaultCities()
                // console.log($("#search-cities button:last-child").text())
                var lastSearch = $("#search-cities button:last-child")
                lastSearch.trigger("click")
            }
            else {
                loadNewCities()
                // console.log($("#search-cities button:last-child").text())
                var lastSearch = $("#search-cities button:last-child")
                lastSearch.trigger("click")
            }

            $(".clearBtn").click(function () {
                localStorage.clear()
                location.reload()
            })
        })