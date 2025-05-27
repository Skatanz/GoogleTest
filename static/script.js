document.addEventListener('DOMContentLoaded', function () {
    const workLogForm = document.getElementById('workLogForm');
    const messageArea = document.getElementById('messageArea');

    if (workLogForm) {
        workLogForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent default form submission

            const projectNumber = document.getElementById('project_number').value.trim();
            const workerName = document.getElementById('worker_name').value.trim();
            const workDetails = document.getElementById('work_details').value.trim();
            const workTimeHours = document.getElementById('work_time_hours').value;

            // Basic client-side validation
            if (!projectNumber) {
                displayMessage('Project Number is required.', 'error');
                return;
            }
            if (!workerName) {
                displayMessage('Worker Name is required.', 'error');
                return;
            }
            if (!workTimeHours) {
                displayMessage('Work Time (Hours) is required.', 'error');
                return;
            }
            if (parseFloat(workTimeHours) <= 0) {
                displayMessage('Work Time (Hours) must be a positive number.', 'error');
                return;
            }

            const formData = {
                project_number: projectNumber,
                worker_name: workerName,
                work_details: workDetails,
                work_time_hours: parseFloat(workTimeHours)
            };

            fetch('/api/work_entries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
            .then(response => {
                // Check if the response is JSON, otherwise treat as text
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    return response.json().then(data => ({ status: response.status, body: data }));
                } else {
                    return response.text().then(text => ({ status: response.status, body: { message: text, error: text } })); // Wrap text in a similar structure
                }
            })
            .then(data => {
                if (data.status === 201) { // Created
                    displayMessage(data.body.message || 'Work entry logged successfully!', 'success');
                    workLogForm.reset(); // Clear the form
                } else {
                    // Try to display a specific error from JSON, or a generic one
                    const errorMessage = data.body.error || data.body.message || `Error ${data.status}: Could not log entry.`;
                    displayMessage(errorMessage, 'error');
                }
            })
            .catch(error => {
                console.error('Error submitting work log:', error);
                displayMessage('An unexpected error occurred. Please try again.', 'error');
            });
        });
    }

    function displayMessage(message, type) {
        if (messageArea) {
            messageArea.textContent = message;
            messageArea.className = type === 'success' ? 'message success' : 'message error';
            // Add styling for these classes in style.css if needed
        } else {
            // Fallback if messageArea is not found (though it should be)
            alert(message);
        }
    }

    // ---- Summary Table Functionality ----
    const loadSummaryBtn = document.getElementById('loadSummaryBtn');
    const summaryTableContainer = document.getElementById('summaryTableContainer');

    if (loadSummaryBtn) {
        loadSummaryBtn.addEventListener('click', fetchAndDisplaySummary);
    }

    function fetchAndDisplaySummary() {
        if (!summaryTableContainer) return;

        summaryTableContainer.innerHTML = '<p>Loading summary...</p>'; // Show loading message

        fetch('/api/work_summary')
            .then(response => {
                if (!response.ok) {
                    // Try to get error from JSON response if available
                    return response.json().then(errData => {
                        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
                    }).catch(() => {
                        // Fallback if response is not JSON or json parsing fails
                        throw new Error(`HTTP error! status: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(summaryData => {
                summaryTableContainer.innerHTML = ''; // Clear previous content (loading message or old table)

                if (!summaryData || summaryData.length === 0) {
                    summaryTableContainer.innerHTML = '<p>No work summary data available.</p>';
                    return;
                }

                const table = document.createElement('table');
                table.className = 'summary-table'; // For potential styling

                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                const thProject = document.createElement('th');
                thProject.textContent = 'Project Number';
                const thHours = document.createElement('th');
                thHours.textContent = 'Total Hours';
                headerRow.appendChild(thProject);
                headerRow.appendChild(thHours);
                thead.appendChild(headerRow);
                table.appendChild(thead);

                const tbody = document.createElement('tbody');
                summaryData.forEach(item => {
                    const tr = document.createElement('tr');
                    const tdProject = document.createElement('td');
                    tdProject.textContent = item.project_number;
                    const tdHours = document.createElement('td');
                    tdHours.textContent = item.total_hours.toFixed(1); // Format to one decimal place
                    tr.appendChild(tdProject);
                    tr.appendChild(tdHours);
                    tbody.appendChild(tr);
                });
                table.appendChild(tbody);

                summaryTableContainer.appendChild(table);
            })
            .catch(error => {
                console.error('Error fetching work summary:', error);
                if (summaryTableContainer) {
                    summaryTableContainer.innerHTML = `<p class="message error">Error loading summary: ${error.message}</p>`;
                } else {
                    displayMessage(`Error loading summary: ${error.message}`, 'error');
                }
            });
    }

    // Optional: Load summary when the page first loads
    // fetchAndDisplaySummary(); 

    // ---- QR Code Generation ----
    const generateQrBtn = document.getElementById('generateQrBtn');
    const qrDataInput = document.getElementById('qrDataInput');
    const qrCodeImageContainer = document.getElementById('qrCodeImageContainer');
    let qrCodeInstance = null; // To keep track of the QRCode instance

    if (generateQrBtn && qrDataInput && qrCodeImageContainer) {
        generateQrBtn.addEventListener('click', function() {
            const dataToEncode = qrDataInput.value.trim();
            if (!dataToEncode) {
                alert("Please enter data to encode in the QR code.");
                qrDataInput.focus();
                return;
            }

            // Construct URL for pre-filling.
            // We'll assume the input can be used for project_number or worker_name.
            // A more robust solution might involve a dropdown to select which field to pre-fill
            // or a more complex data structure if multiple fields are needed.
            // For simplicity, let's assume it pre-fills project_number if it looks like one,
            // otherwise worker_name. This is a basic heuristic.
            let paramName = "project_number"; 
            // Basic check: if it contains non-alphanumeric (excluding typical project code chars like -), assume it's a name
            if (/[^a-zA-Z0-9\-]/.test(dataToEncode) || dataToEncode.length > 20) { // Heuristic for name
                paramName = "worker_name";
            }
            
            const urlToEncode = `${window.location.origin}${window.location.pathname}?${paramName}=${encodeURIComponent(dataToEncode)}`;

            // Clear previous QR code
            qrCodeImageContainer.innerHTML = ''; 
            
            // Create new QR code
            try {
                 qrCodeInstance = new QRCode(qrCodeImageContainer, {
                    text: urlToEncode,
                    width: 128,
                    height: 128,
                    colorDark : "#000000",
                    colorLight : "#ffffff",
                    correctLevel : QRCode.CorrectLevel.H
                });
            } catch (e) {
                console.error("QR Code generation failed:", e);
                qrCodeImageContainer.innerHTML = "<p class='message error'>Could not generate QR code.</p>";
            }
        });
    }

    // ---- Form Pre-filling from URL Parameters ----
    function prefillFormFromUrlParams() {
        const params = new URLSearchParams(window.location.search);

        const projectNumberParam = params.get('project_number');
        if (projectNumberParam && document.getElementById('project_number')) {
            document.getElementById('project_number').value = projectNumberParam;
        }

        const workerNameParam = params.get('worker_name');
        if (workerNameParam && document.getElementById('worker_name')) {
            document.getElementById('worker_name').value = workerNameParam;
        }
        
        // Could add more params here like work_details, work_time_hours if needed
        // e.g., const workDetailsParam = params.get('work_details'); ...
    }

    // Call prefill function on page load
    prefillFormFromUrlParams();

});
