// ============================================================================
// INTEGRATION SNIPPETS FOR LOCAL STORAGE
// ============================================================================
// Copy these code blocks into your existing app.js and index.html
// Do NOT replace existing code - these are additions alongside your API calls

// ============================================================================
// 1. ADD TO HTML HEAD (before closing </head>)
// ============================================================================
/*
<script src="./localStorage-utils.js"></script>
*/

// ============================================================================
// 2. ADD TO YOUR app.js - INITIALIZATION ON PAGE LOAD
// ============================================================================
/*
// Call this on DOMContentLoaded or when your app initializes
function initializeLocalStorage() {
  console.log("📦 Initializing local data persistence...");
  
  // Load today's distractions if any exist
  const todayDistractions = getDistractionsByDate();
  if (todayDistractions.length > 0) {
    console.log(`✅ Loaded ${todayDistractions.length} distractions from today`);
    // You can render these to the UI here if needed
    renderLocalDistractions(todayDistractions);
  }
  
  // Load today's calendar events if any exist
  const todayEvents = getTodayCalendarEvents();
  if (todayEvents.length > 0) {
    console.log(`✅ Loaded ${todayEvents.length} calendar events for today`);
    // You can render these to the UI here if needed
    renderTodayCalendarEvents(todayEvents);
  }
}

// Call on page load
document.addEventListener('DOMContentLoaded', initializeLocalStorage);
*/

// ============================================================================
// 3. ADD TO YOUR CHAT SUBMIT HANDLER (e.g., handleChatSend)
// ============================================================================
/*
// Within your existing handleChatSend() or form submission handler:

async function handleChatSend() {
  const message = document.getElementById("user-input").value.trim();
  
  if (!message) return;
  
  // YOUR EXISTING API CALL CODE HERE (unchanged)
  // Example: const response = await fetch('/api/emotion', { ... });
  
  // NEW: Also log the distraction to localStorage alongside API call
  // This runs independently - won't affect your API
  addLocalDistraction({
    activity: "chat interaction",
    timestamp: new Date().toISOString(),
    message: message.substring(0, 100), // Store first 100 chars
    duration: 0,
    severity: "neutral"
  });
  
  // Continue with your existing chat/API logic...
}
*/

// ============================================================================
// 4. ADD TO CALENDAR EVENT CREATION (wherever you create events)
// ============================================================================
/*
// Example: When user creates a calendar event
function handleCreateCalendarEvent(eventData) {
  // YOUR EXISTING API/FIREBASE CODE HERE (unchanged)
  // Example: await firebaseDB.collection('events').add(eventData);
  
  // NEW: Also save to local storage
  // This provides instant local persistence while your API processes it
  addLocalCalendarEvent({
    title: eventData.title,
    date: eventData.date || new Date().toISOString().split('T')[0],
    time: eventData.time,
    description: eventData.description,
    completed: false
  });
  
  // Continue with your existing logic...
}
*/

// ============================================================================
// 5. RENDER FUNCTIONS - ADD THESE TO YOUR app.js
// ============================================================================
/*
// Render local distractions to the UI
function renderLocalDistractions(distractions) {
  const container = document.getElementById("distractions-container");
  if (!container) {
    console.warn("⚠️ No distractions-container element found");
    return;
  }
  
  container.innerHTML = "";
  if (distractions.length === 0) {
    container.innerHTML = "<p>No distractions recorded yet</p>";
    return;
  }
  
  distractions.forEach(distraction => {
    const div = document.createElement("div");
    div.className = "distraction-item";
    div.innerHTML = `
      <p><strong>${distraction.activity}</strong></p>
      <small>${new Date(distraction.timestamp).toLocaleString()}</small>
      <span class="severity">${distraction.severity}</span>
    `;
    container.appendChild(div);
  });
}

// Render today's calendar events to the UI
function renderTodayCalendarEvents(events) {
  const container = document.getElementById("calendar-events-container");
  if (!container) {
    console.warn("⚠️ No calendar-events-container element found");
    return;
  }
  
  container.innerHTML = "";
  if (events.length === 0) {
    container.innerHTML = "<p>No events scheduled for today</p>";
    return;
  }
  
  events.forEach(event => {
    const div = document.createElement("div");
    div.className = `calendar-event ${event.completed ? 'completed' : ''}`;
    div.innerHTML = `
      <div class="event-header">
        <input type="checkbox" ${event.completed ? 'checked' : ''} 
          onchange="completeCalendarEvent(${event.id})">
        <strong>${event.title}</strong>
        <span class="time">${event.time}</span>
      </div>
      ${event.description ? `<p class="event-desc">${event.description}</p>` : ''}
    `;
    container.appendChild(div);
  });
}
*/

// ============================================================================
// 6. OPTIONAL: ADD CSS FOR LOCAL DATA UI ELEMENTS
// ============================================================================
/*
Add to your style.css:

#distractions-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 8px;
}

.distraction-item {
  padding: 10px;
  background: white;
  border-left: 4px solid #ff6b6b;
  border-radius: 4px;
  font-size: 14px;
}

.distraction-item .severity {
  display: inline-block;
  padding: 2px 8px;
  margin-left: 10px;
  border-radius: 12px;
  font-size: 12px;
  background: #ffe0e0;
  color: #d32f2f;
}

#calendar-events-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 20px 0;
  padding: 15px;
  background: #f0f9ff;
  border-radius: 8px;
}

.calendar-event {
  padding: 12px;
  background: white;
  border-left: 4px solid #2196f3;
  border-radius: 4px;
  transition: opacity 0.2s;
}

.calendar-event.completed {
  opacity: 0.6;
  text-decoration: line-through;
  border-left-color: #4caf50;
}

.event-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.event-header input[type="checkbox"] {
  cursor: pointer;
}

.time {
  margin-left: auto;
  font-size: 12px;
  color: #666;
  font-weight: 600;
}

.event-desc {
  margin: 5px 0 0 28px;
  font-size: 13px;
  color: #666;
}
*/

// ============================================================================
// 7. DEBUGGING - CONSOLE COMMANDS YOU CAN RUN IN BROWSER DEVTOOLS
// ============================================================================
/*
// View all stored data
getLocalDataSummary()

// View today's distractions
getDistractionsByDate()

// View today's calendar events
getTodayCalendarEvents()

// Manually add a distraction
addLocalDistraction({ activity: "test activity", severity: "high" })

// Manually add a calendar event
addLocalCalendarEvent({ title: "Test Event", date: "2026-05-24", time: "15:00" })

// Export all data as JSON
exportLocalData()

// Clear all data
clearAllLocalData()
*/

// ============================================================================
// 8. KEY POINTS TO REMEMBER
// ============================================================================
/*
✅ SAFE TO DO:
  - Call these functions alongside your existing fetch/axios API calls
  - Add functions to your form submission handlers
  - Render UI elements without touching existing API logic
  - Use localStorage functions in event listeners

❌ DO NOT:
  - Remove or modify existing API endpoints
  - Change your Firebase configuration
  - Replace existing fetch calls with localStorage
  - Modify the backend route handlers

💡 BEST PRACTICE:
  - Use localStorage for instant UI feedback
  - Keep your API calls for server-side persistence
  - Both work together: localStorage for UX, API for data durability
*/
