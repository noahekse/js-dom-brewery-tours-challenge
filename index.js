const stateForm = document.getElementById('select-state-form');
const filterForm = document.getElementById('filter-by-type-form');
const searchBreweriesForm = document.getElementById('search-breweries-form');
const clearAll = document.getElementById('clear-btn');

var breweries = [];
var cities = [];
var checkboxes = [];

let currentPage = 1;
const itemsPerPage = 10;

function setBreweries(newBreweries) {
    breweries = newBreweries;
    cities = [];
    drawBreweries();
  };

  function drawCities() {
    const filterByCityForm = document.getElementById('filter-by-city-form');
    const checkedCities = checkboxes.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);

    filterByCityForm.innerHTML = '';

    checkboxes = [];

    const uniqueCities = [...new Set(cities)];

    uniqueCities.forEach(city => {
        const cityCheckbox = document.createElement('input');
        cityCheckbox.type = 'checkbox';
        cityCheckbox.name = city.toLowerCase();
        cityCheckbox.value = city.toLowerCase();
        cityCheckbox.addEventListener('change', updateBreweriesByCity);
        
        if (checkedCities.includes(city.toLowerCase())) {
            cityCheckbox.checked = true;
        }

        filterByCityForm.appendChild(cityCheckbox);
        checkboxes.push(cityCheckbox);

        const cityLabel = document.createElement('label');
        cityLabel.htmlFor = city.toLowerCase();
        cityLabel.textContent = city;
        filterByCityForm.appendChild(cityLabel);
    });
}

function updateBreweriesByCity() {
    const checkedCities = checkboxes.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);
    const filteredBreweries = breweries.filter(brewery => checkedCities.includes(brewery.city.toLowerCase()));

    // If no cities are checked, fetch all breweries for the selected state
    if (checkedCities.length === 0) {
        fetchBreweries();
        return;
    }
    
    drawBreweries(filteredBreweries);
}

function drawBreweries(filteredBreweries = breweries) {
    const breweriesList = document.getElementById('breweries-list');
    breweriesList.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedBreweries = filteredBreweries.slice(startIndex, endIndex);

    paginatedBreweries.forEach(brewery => {
        const breweryItem = document.createElement('li');
        breweryItem.innerHTML = `
            <h2>${brewery.name}</h2>
            <div class="type">${brewery.brewery_type}</div>
            <section class="address">
                <h3>Address:</h3>
                <p>${brewery.street}</p>
                <p><strong>${brewery.city}, ${brewery.postal_code}</strong></p>
            </section>
            <section class="phone">
                <h3>Phone:</h3>
                <p>${brewery.phone ? brewery.phone : 'N/A'}</p>
            </section>
            <section class="link">
                <a href="${brewery.website_url}" target="_blank">Visit Website</a>
            </section>
        `;
        breweriesList.appendChild(breweryItem);
        cities.push(brewery.city);
    });
    drawCities();
    drawPagination(filteredBreweries.length);
}

function drawPagination(totalItems) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.addEventListener('click', () => {
            changePage(currentPage - 1);
        });
        pagination.appendChild(prevButton);
    }

    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.addEventListener('click', () => {
            changePage(currentPage + 1);
        });
        pagination.appendChild(nextButton);
    }
}

function changePage(page) {
    currentPage = page;
    cities = [];
    drawBreweries();
}

function fetchBreweries() {
    const searchValue = document.getElementById('search-breweries').value;
    const filterValue = document.getElementById('filter-by-type').value;
    const state = document.getElementById('select-state').value;

    fetch(`https://api.openbrewerydb.org/v1/breweries?by_state=${state}&by_name=${searchValue}`)
    .then(response => response.json())
    .then(data => {
        setBreweries(data.filter(brewery => filterValue ? brewery.brewery_type === filterValue : data));
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

stateForm.addEventListener('submit', function(event) {
    event.preventDefault();
    fetchBreweries();

    currentPage = 1;
});

document.getElementById('search-breweries').addEventListener('input', function(event) {
    fetchBreweries();
});

document.getElementById('filter-by-type').addEventListener('change', function(event) {
    fetchBreweries();
});

clearAll.addEventListener('click', function(event) {
    const checkboxes = document.querySelectorAll('#filter-by-city-form input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkbox.checked = false;
        }
    });
    updateBreweriesByCity();
});