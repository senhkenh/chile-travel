const API_KEY = 'fcd67562ded35ee195e3b71e021fc6aa';
const CITY = 'Puerto Montt';
const CURRENT_URL = `https://api.openweathermap.org/data/2.5/weather?q=${CITY},CL&units=metric&appid=${API_KEY}`;
const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${CITY},CL&units=metric&appid=${API_KEY}`;

async function fetchWeather() {
    try {
        const [currentRes, forecastRes] = await Promise.all([
            fetch(CURRENT_URL),
            fetch(FORECAST_URL)
        ]);
        const current = await currentRes.json();
        const forecast = await forecastRes.json();
        
        if (current.cod === 200) {
            updateWeatherUI(current);
        }
        if (forecast.cod === '200') {
            updateForecastUI(forecast);
        }
    } catch (error) {
        showFallbackWeather();
    }
}

function updateWeatherUI(data) {
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('condition').textContent = data.weather[0].description;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('wind').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    document.getElementById('weatherIcon').textContent = getWeatherIcon(data.weather[0].main);
}

function updateForecastUI(data) {
    const dailyData = {};
    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        if (!dailyData[day] && Object.keys(dailyData).length < 5) {
            dailyData[day] = {
                temp: Math.round(item.main.temp),
                condition: item.weather[0].main,
                icon: getWeatherIcon(item.weather[0].main)
            };
        }
    });
    
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = Object.entries(dailyData).map(([day, info]) => `
        <div class="forecast-day">
            <div class="day-name">${day}</div>
            <div class="day-icon">${info.icon}</div>
            <div class="day-temp">${info.temp}°C</div>
        </div>
    `).join('');
}

function showFallbackWeather() {
    document.getElementById('temperature').textContent = '15°C';
    document.getElementById('condition').textContent = 'Partly Cloudy';
    document.getElementById('humidity').textContent = '75%';
    document.getElementById('wind').textContent = '12 km/h';
    document.getElementById('weatherIcon').textContent = '⛅';
}

function getWeatherIcon(condition) {
    const icons = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Fog': '🌫️'
    };
    return icons[condition] || '🌤️';
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

const dateInput = document.getElementById('travelDate');
const tourSelect = document.getElementById('tourSelect');
const numPeople = document.getElementById('numPeople');
const addTourBtn = document.getElementById('addTour');
const bookNowBtn = document.getElementById('bookNow');
const selectedToursDiv = document.getElementById('selectedTours');

let selectedTours = [];

if (dateInput) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().split('T')[0];
}

const tourPrices = {
    'osorno': 85, 'todoslossantos': 65, 'harbor': 35, 'coast': 45,
    'andean': 95, 'heritage': 30, 'wilderness': 75, 'kayaking': 55,
    'viewpoint': 40, 'reserve': 60, 'lakeside': 50, 'patagonia': 120
};

if (addTourBtn) {
    addTourBtn.addEventListener('click', () => {
        const tour = tourSelect.value;
        const tourText = tourSelect.options[tourSelect.selectedIndex].text;
        const people = parseInt(numPeople.value);
        const date = dateInput.value;

        if (!tour) {
            alert('Please select a tour');
            return;
        }
        if (!date) {
            alert('Please select a date');
            return;
        }

        const price = tourPrices[tour] * people;
        selectedTours.push({ tour: tourText, people, date, price });
        
        updateSelectedTours();
        tourSelect.value = '';
    });
}

function updateSelectedTours() {
    if (selectedTours.length === 0) {
        selectedToursDiv.classList.remove('active');
        selectedToursDiv.innerHTML = '';
        return;
    }

    selectedToursDiv.classList.add('active');
    selectedToursDiv.innerHTML = selectedTours.map((item, index) => `
        <div class="tour-item">
            <span>${item.tour} x${item.people} - ${new Date(item.date).toLocaleDateString()} - $${item.price}</span>
            <button onclick="removeTour(${index})">Remove</button>
        </div>
    `).join('');
}

window.removeTour = function(index) {
    selectedTours.splice(index, 1);
    updateSelectedTours();
};

if (bookNowBtn) {
    bookNowBtn.addEventListener('click', () => {
        if (selectedTours.length === 0) {
            alert('Please add at least one tour');
            return;
        }

        const total = selectedTours.reduce((sum, item) => sum + item.price, 0);
        const summary = selectedTours.map(item => 
            `${item.tour} x${item.people} on ${new Date(item.date).toLocaleDateString()}`
        ).join('\n');
        
        alert(`Booking Summary:\n\n${summary}\n\nTotal: $${total} USD\n\nThank you! We'll contact you shortly.`);
        selectedTours = [];
        updateSelectedTours();
    });
}

window.addEventListener('load', fetchWeather);
