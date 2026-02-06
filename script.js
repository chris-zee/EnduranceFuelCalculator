const products = [
    { name: "GU Energy Gel", carbs: 22, sodium: 55, potassium: 35, caffeine: 0 },
    { name: "GU Energy Gel (Caffeine)", carbs: 22, sodium: 55, potassium: 35, caffeine: 40 },
    { name: "Maurten Gel 100", carbs: 25, sodium: 35, potassium: 10, caffeine: 0 },
    { name: "SIS Isotonic Gel", carbs: 22, sodium: 20, potassium: 10, caffeine: 0 },
    { name: "Honey Stinger Gel", carbs: 24, sodium: 60, potassium: 15, caffeine: 0 },
    { name: "Spring Energy Gel", carbs: 20, sodium: 100, potassium: 50, caffeine: 0 },
    { name: "Huma Chia Gel", carbs: 21, sodium: 80, potassium: 40, caffeine: 0 },
    { name: "Clif Shot Bloks (3 pieces)", carbs: 24, sodium: 70, potassium: 20, caffeine: 0 },
    { name: "Skratch Energy Chews (4 pieces)", carbs: 24, sodium: 100, potassium: 25, caffeine: 0 },
    { name: "Tailwind (1 scoop)", carbs: 25, sodium: 303, potassium: 88, caffeine: 0 },
    { name: "UCAN Edge Gel", carbs: 20, sodium: 110, potassium: 45, caffeine: 0 },
    { name: "SaltStick Caps (1 capsule)", carbs: 0, sodium: 215, potassium: 63, caffeine: 0 },
    { name: "Banana (medium)", carbs: 27, sodium: 1, potassium: 422, caffeine: 0 },
    { name: "Date (2 pieces)", carbs: 18, sodium: 0, potassium: 120, caffeine: 0 },
    { name: "Stroopwafel", carbs: 21, sodium: 100, potassium: 20, caffeine: 0 },
];

let fuelPlan = [];
let caffeineEnabled = false;
let customProductFormVisible = false;
let favorites = [];
let searchQuery = '';
let productsSectionVisible = true;

// Toggle products section accordion
function toggleProductsSection() {
    productsSectionVisible = !productsSectionVisible;
    const section = document.getElementById('productsSection');
    const toggle = document.getElementById('productsSectionToggle');
    
    if (productsSectionVisible) {
        section.style.display = 'block';
        toggle.innerHTML = '<i class="fa-solid fa-caret-up"></i>';
    } else {
        section.style.display = 'none';
        toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }
}

// Load favorites from localStorage
function loadFavorites() {
    const saved = localStorage.getItem('favoriteFuelProducts');
    if (saved) {
        try {
            favorites = JSON.parse(saved);
        } catch (e) {
            console.error('Error loading favorites:', e);
            favorites = [];
        }
    }
}

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem('favoriteFuelProducts', JSON.stringify(favorites));
}

// Toggle favorite status
function toggleFavorite(productName, event) {
    event.stopPropagation(); // Prevent adding product when clicking star
    
    const index = favorites.indexOf(productName);
    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(productName);
    }
    saveFavorites();
    renderProducts();
}

// Get product quantity in fuel plan
function getProductQuantity(productName) {
    const item = fuelPlan.find(item => item.product.name === productName);
    return item ? item.quantity : 0;
}

// Toggle caffeine settings
function toggleCaffeineStrategy() {
    caffeineEnabled = !caffeineEnabled;
    const caffeineSettings = document.getElementById('caffeineSettings');
    const toggleBtn = document.getElementById('caffeineToggleBtn');
    
    if (caffeineEnabled) {
        caffeineSettings.style.display = 'block';
        toggleBtn.style.display = 'none';
        updateCaffeinePlan();
    } else {
        caffeineSettings.style.display = 'none';
        toggleBtn.style.display = 'block';
    }
    updateSummary();
}

