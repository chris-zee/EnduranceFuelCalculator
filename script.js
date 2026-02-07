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
let multiLegEnabled = false;
let legs = [];
let activeLegIndex = 0;

// Toggle multi-leg planning
function toggleMultiLegPlanning() {
    multiLegEnabled = !multiLegEnabled;
    const multiLegSettings = document.getElementById('multiLegSettings');
    const toggleBtn = document.getElementById('multiLegToggleBtn');
    const durationInput = document.getElementById('duration');
    
    if (multiLegEnabled) {
        multiLegSettings.style.display = 'block';
        toggleBtn.style.display = 'none';
        durationInput.disabled = true;
        
        // Initialize with 2 legs if empty
        if (legs.length === 0) {
            legs = [
                { name: 'Leg 1', duration: 2, distance: null, fuelPlan: [] },
                { name: 'Leg 2', duration: 2, distance: null, fuelPlan: [] }
            ];
        }
        
        // Use legs for fuel planning instead of single plan
        fuelPlan = legs[activeLegIndex].fuelPlan;
        
        renderLegsConfig();
        renderLegsFuelPlan();
        updateTotalDuration();
    } else {
        multiLegSettings.style.display = 'none';
        toggleBtn.style.display = 'block';
        durationInput.disabled = false;
        
        // Merge all leg fuel plans into single plan
        const mergedPlan = [];
        legs.forEach(leg => {
            leg.fuelPlan.forEach(item => {
                const existing = mergedPlan.find(m => m.product.name === item.product.name);
                if (existing) {
                    existing.quantity += item.quantity;
                } else {
                    mergedPlan.push({ product: {...item.product}, quantity: item.quantity });
                }
            });
        });
        fuelPlan = mergedPlan;
        legs = [];
        activeLegIndex = 0;
        
        renderLegsFuelPlan();
    }
    
    renderProducts();
    updateSummary();
}

// Add a new leg
function addLeg() {
    const legNumber = legs.length + 1;
    legs.push({
        name: `Leg ${legNumber}`,
        duration: 2,
        distance: null,
        fuelPlan: []
    });
    renderLegsConfig();
    renderLegsFuelPlan();
    updateTotalDuration();
    updateSummary(); // Add this to update summary immediately
}

// Remove a leg
function removeLeg(index) {
    if (legs.length <= 1) {
        alert('You must have at least one leg');
        return;
    }
    legs.splice(index, 1);
    if (activeLegIndex >= legs.length) {
        activeLegIndex = legs.length - 1;
    }
    fuelPlan = legs[activeLegIndex].fuelPlan;
    renderLegsConfig();
    renderLegsFuelPlan();
    updateTotalDuration();
    updateSummary();
}

// Duplicate a leg
function duplicateLeg(index) {
    const originalLeg = legs[index];
    
    // Deep copy the leg including fuel plan
    const duplicatedLeg = {
        name: originalLeg.name + ' (Copy)',
        duration: originalLeg.duration,
        distance: originalLeg.distance,
        fuelPlan: originalLeg.fuelPlan.map(item => ({
            product: {...item.product},
            quantity: item.quantity
        }))
    };
    
    // Insert the duplicate right after the original
    legs.splice(index + 1, 0, duplicatedLeg);
    
    // Switch to the duplicated leg
    activeLegIndex = index + 1;
    fuelPlan = legs[activeLegIndex].fuelPlan;
    
    renderLegsConfig();
    renderLegsFuelPlan();
    renderProducts();
    updateTotalDuration();
    updateSummary();
}

// Switch active leg for editing
function switchLegForEditing(index) {
    activeLegIndex = index;
    fuelPlan = legs[activeLegIndex].fuelPlan;
    renderLegsFuelPlan();
    renderProducts();
    updateSummary();
}

// Update leg property
function updateLegProperty(index, property, value) {
    legs[index][property] = value;
    if (property === 'duration') {
        updateTotalDuration();
    }
    renderLegsConfig();
    renderLegsFuelPlan(); // Update leg summary bars when properties change
}

