const url = 'https://api.openweathermap.org/data/2.5/weather';
const apiKey = 'e387bcd0c57d81c9b511da94b99cc26a';
let currentCity = 'Hannover';

$(document).ready(function () {
    weatherFn(currentCity);

    $('#city-input-btn').on('click', function() {
        const cityName = $('#city-input').val();
        currentCity = cityName;
        weatherFn(cityName);
        fetchWeather();
    });

    $('#city-input').keypress(function(e) {
        if(e.which == 13) $('#city-input-btn').click();
    });
});

async function weatherFn(cityName) {
    const fullUrl = `${url}?q=${cityName}&appid=${apiKey}&units=metric&lang=de`;
    try {
        const res = await fetch(fullUrl);
        const data = await res.json();
        if(res.ok) {
            showWeather(data);
        } else {
            alert('Stadt nicht gefunden. Bitte versuchen Sie es erneut.');
        }
    } catch(err) {
        console.error('Fehler beim Abrufen der Wetterdaten:', err);
    }
}

function showWeather(data) {
    $('#city-name').text(data.name);
    $('#date').text(moment().format('Do MMMM YYYY, H:mm:ss'));
    $('#temperature').html(`${data.main.temp}°C`);
    $('#description').text(data.weather[0].description);
    $('#wind-speed').html(`Windgeschwindigkeit: ${data.wind.speed} m/s`);
    $('#weather-icon').attr('src', `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`);

    $('#weather-info').hide().fadeIn(800)
        .addClass('animate__animated animate__fadeIn');
}

async function fetchWeather() {
    if(!currentCity) return;
    try {
        await fetch("/city", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ city: currentCity })
        });
    } catch (err) {
        console.error('Ошибка отправки города на p5 сервер:', err);
    }
}