// Toggle custom product form
function toggleCustomProduct() {
    customProductFormVisible = !customProductFormVisible;
    const customForm = document.getElementById('customProductForm');
    const toggleBtn = document.getElementById('customProductToggleBtn');
    
    if (customProductFormVisible) {
        customForm.style.display = 'block';
        toggleBtn.style.display = 'none';
    } else {
        customForm.style.display = 'none';
        toggleBtn.style.display = 'block';
        // Clear form when closing
        clearCustomProductForm();
    }
}

// Update event goals display
function updateEventGoals() {
    const duration = parseFloat(document.getElementById('duration').value) || 1;
    const targetCarbs = parseFloat(document.getElementById('targetCarbs').value) || 0;
    const targetSodium = parseFloat(document.getElementById('targetSodium').value) || 0;

    document.getElementById('goalCarbs').textContent = (targetCarbs * duration).toFixed(0) + 'g';
    document.getElementById('goalSodium').textContent = (targetSodium * duration).toFixed(0) + 'mg';
}

// Update caffeine plan text
function updateCaffeinePlan() {
    const duration = parseFloat(document.getElementById('duration').value) || 1;
    const interval = parseFloat(document.getElementById('caffeineInterval').value) || 2;
    const perDose = parseFloat(document.getElementById('caffeinePerDose').value) || 100;
    const numberOfDoses = Math.floor(duration / interval);

    document.getElementById('caffeinePlanText').textContent = 
        `${numberOfDoses} dose${numberOfDoses !== 1 ? 's' : ''} of ${perDose}mg throughout your event (total: ${numberOfDoses * perDose}mg)`;
}

// Load custom products from localStorage
function loadCustomProducts() {
    const saved = localStorage.getItem('customFuelProducts');
    if (saved) {
        try {
            const customProducts = JSON.parse(saved);
            customProducts.forEach(product => {
                if (!products.find(p => p.name === product.name)) {
                    products.push(product);
                }
            });
        } catch (e) {
            console.error('Error loading custom products:', e);
        }
    }
}

// Save custom products to localStorage
function saveCustomProducts() {
    const customProducts = products.slice(15); // Everything after the original 15
    localStorage.setItem('customFuelProducts', JSON.stringify(customProducts));
}

function renderProducts() {
    const grid = document.getElementById('productGrid');
    
    // Filter products by search query
    let filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Sort: favorites first, then alphabetically
    filteredProducts.sort((a, b) => {
        const aFav = favorites.includes(a.name);
        const bFav = favorites.includes(b.name);
        
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return a.name.localeCompare(b.name);
    });
    
    grid.innerHTML = filteredProducts.map((product, index) => {
        const actualIndex = products.indexOf(product);
        const isFavorite = favorites.includes(product.name);
        const quantity = getProductQuantity(product.name);
        const isSelected = quantity > 0;
        
        return `
        <div class="product-card ${isSelected ? 'selected' : ''} ${isFavorite ? 'favorited' : ''}" 
             onclick="addToFuelPlan(${actualIndex})">
            <div class="favorite-star" onclick="toggleFavorite('${product.name.replace(/'/g, "\\'")}', event)">
                ${isFavorite ? '<i class="fa-solid fa-star" style="color: #FFD43B;"></i>' : '<i class="fa-regular fa-star" style="color: #74C0FC;"></i>'}
            </div>
            <div class="product-name">${product.name}</div>
            <div class="product-stats">
                Carbs: ${product.carbs}g<br>
                Sodium: ${product.sodium}mg<br>
                Potassium: ${product.potassium}mg<br>
                ${product.caffeine > 0 ? `Caffeine: ${product.caffeine}mg` : ''}
            </div>
        </div>
    `;
    }).join('');
}

function addToFuelPlan(productIndex) {
    const product = products[productIndex];
    const existing = fuelPlan.find(item => item.product.name === product.name);
    
    if (existing) {
        existing.quantity++;
    } else {
        fuelPlan.push({ product: {...product}, quantity: 1 });
    }
    
    renderFuelPlan();
    renderProducts(); // Re-render products to update highlighting
    updateSummary();
}

