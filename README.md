# Work Log Application

A simple web application to log work entries, view summaries by project, and generate QR codes for quick form pre-filling.

## Prerequisites

*   Python 3.x
*   Flask (Python web framework)

To install Flask, you can use pip:
```bash
pip install Flask
```
(However, using `requirements.txt` as described below is recommended for managing all dependencies.)

## Setup and Running the Application

1.  **Clone the Repository (Example):**
    If you were cloning this project from a remote repository (e.g., GitHub), you would use:
    ```bash
    git clone <repository-url>
    cd <repository-directory-name>
    ```
    *(Note: In the current development environment, the code is already present in the `/app` directory.)*

2.  **Create a Virtual Environment (Recommended):**
    It's good practice to use a virtual environment to manage project-specific dependencies.
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Linux/macOS
    # venv\Scripts\activate   # On Windows
    ```

3.  **Install Dependencies:**
    The `requirements.txt` file lists the necessary Python packages. Install them using:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Initialize the Database:**
    The application is designed to create the `work_log.db` SQLite database and the `work_entries` table automatically when `app/main.py` is first run (specifically when `init_database()` is called).
    If you need to create it manually or reset it, you can run:
    ```bash
    python app/database.py
    ```
    This will create `work_log.db` in the root directory if it doesn't exist.

5.  **Run the Application:**
    To start the Flask development server, run:
    ```bash
    python app/main.py
    ```
    This will run the application in debug mode by default.

    Alternatively, if you have the Flask CLI installed and configured (e.g., by setting `FLASK_APP=app/main.py` as an environment variable), you can use:
    ```bash
    flask run
    ```

6.  **Access the Application:**
    Once the server is running, open your web browser and navigate to:
    [http://127.0.0.1:5000/](http://127.0.0.1:5000/)

## Features

*   **Log Work Entries:** Users can submit work details including:
    *   Project Number (Required)
    *   Worker Name (Required)
    *   Work Details (Optional)
    *   Work Time in hours (Required, positive number)
*   **View Work Summary:** A summary of total work hours, aggregated by Project Number, can be loaded and displayed on the page.
*   **Generate QR Codes:** Users can generate a QR code for a specific text string (e.g., a Project Number or Worker Name).
*   **Pre-fill Form via QR Code:** Scanning the generated QR code with a compatible device (like a smartphone's QR scanner app) will open the application's main page in the device's browser. The URL embedded in the QR code contains parameters that pre-fill the "Project Number" or "Worker Name" field in the work log form, streamlining data entry.

## Directory Structure

*   `app/`: Contains the core Flask application.
    *   `__init__.py`: Initializes the `app` directory as a Python package.
    *   `main.py`: Defines Flask routes, handles requests, and serves HTML pages.
    *   `database.py`: Manages SQLite database interactions (connection, table creation, adding entries, querying summaries).
*   `static/`: Stores static assets served directly to the client.
    *   `style.css`: Contains all CSS rules for styling the HTML pages.
    *   `script.js`: Contains client-side JavaScript for dynamic interactions (form submission via Fetch API, loading summaries, QR code generation, and form pre-filling).
*   `templates/`: Contains HTML templates rendered by Flask.
    *   `index.html`: The single HTML page for the application.
*   `requirements.txt`: Lists project dependencies (e.g., `Flask`).
*   `.gitignore`: Specifies files and directories to be ignored by Git.
*   `README.md`: This documentation file.
*   `work_log.db`: The SQLite database file (will be created in the root directory when the application runs or `database.py` is executed).

## How to Use QR Code Feature

1.  **Navigate to the "Generate QR Code" Section:**
    On the main page of the application, scroll down to the section titled "Generate QR Code for Pre-filling."

2.  **Enter Data for QR Code:**
    In the input field labeled "Project Number / Text to Encode:", type the data you want to embed in the QR code. This is typically a Project Number (e.g., "PROJ100") or a Worker Name (e.g., "Jane Doe").

3.  **Generate the QR Code:**
    Click the "Generate QR Code" button.

4.  **Scan the QR Code:**
    A QR code image will appear below the button in the designated area. Use a QR code scanner app on your smartphone or tablet to scan this image.

5.  **Access Pre-filled Form:**
    After scanning, your device's QR scanner app should prompt you to open a URL in your web browser. This URL points to the work log application. When the page loads, the "Project Number" or "Worker Name" field in the "Add New Work Entry" form will be automatically pre-filled with the data you encoded. You can then complete any other necessary fields and submit the form.

This feature is designed to simplify the process of starting a new work log entry, especially for frequently used project numbers or by specific workers, by reducing manual typing on mobile devices.
