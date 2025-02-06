function hideMessageBox() {
  document.getElementById("quick-msg-info-section").style.display = "none";
}

window.onload = function () {
  const messageBox = document.getElementById("quick-msg-info-section");
  if (messageBox) {
    messageBox.style.display = "block";
    setTimeout(() => {
      messageBox.style.display = "none";
    }, 5000);
  }

  // Apply the stored mode from localStorage
  const mode = localStorage.getItem("mode");
  if (mode === "dark") {
    document.body.classList.add("dark-mode");
    document.getElementById("toggleMode").textContent = "🌞";
  } else {
    document.body.classList.remove("dark-mode");
    document.getElementById("toggleMode").textContent = "🌙";
  }
};

document.getElementById("toggleMode").addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  this.textContent = isDarkMode ? "🌞" : "🌙";
  localStorage.setItem("mode", isDarkMode ? "dark" : "light");
});

const startfunctionBtn = () => {
  const startBtn = document.querySelector(".start-btn");
  startBtn.addEventListener("click", () => {
    const statusIndicator = document.querySelector(".status-indicator");
    statusIndicator.classList.remove("inactive");
    statusIndicator.classList.add("active");
  });
};