function removeFromFuelPlan(index) {
    fuelPlan.splice(index, 1);
    renderFuelPlan();
    renderProducts(); // Re-render products to update highlighting
    updateSummary();
}

function updateQuantity(index, quantity) {
    if (quantity > 0) {
        fuelPlan[index].quantity = parseInt(quantity);
    } else {
        fuelPlan.splice(index, 1);
    }
    renderFuelPlan();
    renderProducts(); // Re-render products to update highlighting
    updateSummary();
}

function renderFuelPlan() {
    const planDiv = document.getElementById('fuelPlan');
    
    if (fuelPlan.length === 0) {
        planDiv.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Add products to build your fuel plan</p>';
        return;
    }

    planDiv.innerHTML = fuelPlan.map((item, index) => `
        <div class="fuel-item">
            <div class="fuel-item-info">
                <div class="fuel-item-name">${item.product.name}</div>
                <div class="fuel-item-stats">
                    ${item.quantity}x: 
                    ${item.product.carbs * item.quantity}g carbs, 
                    ${item.product.sodium * item.quantity}mg sodium, 
                    ${item.product.potassium * item.quantity}mg potassium
                    ${item.product.caffeine > 0 ? `, ${item.product.caffeine * item.quantity}mg caffeine` : ''}
                </div>
            </div>
            <div class="fuel-item-controls">
                <input type="number" class="qty-input" value="${item.quantity}" min="1" 
                       onchange="updateQuantity(${index}, this.value)">
                <button class="btn-small btn-danger" onclick="removeFromFuelPlan(${index})">Remove</button>
            </div>
        </div>
    `).join('');
}

