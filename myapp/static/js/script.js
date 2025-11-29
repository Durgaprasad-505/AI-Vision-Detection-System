// ===============================
// Image Upload & Preview
// ===============================
document.getElementById("fileInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    const img = document.getElementById("previewImg");
    const placeholder = document.getElementById("placeholder");

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            img.src = e.target.result;
            img.style.display = "block";
            placeholder.style.display = "none";
        };
        reader.readAsDataURL(file);
    }
});

// ===============================
// Clear Selected Image
// ===============================
document.getElementById("clearBtn").addEventListener("click", function() {
    const fileInput = document.getElementById("fileInput");
    const previewImg = document.getElementById("previewImg");
    const placeholder = document.getElementById("placeholder");
    const resultImg = document.getElementById("resultImg");
    const resultPlaceholder = document.getElementById("resultPlaceholder");
    const spinner = document.getElementById("loadingSpinner");

    // Reset image preview
    previewImg.src = "";
    previewImg.style.display = "none";
    placeholder.style.display = "block";

    // Reset detection results
    resultImg.src = "";
    resultImg.style.display = "none";
    resultPlaceholder.textContent = "No Results Yet";
    resultPlaceholder.style.display = "block";
    spinner.style.display = "none";

    // Clear file input
    fileInput.value = "";

    // Clear detection data
    window.latestDetections = null;
});

// ===============================
// Run YOLO Detection (Backend)
// ===============================
document.getElementById("detectBtn").addEventListener("click", async function() {
    const fileInput = document.getElementById("fileInput");
    const resultImg = document.getElementById("resultImg");
    const resultPlaceholder = document.getElementById("resultPlaceholder");
    const spinner = document.getElementById("loadingSpinner");

    if (!fileInput.files.length) {
        alert("Please select an image first!");
        return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("image", fileInput.files[0]);

    // Show loading spinner
    spinner.style.display = "block";
    resultPlaceholder.textContent = "🔍 Detecting... please wait.";
    resultPlaceholder.style.display = "block";
    resultImg.style.display = "none";

    try {
        // Call Django backend
        const response = await fetch("/detect/", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Server error: " + response.status);
        }

        const data = await response.json();

        // Hide spinner
        spinner.style.display = "none";

        if (data.image) {
            // Display result image
            resultImg.src = "data:image/jpeg;base64," + data.image;
            resultImg.style.display = "block";
            resultPlaceholder.style.display = "none";

            // Save detections for JSON download
            window.latestDetections = data.detections;
        } else {
            alert("Error: " + (data.error || "No image returned"));
        }
    } catch (err) {
        console.error(err);
        spinner.style.display = "none";
        alert("Detection failed: " + err.message);
    }
});

// ===============================
// Download JSON Results
// ===============================
document.getElementById("downloadBtn").addEventListener("click", function() {
    if (!window.latestDetections) {
        alert("No detections available! Please run detection first.");
        return;
    }

    const blob = new Blob(
        [JSON.stringify(window.latestDetections, null, 2)],
        { type: "application/json" }
    );

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "detection_result.json";
    link.click();
});
// ---- Live Date and Time ----
function updateDateTime() {
    const now = new Date();
    const formatted = now.toLocaleString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('datetime').textContent = formatted;
}
setInterval(updateDateTime, 1000);
updateDateTime();