// Update total duration from all legs
function updateTotalDuration() {
    if (multiLegEnabled) {
        const total = legs.reduce((sum, leg) => sum + parseFloat(leg.duration || 0), 0);
        document.getElementById('duration').value = total.toFixed(1);
        updateEventGoals();
    }
}

// Render leg configuration (top section - just settings)
function renderLegsConfig() {
    const container = document.getElementById('legsConfigContainer');
    
    container.innerHTML = legs.map((leg, index) => `
        <div class="leg-config-card" style="background: white; padding: 15px; margin-bottom: 10px; border-radius: 6px; border: 2px solid #e0e0e0;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 150px;">
                    <input type="text" value="${leg.name}" 
                           onchange="updateLegProperty(${index}, 'name', this.value)"
                           placeholder="Leg name"
                           style="width: 100%; border: 1px solid #ddd; padding: 8px; border-radius: 4px; font-weight: 500;">
                </div>
                <div style="width: 120px;">
                    <label style="font-size: 0.85em; color: #666; margin-bottom: 3px;">Duration (h)</label>
                    <input type="number" value="${leg.duration}" min="0.1" step="0.1"
                           onchange="updateLegProperty(${index}, 'duration', this.value)"
                           style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="width: 120px;">
                    <label style="font-size: 0.85em; color: #666; margin-bottom: 3px;">Distance (km)</label>
                    <input type="number" value="${leg.distance || ''}" min="0" step="0.1"
                           onchange="updateLegProperty(${index}, 'distance', this.value)"
                           placeholder="Optional"
                           style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-small btn-danger" onclick="removeLeg(${index})" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Render all legs in fuel plan area (bottom section - fuel items with drag/drop)
function renderLegsFuelPlan() {
    const container = document.getElementById('fuelPlanContainer');
    
    if (!multiLegEnabled) {
        // Single plan mode
        container.innerHTML = `<div id="fuelPlan"></div>`;
        renderFuelPlan();
        return;
    }
    
    const targetCarbs = parseFloat(document.getElementById('targetCarbs').value) || 0;
    const targetSodium = parseFloat(document.getElementById('targetSodium').value) || 0;
    
    // Multi-leg mode - show all legs as drop zones
    container.innerHTML = legs.map((leg, index) => {
        const legTotals = leg.fuelPlan.reduce((acc, item) => {
            acc.carbs += item.product.carbs * item.quantity;
            acc.sodium += item.product.sodium * item.quantity;
            acc.potassium += item.product.potassium * item.quantity;
            acc.caffeine += item.product.caffeine * item.quantity;
            return acc;
        }, { carbs: 0, sodium: 0, potassium: 0, caffeine: 0 });
        
        const perHour = {
            carbs: leg.duration > 0 ? legTotals.carbs / leg.duration : 0,
            sodium: leg.duration > 0 ? legTotals.sodium / leg.duration : 0
        };
        
        // Color coding for per-hour rates
        const carbsClass = targetCarbs > 0 ? (perHour.carbs >= targetCarbs * 0.95 ? 'target-met' : (perHour.carbs >= targetCarbs * 0.8 ? 'target-low' : 'target-very-low')) : '';
        const sodiumClass = targetSodium > 0 ? (perHour.sodium >= targetSodium * 0.95 ? 'target-met' : (perHour.sodium >= targetSodium * 0.7 ? 'target-low' : 'target-very-low')) : '';
        
        return `
        <div class="leg-fuel-card ${index === activeLegIndex ? 'active-leg-fuel' : ''}"
             onclick="switchLegForEditing(${index})"
             ondragover="handleDragOver(event, ${index})"
             ondrop="handleDrop(event, ${index})"
             ondragleave="handleDragLeave(event)"
             style="cursor: pointer;">
            <div class="leg-fuel-header">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-weight: 600; font-size: 1.1em; color: #333;">${leg.name}</span>
                    <span style="color: #666; font-size: 0.9em;">(${leg.duration}h${leg.distance ? `, ${leg.distance}km` : ''})</span>
                    ${index === activeLegIndex ? '<span style="color: #667eea; font-size: 0.9em;"><i class="fa-solid fa-check-circle"></i> Active</span>' : ''}
                </div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${leg.fuelPlan.length > 0 ? `
                    <button class="btn-small" onclick="event.stopPropagation(); copyLegFuel(${index})" style="background: #17a2b8;" title="Copy fuel to other legs">
                        <i class="fa-solid fa-copy"></i> Copy
                    </button>
                    ` : ''}
                </div>
            </div>
            
            ${leg.fuelPlan.length > 0 ? `
            <div class="leg-nutrition-bar" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px; padding: 12px; background: linear-gradient(135deg,  #01295F 0%, #2F3061 100%); border-radius: 6px; margin-bottom: 15px;">
                <div class="leg-nutrition-item ${carbsClass}" style="text-align: center;">
                    <div style="font-size: 0.75em; opacity: 0.9; color: white;">Carbs/hr</div>
                    <div style="font-size: 1.2em; font-weight: 600; color: white;">${perHour.carbs.toFixed(1)}g</div>
                    ${targetCarbs > 0 ? `<div style="font-size: 0.7em; opacity: 0.8; color: white;">target: ${targetCarbs}g</div>` : ''}
                </div>
                <div class="leg-nutrition-item ${sodiumClass}" style="text-align: center;">
                    <div style="font-size: 0.75em; opacity: 0.9; color: white;">Sodium/hr</div>
                    <div style="font-size: 1.2em; font-weight: 600; color: white;">${perHour.sodium.toFixed(0)}mg</div>
                    ${targetSodium > 0 ? `<div style="font-size: 0.7em; opacity: 0.8; color: white;">target: ${targetSodium}mg</div>` : ''}
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 0.75em; opacity: 0.9; color: white;">Total Carbs</div>
                    <div style="font-size: 1.2em; font-weight: 600; color: white;">${legTotals.carbs.toFixed(0)}g</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 0.75em; opacity: 0.9; color: white;">Total Sodium</div>
                    <div style="font-size: 1.2em; font-weight: 600; color: white;">${legTotals.sodium.toFixed(0)}mg</div>
                </div>
            </div>
            ` : ''}
            
            <div class="leg-fuel-stats">
                <span><strong>Items:</strong> ${leg.fuelPlan.length}</span>
                <span><strong>Potassium:</strong> ${legTotals.potassium.toFixed(0)}mg</span>
                ${legTotals.caffeine > 0 ? `<span><strong>Caffeine:</strong> ${legTotals.caffeine.toFixed(0)}mg</span>` : ''}
            </div>
            <div class="leg-fuel-items" id="legFuelItems${index}" onclick="event.stopPropagation()">
                ${renderLegFuelItems(leg, index)}
            </div>
        </div>
    `;
    }).join('');
}

// Render fuel items for a specific leg
function renderLegFuelItems(leg, legIndex) {
    if (leg.fuelPlan.length === 0) {
        return `<p style="color: #999; text-align: center; padding: 20px; font-size: 0.9em;">
            ${legIndex === activeLegIndex ? 'Add products from the list above or drag items from other legs' : 'Drag items here or switch to this leg to add products'}
        </p>`;
    }
    
    return leg.fuelPlan.map((item, itemIndex) => `
        <div class="fuel-item-compact" draggable="true" 
             ondragstart="handleDragStartFromLeg(event, ${legIndex}, ${itemIndex})"
             ondragend="handleDragEnd(event)">
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                <i class="fa-solid fa-grip-vertical" style="color: #999;"></i>
                <div style="flex: 1;">
                    <div style="font-weight: 500; color: #333;">${item.product.name}</div>
                    <div style="font-size: 0.85em; color: #666;">
                        ${item.quantity}x: ${item.product.carbs * item.quantity}g carbs, ${item.product.sodium * item.quantity}mg sodium
                    </div>
                </div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
                <input type="number" class="qty-input" value="${item.quantity}" min="1" 
                       onchange="updateQuantityInLeg(${legIndex}, ${itemIndex}, this.value)"
                       style="width: 50px;">
                <button class="btn-small btn-danger" onclick="removeFromLegFuelPlan(${legIndex}, ${itemIndex})">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Drag and drop handlers
let draggedItemIndex = null;
let draggedFromLegIndex = null;

function handleDragStartFromLeg(event, legIndex, itemIndex) {
    draggedFromLegIndex = legIndex;
    draggedItemIndex = itemIndex;
    event.target.style.opacity = '0.4';
    event.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(event) {
    event.target.style.opacity = '1';
    draggedItemIndex = null;
    draggedFromLegIndex = null;
    
    // Remove all drag-over styling
    document.querySelectorAll('.leg-fuel-card').forEach(card => {
        card.classList.remove('drag-over');
    });
}

function handleDragOver(event, targetLegIndex) {
    if (event.preventDefault) {
        event.preventDefault();
    }
    
    // Don't allow dropping on the same leg
    if (targetLegIndex === draggedFromLegIndex) {
        event.dataTransfer.dropEffect = 'none';
        return false;
    }
    
    event.dataTransfer.dropEffect = 'move';
    
    // Add visual feedback
    const legCard = event.currentTarget;
    legCard.classList.add('drag-over');
    
    return false;
}

function handleDragLeave(event) {
    event.currentTarget.classList.remove('drag-over');
}

function handleDrop(event, targetLegIndex) {
    if (event.stopPropagation) {
        event.stopPropagation();
    }
    
    event.currentTarget.classList.remove('drag-over');
    
    // Don't allow dropping on the same leg
    if (targetLegIndex === draggedFromLegIndex || draggedItemIndex === null) {
        return false;
    }
    
    // Move the item from source leg to target leg
    const item = legs[draggedFromLegIndex].fuelPlan[draggedItemIndex];
    
    // Remove from source leg
    legs[draggedFromLegIndex].fuelPlan.splice(draggedItemIndex, 1);
    
    // Add to target leg
    const existing = legs[targetLegIndex].fuelPlan.find(i => i.product.name === item.product.name);
    if (existing) {
        existing.quantity += item.quantity;
    } else {
        legs[targetLegIndex].fuelPlan.push({...item});
    }
    
    // Update active fuel plan if needed
    if (draggedFromLegIndex === activeLegIndex) {
        fuelPlan = legs[activeLegIndex].fuelPlan;
    }
    
    // Update display
    renderLegsFuelPlan();
    renderProducts();
    updateSummary();
    
    return false;
}

// Update quantity in specific leg
function updateQuantityInLeg(legIndex, itemIndex, quantity) {
    if (quantity > 0) {
        legs[legIndex].fuelPlan[itemIndex].quantity = parseInt(quantity);
    } else {
        legs[legIndex].fuelPlan.splice(itemIndex, 1);
    }
    
    // Update active fuel plan if this is the active leg
    if (legIndex === activeLegIndex) {
        fuelPlan = legs[activeLegIndex].fuelPlan;
    }
    
    renderLegsFuelPlan();
    renderProducts();
    updateSummary();
}

// Remove item from specific leg
function removeFromLegFuelPlan(legIndex, itemIndex) {
    legs[legIndex].fuelPlan.splice(itemIndex, 1);
    
    // Update active fuel plan if this is the active leg
    if (legIndex === activeLegIndex) {
        fuelPlan = legs[activeLegIndex].fuelPlan;
    }
    
    renderLegsFuelPlan();
    renderProducts();
    updateSummary();
}

// Copy fuel from one leg to other legs
function copyLegFuel(sourceLegIndex) {
    const sourceLeg = legs[sourceLegIndex];
    
    if (sourceLeg.fuelPlan.length === 0) {
        alert('This leg has no fuel to copy');
        return;
    }
    
    // Create options for target legs
    const targetOptions = legs
        .map((leg, index) => index !== sourceLegIndex ? { index, name: leg.name } : null)
        .filter(Boolean);
    
    if (targetOptions.length === 0) {
        alert('No other legs to copy to. Add more legs first.');
        return;
    }
    
    // Create a simple modal
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;';
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = 'background: white; padding: 30px; border-radius: 12px; max-width: 500px; width: 90%;';
    
    modalContent.innerHTML = `
        <h3 style="margin-bottom: 15px; color: #333;">Copy Fuel from "${sourceLeg.name}"</h3>
        <p style="color: #666; margin-bottom: 20px;">Select which legs to copy this fuel to:</p>
        <div style="margin-bottom: 20px;">
            ${targetOptions.map(target => `
                <label style="display: block; padding: 10px; margin-bottom: 8px; background: #f8f9fa; border-radius: 6px; cursor: pointer;">
                    <input type="checkbox" class="copy-target" value="${target.index}" style="margin-right: 10px;">
                    ${target.name}
                </label>
            `).join('')}
        </div>
        <div style="margin-bottom: 15px;">
            <label style="display: flex; align-items: center; cursor: pointer;">
                <input type="checkbox" id="copyReplace" style="margin-right: 10px;">
                <span style="color: #666; font-size: 0.9em;">Replace existing fuel (otherwise merges quantities)</span>
            </label>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="this.closest('div[style*=fixed]').remove()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                Cancel
            </button>
            <button id="confirmCopy" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                Copy Fuel
            </button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Handle copy confirmation
    document.getElementById('confirmCopy').onclick = () => {
        const selectedTargets = Array.from(document.querySelectorAll('.copy-target:checked')).map(cb => parseInt(cb.value));
        const replace = document.getElementById('copyReplace').checked;
        
        if (selectedTargets.length === 0) {
            alert('Please select at least one target leg');
            return;
        }
        
        // Copy fuel to selected legs
        selectedTargets.forEach(targetIndex => {
            if (replace) {
                // Replace: clear existing and copy fresh
                legs[targetIndex].fuelPlan = sourceLeg.fuelPlan.map(item => ({
                    product: {...item.product},
                    quantity: item.quantity
                }));
            } else {
                // Merge: add quantities for existing items
                sourceLeg.fuelPlan.forEach(sourceItem => {
                    const existing = legs[targetIndex].fuelPlan.find(i => i.product.name === sourceItem.product.name);
                    if (existing) {
                        existing.quantity += sourceItem.quantity;
                    } else {
                        legs[targetIndex].fuelPlan.push({
                            product: {...sourceItem.product},
                            quantity: sourceItem.quantity
                        });
                    }
                });
            }
        });
        
        // Update active fuel plan if needed
        if (selectedTargets.includes(activeLegIndex)) {
            fuelPlan = legs[activeLegIndex].fuelPlan;
        }
        
        modal.remove();
        renderLegsConfig();
        renderLegsFuelPlan();
        renderProducts();
        updateSummary();
    };
    
    // Close on background click
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

// Download fuel plan as CSV
function downloadFuelPlan() {
    const duration = parseFloat(document.getElementById('duration').value) || 1;
    const targetCarbs = parseFloat(document.getElementById('targetCarbs').value) || 0;
    const targetSodium = parseFloat(document.getElementById('targetSodium').value) || 0;
    
    let csvContent = '';
    
    if (multiLegEnabled) {
        // Multi-leg format
        csvContent = 'Running Fuel Plan - Multi-Leg\n\n';
        csvContent += `Total Duration: ${duration} hours\n`;
        csvContent += `Target Carbs: ${targetCarbs}g/hour\n`;
        csvContent += `Target Sodium: ${targetSodium}mg/hour\n\n`;
        
        legs.forEach((leg, index) => {
            csvContent += `\n=== ${leg.name} ===\n`;
            csvContent += `Duration: ${leg.duration} hours\n`;
            if (leg.distance) {
                csvContent += `Distance: ${leg.distance} kilometers\n`;
            }
            csvContent += '\nProduct,Quantity,Carbs (g),Sodium (mg),Potassium (mg),Caffeine (mg)\n';
            
            if (leg.fuelPlan.length === 0) {
                csvContent += 'No fuel items\n';
            } else {
                leg.fuelPlan.forEach(item => {
                    csvContent += `"${item.product.name}",${item.quantity},${item.product.carbs * item.quantity},${item.product.sodium * item.quantity},${item.product.potassium * item.quantity},${item.product.caffeine * item.quantity}\n`;
                });
                
                const legTotals = leg.fuelPlan.reduce((acc, item) => {
                    acc.carbs += item.product.carbs * item.quantity;
                    acc.sodium += item.product.sodium * item.quantity;
                    acc.potassium += item.product.potassium * item.quantity;
                    acc.caffeine += item.product.caffeine * item.quantity;
                    return acc;
                }, { carbs: 0, sodium: 0, potassium: 0, caffeine: 0 });
                
                csvContent += `TOTALS,,${legTotals.carbs.toFixed(1)},${legTotals.sodium.toFixed(0)},${legTotals.potassium.toFixed(0)},${legTotals.caffeine.toFixed(0)}\n`;
            }
        });
        
        // Event totals
        const eventTotals = legs.reduce((acc, leg) => {
            leg.fuelPlan.forEach(item => {
                acc.carbs += item.product.carbs * item.quantity;
                acc.sodium += item.product.sodium * item.quantity;
                acc.potassium += item.product.potassium * item.quantity;
                acc.caffeine += item.product.caffeine * item.quantity;
            });
            return acc;
        }, { carbs: 0, sodium: 0, potassium: 0, caffeine: 0 });
        
        csvContent += `\n\n=== EVENT TOTALS ===\n`;
        csvContent += `Total Carbs: ${eventTotals.carbs.toFixed(0)}g (${(eventTotals.carbs / duration).toFixed(1)}g/hour)\n`;
        csvContent += `Total Sodium: ${eventTotals.sodium.toFixed(0)}mg (${(eventTotals.sodium / duration).toFixed(0)}mg/hour)\n`;
        csvContent += `Total Potassium: ${eventTotals.potassium.toFixed(0)}mg\n`;
        csvContent += `Total Caffeine: ${eventTotals.caffeine.toFixed(0)}mg\n`;
        
    } else {
        // Single plan format
        csvContent = 'Running Fuel Plan\n\n';
        csvContent += `Duration: ${duration} hours\n`;
        csvContent += `Target Carbs: ${targetCarbs}g/hour\n`;
        csvContent += `Target Sodium: ${targetSodium}mg/hour\n\n`;
        csvContent += 'Product,Quantity,Carbs (g),Sodium (mg),Potassium (mg),Caffeine (mg)\n';
        
        if (fuelPlan.length === 0) {
            csvContent += 'No fuel items\n';
        } else {
            fuelPlan.forEach(item => {
                csvContent += `"${item.product.name}",${item.quantity},${item.product.carbs * item.quantity},${item.product.sodium * item.quantity},${item.product.potassium * item.quantity},${item.product.caffeine * item.quantity}\n`;
            });
            
            const totals = fuelPlan.reduce((acc, item) => {
                acc.carbs += item.product.carbs * item.quantity;
                acc.sodium += item.product.sodium * item.quantity;
                acc.potassium += item.product.potassium * item.quantity;
                acc.caffeine += item.product.caffeine * item.quantity;
                return acc;
            }, { carbs: 0, sodium: 0, potassium: 0, caffeine: 0 });
            
            csvContent += `\nTOTALS,,${totals.carbs.toFixed(1)},${totals.sodium.toFixed(0)},${totals.potassium.toFixed(0)},${totals.caffeine.toFixed(0)}\n`;
            csvContent += `\nPER HOUR,,${(totals.carbs / duration).toFixed(1)},${(totals.sodium / duration).toFixed(0)},${(totals.potassium / duration).toFixed(0)},${(totals.caffeine / duration).toFixed(0)}\n`;
        }
    }
    
    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const date = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `fuel-plan-${date}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Toggle products section accordion
function toggleProductsSection() {
    productsSectionVisible = !productsSectionVisible;
    const section = document.getElementById('productsSection');
    const toggle = document.getElementById('productsSectionToggle');
    
    if (productsSectionVisible) {
        section.style.display = 'block';
        toggle.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
    } else {
        section.style.display = 'none';
        toggle.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
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
                ${isFavorite ? '⭐' : '☆'}
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
    
    renderLegsFuelPlan(); // Update the fuel plan display
    renderProducts(); // Re-render products to update highlighting
    updateSummary();
}

function removeFromFuelPlan(index) {
    fuelPlan.splice(index, 1);
    
    if (multiLegEnabled) {
        renderLegsFuelPlan();
    } else {
        renderFuelPlan();
    }
    
    renderProducts(); // Re-render products to update highlighting
    updateSummary();
}

function updateQuantity(index, quantity) {
    if (quantity > 0) {
        fuelPlan[index].quantity = parseInt(quantity);
    } else {
        fuelPlan.splice(index, 1);
    }
    
    if (multiLegEnabled) {
        renderLegsFuelPlan();
    } else {
        renderFuelPlan();
    }
    
    renderProducts(); // Re-render products to update highlighting
    updateSummary();
}

function renderFuelPlan() {
    // This is only called in single-leg mode now
    const planDiv = document.getElementById('fuelPlan');
    
    if (!planDiv) return; // Safety check
    
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

    // Calculate totals - either from single plan or all legs
    let totals = { carbs: 0, sodium: 0, potassium: 0, caffeine: 0 };
    
    if (multiLegEnabled) {
        // Sum up all legs
        legs.forEach(leg => {
            leg.fuelPlan.forEach(item => {
                totals.carbs += item.product.carbs * item.quantity;
                totals.sodium += item.product.sodium * item.quantity;
                totals.potassium += item.product.potassium * item.quantity;
                totals.caffeine += item.product.caffeine * item.quantity;
            });
        });
    } else {
        // Single plan
        if (fuelPlan.length === 0) {
            document.getElementById('summary').style.display = 'none';
            return;
        }
        
        totals = fuelPlan.reduce((acc, item) => {
            acc.carbs += item.product.carbs * item.quantity;
            acc.sodium += item.product.sodium * item.quantity;
            acc.potassium += item.product.potassium * item.quantity;
            acc.caffeine += item.product.caffeine * item.quantity;
            return acc;
        }, { carbs: 0, sodium: 0, potassium: 0, caffeine: 0 });
    }

    // Show summary if there's any fuel planned
    const hasFuel = multiLegEnabled ? legs.some(leg => leg.fuelPlan.length > 0) : fuelPlan.length > 0;
    if (!hasFuel) {
        document.getElementById('summary').style.display = 'none';
        return;
    }

    document.getElementById('summary').style.display = 'block';

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
            warnings.push(`<i class="fa-solid fa-triangle-exclamation" style="color: #F09A05;"></i> Your carb intake is ${carbsPercentage.toFixed(0)}% of your target. Consider adding more fuel to meet your goals.`);
        } else if (carbsPercentage >= 95 && carbsPercentage <= 105) {
            successes.push(`✓ Carb intake is right on target!`);
        }
    }

    // Check sodium
    if (targetSodium > 0) {
        const sodiumPercentage = (actualSodium / targetSodium) * 100;
        if (sodiumPercentage < 70) {
            warnings.push(`<i class="fa-solid fa-triangle-exclamation" style="color: #F09A05;"></i> Your sodium intake is ${sodiumPercentage.toFixed(0)}% of your target. Low sodium can lead to cramping and hyponatremia.`);
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
            warnings.push(`<i class="fa-solid fa-triangle-exclamation" style="color: #F09A05;"></i> Your caffeine is ${caffeinePercentage.toFixed(0)}% of your target. You may want to add caffeinated products.`);
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
document.getElementById('duration').addEventListener('input', () => {
    updateSummary();
    if (multiLegEnabled) renderLegsFuelPlan();
});
document.getElementById('targetCarbs').addEventListener('input', () => {
    updateSummary();
    if (multiLegEnabled) renderLegsFuelPlan();
});
document.getElementById('targetSodium').addEventListener('input', () => {
    updateSummary();
    if (multiLegEnabled) renderLegsFuelPlan();
});
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