function updateSummary() {
    const duration = parseFloat(document.getElementById('duration').value) || 1;
    const targetCarbs = parseFloat(document.getElementById('targetCarbs').value) || 0;
    const targetSodium = parseFloat(document.getElementById('targetSodium').value) || 0;
    const caffeineInterval = parseFloat(document.getElementById('caffeineInterval').value) || 2;
    const caffeinePerDose = parseFloat(document.getElementById('caffeinePerDose').value) || 100;

    updateEventGoals();
    if (caffeineEnabled) {
        updateCaffeinePlan();
    }

    if (fuelPlan.length === 0) {
        document.getElementById('summary').style.display = 'none';
        return;
    }

    document.getElementById('summary').style.display = 'block';

    const totals = fuelPlan.reduce((acc, item) => {
        acc.carbs += item.product.carbs * item.quantity;
        acc.sodium += item.product.sodium * item.quantity;
        acc.potassium += item.product.potassium * item.quantity;
        acc.caffeine += item.product.caffeine * item.quantity;
        return acc;
    }, { carbs: 0, sodium: 0, potassium: 0, caffeine: 0 });

    const perHour = {
        carbs: totals.carbs / duration,
        sodium: totals.sodium / duration,
        potassium: totals.potassium / duration,
    };

    // Per hour values
    document.getElementById('totalCarbs').textContent = perHour.carbs.toFixed(1) + 'g';
    document.getElementById('totalSodium').textContent = perHour.sodium.toFixed(0) + 'mg';
    document.getElementById('totalPotassium').textContent = perHour.potassium.toFixed(0) + 'mg';

    // Color-code per hour summary boxes
    colorCodeSummaryItem('totalCarbs', perHour.carbs, targetCarbs);
    colorCodeSummaryItem('totalSodium', perHour.sodium, targetSodium);

    // Total event values
    document.getElementById('totalEventCarbs').textContent = totals.carbs.toFixed(0) + 'g';
    document.getElementById('totalEventSodium').textContent = totals.sodium.toFixed(0) + 'mg';
    document.getElementById('totalEventPotassium').textContent = totals.potassium.toFixed(0) + 'mg';

    // Color-code total event summary boxes
    const totalCarbsTarget = targetCarbs * duration;
    const totalSodiumTarget = targetSodium * duration;
    colorCodeSummaryItem('totalEventCarbs', totals.carbs, totalCarbsTarget);
    colorCodeSummaryItem('totalEventSodium', totals.sodium, totalSodiumTarget);

    // Target comparisons (per hour)
    const carbsDiff = perHour.carbs - targetCarbs;
    const sodiumDiff = perHour.sodium - targetSodium;

    document.getElementById('carbsTarget').innerHTML = 
        targetCarbs > 0 ? `Target: ${targetCarbs}g (${carbsDiff > 0 ? '+' : ''}${carbsDiff.toFixed(1)}g)` : '';
    document.getElementById('sodiumTarget').innerHTML = 
        targetSodium > 0 ? `Target: ${targetSodium}mg (${sodiumDiff > 0 ? '+' : ''}${sodiumDiff.toFixed(0)}mg)` : '';

    // Total event target comparisons
    const totalCarbsDiff = totals.carbs - totalCarbsTarget;
    const totalSodiumDiff = totals.sodium - totalSodiumTarget;

    document.getElementById('eventCarbsTarget').innerHTML = 
        targetCarbs > 0 ? `Goal: ${totalCarbsTarget.toFixed(0)}g (${totalCarbsDiff > 0 ? '+' : ''}${totalCarbsDiff.toFixed(0)}g)` : '';
    document.getElementById('eventSodiumTarget').innerHTML = 
        targetSodium > 0 ? `Goal: ${totalSodiumTarget.toFixed(0)}mg (${totalSodiumDiff > 0 ? '+' : ''}${totalSodiumDiff.toFixed(0)}mg)` : '';

    // Caffeine section
    if (caffeineEnabled) {
        document.getElementById('caffeineSection').style.display = 'block';
        const numberOfDoses = Math.floor(duration / caffeineInterval);
        const targetTotalCaffeine = numberOfDoses * caffeinePerDose;
        const caffeineDiff = totals.caffeine - targetTotalCaffeine;
        
        document.getElementById('totalCaffeine').textContent = totals.caffeine.toFixed(0) + 'mg';
        document.getElementById('caffeineTarget').innerHTML = 
            `Goal: ${targetTotalCaffeine}mg (${numberOfDoses} doses)<br>${caffeineDiff > 0 ? '+' : ''}${caffeineDiff.toFixed(0)}mg`;
        
        // Color-code caffeine
        colorCodeSummaryItem('totalCaffeine', totals.caffeine, targetTotalCaffeine);
    } else {
        document.getElementById('caffeineSection').style.display = 'none';
    }

    // Warning messages
    displayWarnings(perHour.carbs, perHour.sodium, targetCarbs, targetSodium, totals.caffeine, caffeineEnabled, caffeineInterval, caffeinePerDose, duration);
}

// Color-code summary items based on target achievement
function colorCodeSummaryItem(elementId, actual, target) {
    const element = document.getElementById(elementId);
    if (!element || target === 0) {
        element.parentElement.className = 'summary-item';
        return;
    }
    
    const percentage = (actual / target) * 100;
    
    if (percentage >= 95) {
        // Green: at or above target (95%+)
        element.parentElement.className = 'summary-item target-met';
    } else if (percentage >= 80) {
        // Yellow: below target but acceptable (80-94%)
        element.parentElement.className = 'summary-item target-low';
    } else {
        // Red: very low (below 80%)
        element.parentElement.className = 'summary-item target-very-low';
    }
}

