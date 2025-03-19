let rawData = [];
let filteredData = [];

// Fetch data from the updated API
async function fetchData() {
    try {
        // Show loading indicator if it exists
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.innerText = 'Loading restaurant data...';
            loadingElement.style.display = 'block';
        }
        
        // Fetch from our backend instead of directly from Google
        const response = await fetch("/letseat");
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.message || "Unknown error fetching data");
        }
        
        // Store the data
        rawData = result.data;
        filteredData = rawData;

        // Process the data
        populateFilters();
        displayData();
        
        // Setup real-time filtering
        setupRealTimeFiltering();

        // Hide loading screen if it exists
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // Show content
        const contentElement = document.querySelector('.content');
        if (contentElement) {
            contentElement.style.display = 'block';
        }

        // Make sure the random result is hidden on load
        const resultContainer = document.getElementById("randomResult");
        if (resultContainer) {
            resultContainer.style.display = "none";
        }

    } catch (error) {
        console.error("Error fetching restaurant data:", error);
        
        // Show error in loading element if it exists
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.innerText = `Failed to load data: ${error.message}`;
            loadingElement.style.display = 'block';
        }
    }
}

// Populate city and cuisine filters (case-insensitive)
function populateFilters() {
    const cityFilter = document.getElementById("cityFilter");
    const cuisineFilter = document.getElementById("cuisineFilter");

    const cities = [...new Set(rawData.map(item => item.City?.toLowerCase()).filter(city => city))];
    const cuisines = [...new Set(rawData.map(item => item.Cuisine).filter(cuisine => cuisine))];

    cities.forEach(city => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = capitalize(city);
        cityFilter.appendChild(option);
    });

    cuisines.forEach(cuisine => {
        const option = document.createElement("option");
        option.value = cuisine;
        option.textContent = cuisine;
        cuisineFilter.appendChild(option);
    });
}

// Capitalize the first letter of each word
function capitalize(text) {
    return text.replace(/\b\w/g, char => char.toUpperCase());
}

document.querySelector('.ManualFilterContainer').style.display = 'none';
function toggleManualFilter() {
    const container = document.querySelector('.ManualFilterContainer');
    if (container.style.display === 'none' || container.style.display === '') {
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}


// Display the data in the table
function displayData() {
    const tableBody = document.querySelector("#dataTable tbody");
    tableBody.innerHTML = "";

    filteredData.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item["Restaurant Name"] || "N/A"}</td>
            <td>${item.Cuisine || "N/A"}</td>
            <td>${item.Address ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.Address)}" target="_blank">${item.Address}</a>` : "N/A"}</td>
            <td>${item.City || "N/A"}</td>
            <td>${item.State || "N/A"}</td>
            <td>${item.Phone || "N/A"}</td>
            <td>${item.Website ? `<a href="${item.Website}" target="_blank">${item["Restaurant Name"] || "Website"}</a>` : "N/A"}</td>
            <td>${item["Airport Code"] || "N/A"}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Filter data based on user input (case-insensitive)
function filterData() {
    const nameSearch = document.getElementById("nameSearch").value.toLowerCase();
    const cityFilter = document.getElementById("cityFilter").value.toLowerCase();
    const cuisineFilter = document.getElementById("cuisineFilter").value;

    filteredData = rawData.filter(item => {
        const matchesName = item["Restaurant Name"]?.toLowerCase().includes(nameSearch);
        const matchesCity = cityFilter === "" || (item.City && item.City.toLowerCase() === cityFilter);
        const matchesCuisine = cuisineFilter === "" || item.Cuisine === cuisineFilter;
        return matchesName && matchesCity && matchesCuisine;
    });

    displayData();
}

// Add event listeners for real-time filtering
function setupRealTimeFiltering() {
    // Text input - respond to typing with a small delay for performance
    const nameSearchInput = document.getElementById("nameSearch");
    if (nameSearchInput) {
        // Use input event with debounce for better performance
        let debounceTimer;
        nameSearchInput.addEventListener("input", function() {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(filterData, 300); // 300ms delay
        });
    }
    
    // Dropdown selects - respond immediately on change
    const cityFilterSelect = document.getElementById("cityFilter");
    if (cityFilterSelect) {
        cityFilterSelect.addEventListener("change", filterData);
    }
    
    const cuisineFilterSelect = document.getElementById("cuisineFilter");
    if (cuisineFilterSelect) {
        cuisineFilterSelect.addEventListener("change", filterData);
    }
}

// Pick a random restaurant based on the selected city
function pickRandom() {
    const cityFilter = document.querySelectorAll("#cityFilter")[0].value.toLowerCase();

    // Filter the list based on the selected city
    const eligibleRestaurants = rawData.filter(item => {
        const matchesCity = cityFilter === "" || (item.City && item.City.toLowerCase() === cityFilter);
        return matchesCity;
    });

    const resultContainer = document.getElementById("randomResult");

    // Handle no results case
    if (eligibleRestaurants.length === 0) {
        resultContainer.innerHTML = "No matching restaurants available.";
        resultContainer.style.display = "block"; // Show the container
        return;
    }

    // Get random restaurant
    const randomIndex = Math.floor(Math.random() * eligibleRestaurants.length);
    const randomRestaurant = eligibleRestaurants[randomIndex];

    // Update content
    resultContainer.innerHTML = `
        <h2>${randomRestaurant["Restaurant Name"]}</h2>
        <div class="restaurant-info">
            <div class="info-row"><i class="fas fa-utensils"></i> <span>Cuisine:</span> ${randomRestaurant.Cuisine || "N/A"}</div>
            <div class="info-row"><i class="fas fa-map-marker-alt"></i> <span>Address:</span> ${randomRestaurant.Address ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(randomRestaurant.Address)}" target="_blank">${randomRestaurant.Address}</a>` : "N/A"}</div>
            <div class="info-row"><i class="fas fa-globe"></i> <span>Website:</span> <a href="${randomRestaurant.Website || "#"}" target="_blank">${randomRestaurant.Website || "N/A"}</a></div>
        </div>
    `;
    
    // Show the result container
    resultContainer.style.display = "block";
    
    // Refresh the animation (optional)
    resultContainer.style.animation = 'none';
    resultContainer.offsetHeight; // Force reflow
    resultContainer.style.animation = 'fadeIn 0.5s ease-out';
}


// Load data on page load
window.onload = fetchData;
