// ============================================================================
// LOCAL STORAGE UTILITIES - Data Persistence Layer
// ============================================================================
// This utility manages localStorage without affecting existing API/backend
// All functions are safe to use alongside existing fetch/axios calls

// ============================================================================
// DISTRACTION TRACKER UTILITY
// ============================================================================

/**
 * Add a distraction entry to localStorage
 * @param {Object} data - Distraction object { activity, timestamp, duration, severity }
 * @example addLocalDistraction({ activity: "scrolling", timestamp: new Date(), duration: 30, severity: "high" })
 */
function addLocalDistraction(data) {
  try {
    const distractions = getLocalDistractions();
    const entry = {
      id: Date.now(),
      activity: data.activity || "unknown",
      timestamp: data.timestamp || new Date().toISOString(),
      duration: data.duration || 0,
      severity: data.severity || "medium",
      ...data
    };
    distractions.push(entry);
    localStorage.setItem("distractions_data", JSON.stringify(distractions));
    console.log("✅ Distraction logged:", entry);
    return entry;
  } catch (error) {
    console.error("❌ Error adding distraction:", error);
    return null;
  }
}

/**
 * Retrieve all distraction entries from localStorage
 * @returns {Array} Array of distraction objects, empty array if none exist
 */
function getLocalDistractions() {
  try {
    const data = localStorage.getItem("distractions_data");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("❌ Error retrieving distractions:", error);
    return [];
  }
}

/**
 * Get distractions from a specific date
 * @param {String} dateStr - Date string in format YYYY-MM-DD (optional, defaults to today)
 * @returns {Array} Filtered distraction objects for the specified date
 */
function getDistractionsByDate(dateStr = null) {
  try {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const distractions = getLocalDistractions();
    return distractions.filter(d => {
      const entryDate = new Date(d.timestamp).toISOString().split('T')[0];
      return entryDate === targetDate;
    });
  } catch (error) {
    console.error("❌ Error filtering distractions by date:", error);
    return [];
  }
}

/**
 * Clear all distraction data from localStorage
 */
function clearLocalDistractions() {
  try {
    localStorage.removeItem("distractions_data");
    console.log("✅ Distraction data cleared");
    return true;
  } catch (error) {
    console.error("❌ Error clearing distractions:", error);
    return false;
  }
}

// ============================================================================
// CALENDAR UTILITY
// ============================================================================

/**
 * Add a calendar event to localStorage
 * @param {Object} event - Event object { title, date, time, description }
 * @example addLocalCalendarEvent({ title: "Study Session", date: "2026-05-24", time: "14:00", description: "Math homework" })
 */
function addLocalCalendarEvent(event) {
  try {
    const events = getLocalCalendarEvents();
    const newEvent = {
      id: Date.now(),
      title: event.title || "Untitled Event",
      date: event.date || new Date().toISOString().split('T')[0],
      time: event.time || "12:00",
      description: event.description || "",
      completed: event.completed || false,
      ...event
    };
    events.push(newEvent);
    localStorage.setItem("calendar_events", JSON.stringify(events));
    console.log("✅ Calendar event added:", newEvent);
    return newEvent;
  } catch (error) {
    console.error("❌ Error adding calendar event:", error);
    return null;
  }
}

/**
 * Retrieve all calendar events from localStorage
 * @returns {Array} Array of calendar event objects
 */
function getLocalCalendarEvents() {
  try {
    const data = localStorage.getItem("calendar_events");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("❌ Error retrieving calendar events:", error);
    return [];
  }
}

/**
 * Get calendar events for today only
 * @returns {Array} Calendar events matching today's date
 */
function getTodayCalendarEvents() {
  try {
    const todayDate = new Date().toISOString().split('T')[0];
    const events = getLocalCalendarEvents();
    return events.filter(event => event.date === todayDate);
  } catch (error) {
    console.error("❌ Error retrieving today's events:", error);
    return [];
  }
}

/**
 * Get calendar events for a specific date
 * @param {String} dateStr - Date string in format YYYY-MM-DD
 * @returns {Array} Calendar events for the specified date
 */
function getCalendarEventsByDate(dateStr) {
  try {
    const events = getLocalCalendarEvents();
    return events.filter(event => event.date === dateStr);
  } catch (error) {
    console.error("❌ Error filtering calendar events:", error);
    return [];
  }
}

/**
 * Update a calendar event
 * @param {Number} eventId - Event ID to update
 * @param {Object} updates - Fields to update
 */
function updateCalendarEvent(eventId, updates) {
  try {
    const events = getLocalCalendarEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
      console.warn("⚠️ Event not found");
      return null;
    }
    events[eventIndex] = { ...events[eventIndex], ...updates };
    localStorage.setItem("calendar_events", JSON.stringify(events));
    console.log("✅ Event updated:", events[eventIndex]);
    return events[eventIndex];
  } catch (error) {
    console.error("❌ Error updating calendar event:", error);
    return null;
  }
}

/**
 * Mark a calendar event as completed
 * @param {Number} eventId - Event ID to mark complete
 */
function completeCalendarEvent(eventId) {
  return updateCalendarEvent(eventId, { completed: true });
}

/**
 * Delete a calendar event
 * @param {Number} eventId - Event ID to delete
 */
function deleteCalendarEvent(eventId) {
  try {
    const events = getLocalCalendarEvents();
    const filtered = events.filter(e => e.id !== eventId);
    localStorage.setItem("calendar_events", JSON.stringify(filtered));
    console.log("✅ Event deleted");
    return true;
  } catch (error) {
    console.error("❌ Error deleting event:", error);
    return false;
  }
}

/**
 * Clear all calendar events from localStorage
 */
function clearLocalCalendarEvents() {
  try {
    localStorage.removeItem("calendar_events");
    console.log("✅ Calendar data cleared");
    return true;
  } catch (error) {
    console.error("❌ Error clearing calendar:", error);
    return false;
  }
}

// ============================================================================
// COMBINED UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a summary of all stored data
 * @returns {Object} Object with distractions and calendar events
 */
function getLocalDataSummary() {
  return {
    distractions: getLocalDistractions(),
    todayDistractions: getDistractionsByDate(),
    calendarEvents: getLocalCalendarEvents(),
    todayEvents: getTodayCalendarEvents(),
    timestamp: new Date().toISOString()
  };
}

/**
 * Clear all localStorage data managed by this utility
 */
function clearAllLocalData() {
  try {
    clearLocalDistractions();
    clearLocalCalendarEvents();
    console.log("✅ All local data cleared");
    return true;
  } catch (error) {
    console.error("❌ Error clearing all data:", error);
    return false;
  }
}

/**
 * Export all local data (useful for debugging or backup)
 * @returns {String} JSON string of all data
 */
function exportLocalData() {
  return JSON.stringify(getLocalDataSummary(), null, 2);
}

// ============================================================================
// EXPORT for use in other files
// ============================================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // Distraction functions
    addLocalDistraction,
    getLocalDistractions,
    getDistractionsByDate,
    clearLocalDistractions,
    // Calendar functions
    addLocalCalendarEvent,
    getLocalCalendarEvents,
    getTodayCalendarEvents,
    getCalendarEventsByDate,
    updateCalendarEvent,
    completeCalendarEvent,
    deleteCalendarEvent,
    clearLocalCalendarEvents,
    // Utility functions
    getLocalDataSummary,
    clearAllLocalData,
    exportLocalData
  };
}