function displayWarnings(actualCarbs, actualSodium, targetCarbs, targetSodium, totalCaffeine, useCaffeine, caffeineInterval, caffeinePerDose, duration) {
    const summaryDiv = document.getElementById('summary');
    
    // Remove existing warnings
    const existingWarnings = summaryDiv.querySelectorAll('.warning, .success');
    existingWarnings.forEach(w => w.remove());

    const warnings = [];
    const successes = [];

    // Check carbs
    if (targetCarbs > 0) {
        const carbsPercentage = (actualCarbs / targetCarbs) * 100;
        if (carbsPercentage < 80) {
            warnings.push(`<i class="fa-solid fa-triangle-exclamation" style="color: #FFD43B;"></i> Your carb intake is ${carbsPercentage.toFixed(0)}% of your target. Consider adding more fuel to meet your goals.`);
        } else if (carbsPercentage >= 95 && carbsPercentage <= 105) {
            successes.push(`✓ Carb intake is right on target!`);
        }
    }

    // Check sodium
    if (targetSodium > 0) {
        const sodiumPercentage = (actualSodium / targetSodium) * 100;
        if (sodiumPercentage < 70) {
            warnings.push(`<i class="fa-solid fa-triangle-exclamation" style="color: #FFD43B;"></i> Your sodium intake is ${sodiumPercentage.toFixed(0)}% of your target. Low sodium can lead to cramping and hyponatremia.`);
        } else if (sodiumPercentage >= 90 && sodiumPercentage <= 110) {
            successes.push(`✓ Sodium intake looks good!`);
        }
    }

    // Check caffeine
    if (useCaffeine) {
        const numberOfDoses = Math.floor(duration / caffeineInterval);
        const targetTotalCaffeine = numberOfDoses * caffeinePerDose;
        const caffeinePercentage = targetTotalCaffeine > 0 ? (totalCaffeine / targetTotalCaffeine) * 100 : 0;
        
        if (targetTotalCaffeine > 0 && caffeinePercentage < 80) {
            warnings.push(`<i class="fa-solid fa-triangle-exclamation" style="color: #FFD43B;"></i> Your caffeine is ${caffeinePercentage.toFixed(0)}% of your target. You may want to add caffeinated products.`);
        } else if (caffeinePercentage >= 95 && caffeinePercentage <= 105) {
            successes.push(`✓ Caffeine strategy is on target!`);
        }
    }

    // Display warnings
    warnings.forEach(warning => {
        const warningDiv = document.createElement('div');
        warningDiv.className = 'warning';
        warningDiv.innerHTML = warning; // Changed from textContent to innerHTML
        summaryDiv.appendChild(warningDiv);
    });

    // Display successes
    if (warnings.length === 0 && successes.length > 0) {
        successes.forEach(success => {
            const successDiv = document.createElement('div');
            successDiv.className = 'success';
            successDiv.innerHTML = success; // Changed from textContent to innerHTML
            summaryDiv.appendChild(successDiv);
        });
    }
}

function addCustomProduct() {
    const name = document.getElementById('customName').value.trim();
    const carbs = parseFloat(document.getElementById('customCarbs').value) || 0;
    const sodium = parseFloat(document.getElementById('customSodium').value) || 0;
    const potassium = parseFloat(document.getElementById('customPotassium').value) || 0;
    const caffeine = parseFloat(document.getElementById('customCaffeine').value) || 0;

    if (!name) {
        alert('Please enter a product name');
        return;
    }

    products.push({ name, carbs, sodium, potassium, caffeine });
    saveCustomProducts(); // Save to localStorage
    renderProducts();

    // Clear form and close
    clearCustomProductForm();
    toggleCustomProduct();
}

function clearCustomProductForm() {
    document.getElementById('customName').value = '';
    document.getElementById('customCarbs').value = '';
    document.getElementById('customSodium').value = '';
    document.getElementById('customPotassium').value = '';
    document.getElementById('customCaffeine').value = '';
}

// Event listeners
document.getElementById('duration').addEventListener('input', updateSummary);
document.getElementById('targetCarbs').addEventListener('input', updateSummary);
document.getElementById('targetSodium').addEventListener('input', updateSummary);
document.getElementById('caffeineInterval').addEventListener('input', updateSummary);
document.getElementById('caffeinePerDose').addEventListener('input', updateSummary);

// Search functionality
document.getElementById('productSearch').addEventListener('input', function(e) {
    searchQuery = e.target.value;
    renderProducts();
});

// Initialize
loadFavorites(); // Load saved favorites
loadCustomProducts(); // Load saved custom products
renderProducts();
updateEventGoals(); // Show initial event goals