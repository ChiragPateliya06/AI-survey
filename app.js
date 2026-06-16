/**
 * survey-app Client-side Script (Robust Version)
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
  const surveyForm = document.getElementById("survey-form");
  const successScreen = document.getElementById("success-screen");
  const progressBar = document.getElementById("progress-bar");
  const progressText = document.getElementById("progress-text");
  const loader = document.getElementById("loader");
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  
  // Theme Switching Management
  try {
    const currentTheme = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", currentTheme);
    updateThemeIcon(currentTheme);
  } catch (err) {
    console.warn("Theme retrieval failed:", err);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      try {
        const theme = document.body.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.body.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        updateThemeIcon(theme);
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

  // Questionnaire Options Style & Progress Management
  const questions = ["q1", "q2", "q3", "q4", "q5"];
  
  // Attach event listeners to all option inputs safely
  document.querySelectorAll(".option-input").forEach(input => {
    input.addEventListener("change", (e) => {
      try {
        const parentLabel = e.target.closest(".option-label");
        const name = e.target.name;
        
        // Remove active class from other options in this question
        document.querySelectorAll(`input[name="${name}"]`).forEach(rad => {
          const label = rad.closest(".option-label");
          if (label) label.classList.remove("active");
        });
        
        // Add active class to selected option
        if (e.target.checked && parentLabel) {
          parentLabel.classList.add("active");
        }
        
        // Update progress
        updateProgress();
      } catch (err) {
        console.error("Option selection error:", err);
      }
    });
  });

  function updateProgress() {
    try {
      let answeredCount = 0;
      questions.forEach(q => {
        const isAnswered = document.querySelector(`input[name="${q}"]:checked`);
        if (isAnswered) answeredCount++;
      });

      const percent = Math.round((answeredCount / questions.length) * 100);
      if (progressBar) progressBar.style.width = `${percent}%`;
      if (progressText) progressText.innerText = `${percent}% Complete`;
    } catch (err) {
      console.warn("Progress update failed:", err);
    }
  }

  // Handle Form Submission
  if (surveyForm) {
    surveyForm.addEventListener("submit", async (e) => {
      // CRITICAL: Block native GET submit reload immediately
      e.preventDefault();
      
      try {
        // Final verification of inputs
        let unanswered = [];
        questions.forEach((q, index) => {
          const val = document.querySelector(`input[name="${q}"]:checked`);
          if (!val) {
            unanswered.push(index + 1);
          }
        });

        if (unanswered.length > 0) {
          showToast(`Please answer question(s): ${unanswered.join(", ")}`, "error");
          return;
        }

        // Prepare payload
        const formData = new FormData(surveyForm);
        const payload = {};
        formData.forEach((value, key) => {
          payload[key] = value;
        });

        // Show loading
        showLoader(true);

        // Send using POST, using text/plain content type to avoid pre-flight options block on Google Script URL
        const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "text/plain;charset=utf-8"
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.status === "success" || result.result === "success") {
          // Success
          showToast("Response submitted successfully!");
          surveyForm.style.display = "none";
          if (successScreen) successScreen.style.display = "block";
          
          // Scroll to top to see success screen
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          throw new Error(result.message || "Failed to save response.");
        }
      } catch (err) {
        console.error("Submission error:", err);
        
        // Fallback screen activation (in case Google returns opaque response or CORS blocks reading payload)
        showToast("There was an issue parsing the response, but your data might have been successfully recorded.", "error");
        
        surveyForm.style.display = "none";
        if (successScreen) successScreen.style.display = "block";
        window.scrollTo({ top: 0, behavior: "smooth" });
      } finally {
        showLoader(false);
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
        toastIcon.setAttribute("data-lucide", "check-circle");
      }
    }
    
    safeCreateIcons();
    toast.classList.add("show");
    
    setTimeout(() => {
      toast.classList.remove("show");
    }, 4000);
  }
});
