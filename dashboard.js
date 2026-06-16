/**
 * Dashboard analytics & datatable script (Robust Version)
 */

document.addEventListener("DOMContentLoaded", () => {
  // Safe Icon Initializer
  function safeCreateIcons() {
    if (typeof lucide !== "undefined") {
      try {
        lucide.createIcons();
      } catch (err) {
        console.warn("Lucide icons failed to render:", err);
      }
    }
  }

  // Run initial icon setup
  safeCreateIcons();

  // Elements
  const themeToggleBtn = document.getElementById("theme-toggle");
  const statTotalEl = document.getElementById("stat-total");
  const statDailyUsersEl = document.getElementById("stat-daily-users");
  const statGradeImproveEl = document.getElementById("stat-grade-improve");
  const tableBody = document.getElementById("table-body");
  const searchInput = document.getElementById("search-input");
  const btnPrevPage = document.getElementById("btn-prev-page");
  const btnNextPage = document.getElementById("btn-next-page");
  const tableInfo = document.getElementById("table-info");
  const btnDownloadExcel = document.getElementById("btn-download-excel");
  const loader = document.getElementById("loader");
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");

  // State
  let rawData = [];
  let filteredData = [];
  let currentPage = 1;
  const rowsPerPage = 10;
  let charts = {};

  // Theme Management
  try {
    const currentTheme = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", currentTheme);
    updateThemeIcon(currentTheme);
  } catch (err) {
    console.warn("Theme load failed:", err);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      try {
        const theme = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.body.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        updateThemeIcon(theme);
        updateChartTheme(theme);
      } catch (err) {
        console.error(err);
      }
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggleBtn) return;
    const icon = themeToggleBtn.querySelector("i");
    if (icon) {
      if (theme === "dark") {
        icon.setAttribute("data-lucide", "sun");
      } else {
        icon.setAttribute("data-lucide", "moon");
      }
    }
    safeCreateIcons();
  }

  // Set up Excel Download Link
  if (btnDownloadExcel) {
    btnDownloadExcel.addEventListener("click", () => {
      if (CONFIG.GOOGLE_SHEET_EXPORT_URL.includes("YOUR_SHEET_ID")) {
        showToast("Please replace 'YOUR_SHEET_ID' in js/config.js with your Google Sheet ID to export data.", "error");
        return;
      }
      showToast("Downloading Excel file...");
      window.open(CONFIG.GOOGLE_SHEET_EXPORT_URL, "_blank");
    });
  }

  // Fetch Data from Google Sheet
  async function fetchSurveyData() {
    showLoader(true);
    try {
      if (!CONFIG.GOOGLE_SCRIPT_URL || CONFIG.GOOGLE_SCRIPT_URL.includes("YOUR_GOOGLE_APPS_SCRIPT") || CONFIG.GOOGLE_SCRIPT_URL === "") {
        throw new Error("API URL not configured yet. Showing mock demo data.");
      }

      const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?action=read`);
      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }
      
      rawData = await response.json();
      filteredData = [...rawData];
      
      showToast("Data synced in real-time!");
      renderDashboard();
    } catch (err) {
      console.warn(err.message);
      showToast(err.message, "error");
      
      // Load mock data so dashboard is fully functional for review
      loadMockData();
      renderDashboard();
    } finally {
      showLoader(false);
    }
  }

  // Load interactive mock dataset for instant demonstration
  function loadMockData() {
    rawData = [
      {
        "Timestamp": "2026-06-15T09:12:00.000Z",
        "Submission ID": "SUB-D9A3K8N2L",
        "How often do you use AI tools?": "Daily",
        "What is your primary use of AI tools?": "Studying / Learning",
        "Do AI tools improve your grades?": "Strongly Agree",
        "Do you rely on AI tools for assignments?": "Sometimes",
        "Do AI tools reduce your critical thinking ability?": "Disagree"
      },
      {
        "Timestamp": "2026-06-15T11:45:00.000Z",
        "Submission ID": "SUB-A3K1P9L5M",
        "How often do you use AI tools?": "Daily",
        "What is your primary use of AI tools?": "Writing / Coding",
        "Do AI tools improve your grades?": "Agree",
        "Do you rely on AI tools for assignments?": "Often",
        "Do AI tools reduce your critical thinking ability?": "Neutral"
      },
      {
        "Timestamp": "2026-06-15T14:22:00.000Z",
        "Submission ID": "SUB-L8B2O1N8W",
        "How often do you use AI tools?": "Weekly",
        "What is your primary use of AI tools?": "Studying / Learning",
        "Do AI tools improve your grades?": "Agree",
        "Do you rely on AI tools for assignments?": "Sometimes",
        "Do AI tools reduce your critical thinking ability?": "Disagree"
      },
      {
        "Timestamp": "2026-06-16T08:05:00.000Z",
        "Submission ID": "SUB-P1O9M3R2L",
        "How often do you use AI tools?": "Rarely",
        "What is your primary use of AI tools?": "Finding Information",
        "Do AI tools improve your grades?": "Neutral",
        "Do you rely on AI tools for assignments?": "Rarely",
        "Do AI tools reduce your critical thinking ability?": "Agree"
      },
      {
        "Timestamp": "2026-06-16T09:30:00.000Z",
        "Submission ID": "SUB-F7B4P8D1A",
        "How often do you use AI tools?": "Daily",
        "What is your primary use of AI tools?": "Studying / Learning",
        "Do AI tools improve your grades?": "Agree",
        "Do you rely on AI tools for assignments?": "Often",
        "Do AI tools reduce your critical thinking ability?": "Strongly Disagree"
      },
      {
        "Timestamp": "2026-06-16T10:15:00.000Z",
        "Submission ID": "SUB-W3Q2Z1X7V",
        "How often do you use AI tools?": "Never",
        "What is your primary use of AI tools?": "Entertainment",
        "Do AI tools improve your grades?": "Strongly Disagree",
        "Do you rely on AI tools for assignments?": "Never",
        "Do AI tools reduce your critical thinking ability?": "Strongly Agree"
      },
      {
        "Timestamp": "2026-06-16T10:48:00.000Z",
        "Submission ID": "SUB-J9G8F7D2S",
        "How often do you use AI tools?": "Weekly",
        "What is your primary use of AI tools?": "Finding Information",
        "Do AI tools improve your grades?": "Agree",
        "Do you rely on AI tools for assignments?": "Sometimes",
        "Do AI tools reduce your critical thinking ability?": "Disagree"
      }
    ];
    filteredData = [...rawData];
  }

  // Render Dashboard Contents
  function renderDashboard() {
    renderKPIs();
    renderCharts();
    renderTable();
  }

  // Calculate and Render Metrics Cards
  function renderKPIs() {
    const total = rawData.length;
    if (statTotalEl) statTotalEl.innerText = total;

    if (total === 0) {
      if (statDailyUsersEl) statDailyUsersEl.innerText = "0%";
      if (statGradeImproveEl) statGradeImproveEl.innerText = "0%";
      return;
    }

    // Daily users percentage
    const dailyCount = rawData.filter(row => row["How often do you use AI tools?"] === "Daily").length;
    const dailyPercent = Math.round((dailyCount / total) * 100);
    if (statDailyUsersEl) statDailyUsersEl.innerText = `${dailyPercent}%`;

    // Grade improvement agreement (Agree + Strongly Agree)
    const improveCount = rawData.filter(row => {
      const val = row["Do AI tools improve your grades?"];
      return val === "Agree" || val === "Strongly Agree";
    }).length;
    const improvePercent = Math.round((improveCount / total) * 100);
    if (statGradeImproveEl) statGradeImproveEl.innerText = `${improvePercent}%`;
  }

  // Render ChartJS Visualizations
  function renderCharts() {
    if (typeof Chart === "undefined") {
      console.warn("Chart.js library is not loaded.");
      return;
    }

    const isDark = document.body.getAttribute("data-theme") === "dark";
    const textThemeColor = isDark ? "#9ca3af" : "#4b5563";
    const gridThemeColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";
    
    Chart.defaults.font.family = "'Outfit', sans-serif";
    Chart.defaults.color = textThemeColor;

    // Helper to count frequencies
    const getFrequency = (column, options) => {
      const counts = {};
      options.forEach(opt => counts[opt] = 0);
      rawData.forEach(row => {
        const val = row[column];
        if (counts[val] !== undefined) {
          counts[val]++;
        }
      });
      return options.map(opt => counts[opt]);
    };

    // Color Palettes
    const colorsPrimary = [
      "rgba(139, 92, 246, 0.85)", // Violet
      "rgba(99, 102, 241, 0.85)", // Indigo
      "rgba(59, 130, 246, 0.85)", // Blue
      "rgba(244, 63, 94, 0.85)",  // Rose
      "rgba(234, 179, 8, 0.85)"   // Yellow
    ];
    
    const bordersPrimary = [
      "rgb(139, 92, 246)",
      "rgb(99, 102, 241)",
      "rgb(59, 130, 246)",
      "rgb(244, 63, 94)",
      "rgb(234, 179, 8)"
    ];

    // Chart 1: AI Usage Frequency (Doughnut)
    const q1Opts = ["Daily", "Weekly", "Monthly", "Rarely", "Never"];
    const q1Canvas = document.getElementById("chart-q1");
    if (q1Canvas) {
      const q1Data = getFrequency("How often do you use AI tools?", q1Opts);
      initOrUpdateChart("chart-q1", "doughnut", q1Opts, q1Data, "Usage Frequency", colorsPrimary, bordersPrimary, {
        plugins: { legend: { position: "right", labels: { boxWidth: 12 } } }
      });
    }

    // Chart 2: Primary Use Cases (Horizontal Bar)
    const q2Opts = ["Studying / Learning", "Writing / Coding", "Finding Information", "Entertainment", "Other"];
    const q2Canvas = document.getElementById("chart-q2");
    if (q2Canvas) {
      const q2Data = getFrequency("What is your primary use of AI tools?", q2Opts);
      initOrUpdateChart("chart-q2", "bar", q2Opts, q2Data, "Respondents", colorsPrimary[1], bordersPrimary[1], {
        indexAxis: "y",
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: gridThemeColor }, ticks: { precision: 0 } },
          y: { grid: { display: false } }
        }
      });
    }

    // Chart 3: Grade Improvement (Bar)
    const q3Opts = ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"];
    const q3Canvas = document.getElementById("chart-q3");
    if (q3Canvas) {
      const q3Data = getFrequency("Do AI tools improve your grades?", q3Opts);
      initOrUpdateChart("chart-q3", "bar", q3Opts, q3Data, "Respondents", colorsPrimary[2], bordersPrimary[2], {
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: gridThemeColor }, ticks: { precision: 0 } }
        }
      });
    }

    // Chart 4: Reliance (Pie)
    const q4Opts = ["Always", "Often", "Sometimes", "Rarely", "Never"];
    const q4Canvas = document.getElementById("chart-q4");
    if (q4Canvas) {
      const q4Data = getFrequency("Do you rely on AI tools for assignments?", q4Opts);
      initOrUpdateChart("chart-q4", "pie", q4Opts, q4Data, "Reliance Level", colorsPrimary, bordersPrimary, {
        plugins: { legend: { position: "right", labels: { boxWidth: 12 } } }
      });
    }

    // Chart 5: Critical Thinking Reduction (Bar)
    const q5Opts = ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"];
    const q5Canvas = document.getElementById("chart-q5");
    if (q5Canvas) {
      const q5Data = getFrequency("Do AI tools reduce your critical thinking ability?", q5Opts);
      initOrUpdateChart("chart-q5", "bar", q5Opts, q5Data, "Respondents", colorsPrimary[3], bordersPrimary[3], {
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: gridThemeColor }, ticks: { precision: 0 } }
        }
      });
    }
  }

  // Create or Update ChartJS instance helper
  function initOrUpdateChart(id, type, labels, data, datasetLabel, backgroundColors, borderColors, options = {}) {
    const canvas = document.getElementById(id);
    if (!canvas) return;

    if (charts[id]) {
      charts[id].data.labels = labels;
      charts[id].data.datasets[0].data = data;
      charts[id].options = { ...charts[id].options, ...options };
      charts[id].update();
      return;
    }

    const ctx = canvas.getContext("2d");
    
    // Add default responsive options
    const mergedOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          padding: 10,
          cornerRadius: 8,
          backgroundColor: "rgba(15, 12, 30, 0.95)",
        }
      },
      ...options
    };

    charts[id] = new Chart(ctx, {
      type: type,
      data: {
        labels: labels,
        datasets: [{
          label: datasetLabel,
          data: data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
          borderRadius: type === "bar" ? 4 : 0
        }]
      },
      options: mergedOptions
    });
  }

  function updateChartTheme(theme) {
    if (typeof Chart === "undefined") return;

    const isDark = theme === "dark";
    const color = isDark ? "#9ca3af" : "#4b5563";
    const gridColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)";

    Chart.defaults.color = color;
    
    Object.keys(charts).forEach(id => {
      const chart = charts[id];
      chart.options.scales = chart.options.scales || {};
      
      if (chart.options.scales.x) {
        chart.options.scales.x.grid = chart.options.scales.x.grid || {};
        if (chart.options.scales.x.grid.display !== false) {
          chart.options.scales.x.grid.color = gridColor;
        }
        chart.options.scales.x.ticks = chart.options.scales.x.ticks || {};
        chart.options.scales.x.ticks.color = color;
      }
      
      if (chart.options.scales.y) {
        chart.options.scales.y.grid = chart.options.scales.y.grid || {};
        if (chart.options.scales.y.grid.display !== false) {
          chart.options.scales.y.grid.color = gridColor;
        }
        chart.options.scales.y.ticks = chart.options.scales.y.ticks || {};
        chart.options.scales.y.ticks.color = color;
      }

      if (chart.options.plugins && chart.options.plugins.legend) {
        chart.options.plugins.legend.labels = chart.options.plugins.legend.labels || {};
        chart.options.plugins.legend.labels.color = color;
      }
      
      chart.update();
    });
  }

  // Render Submissions Table with Search & Pagination
  function renderTable() {
    if (!tableBody) return;
    tableBody.innerHTML = "";

    if (filteredData.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">
            <i data-lucide="info" style="width: 24px; height: 24px; margin-bottom: 8px;"></i>
            <br>No matching survey responses found.
          </td>
        </tr>
      `;
      safeCreateIcons();
      if (tableInfo) tableInfo.innerText = "Showing 0 of 0 entries";
      if (btnPrevPage) btnPrevPage.disabled = true;
      if (btnNextPage) btnNextPage.disabled = true;
      return;
    }

    // Pagination Calculations
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, filteredData.length);
    const paginatedData = filteredData.slice(startIndex, endIndex);

    paginatedData.forEach(row => {
      // Format Timestamp (making it look elegant)
      let formattedDate = "N/A";
      if (row["Timestamp"]) {
        try {
          const d = new Date(row["Timestamp"]);
          formattedDate = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + 
                          d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch(e) {
          formattedDate = String(row["Timestamp"]);
        }
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="white-space: nowrap;">${formattedDate}</td>
        <td style="font-family: monospace; font-weight: 600;">${row["Submission ID"] || "N/A"}</td>
        <td>${row["How often do you use AI tools?"] || "N/A"}</td>
        <td>${row["What is your primary use of AI tools?"] || "N/A"}</td>
        <td>${row["Do AI tools improve your grades?"] || "N/A"}</td>
        <td>${row["Do you rely on AI tools for assignments?"] || "N/A"}</td>
        <td>${row["Do AI tools reduce your critical thinking ability?"] || "N/A"}</td>
      `;
      tableBody.appendChild(tr);
    });

    // Update table info and paging controls
    if (tableInfo) tableInfo.innerText = `Showing ${startIndex + 1} to ${endIndex} of ${filteredData.length} entries`;
    if (btnPrevPage) btnPrevPage.disabled = currentPage === 1;
    if (btnNextPage) btnNextPage.disabled = currentPage === totalPages;
    safeCreateIcons();
  }

  // Handle Search Filtering
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      
      if (searchTerm === "") {
        filteredData = [...rawData];
      } else {
        filteredData = rawData.filter(row => {
          return Object.values(row).some(val => {
            return String(val).toLowerCase().includes(searchTerm);
          });
        });
      }

      currentPage = 1;
      renderTable();
    });
  }

  // Handle Pagination Buttons
  if (btnPrevPage) {
    btnPrevPage.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });
  }

  if (btnNextPage) {
    btnNextPage.addEventListener("click", () => {
      const totalPages = Math.ceil(filteredData.length / rowsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
      }
    });
  }

  // Helper Utilities
  function showLoader(show) {
    if (loader) loader.style.display = show ? "flex" : "none";
  }

  function showToast(message, type = "success") {
    if (!toast || !toastMessage) return;
    
    toastMessage.innerText = message;
    const toastIcon = toast.querySelector("i");
    
    if (toastIcon) {
      if (type === "error") {
        toast.classList.add("toast-error");
        toastIcon.setAttribute("data-lucide", "alert-circle");
      } else {
        toast.classList.remove("toast-error");
        toastIcon.setAttribute("data-lucide", "info");
      }
    }
    
    safeCreateIcons();
    toast.classList.add("show");
    
    setTimeout(() => {
      toast.classList.remove("show");
    }, 4000);
  }

  // Start Fetching Data
  fetchSurveyData();
});
