from flask import Flask, render_template, request, jsonify
from .database import init_database, add_work_entry, get_work_summary_by_project
# import sqlite3 # No longer needed directly in main.py

app = Flask(__name__)

# Initialize the database when the application starts
# This will create the database file and table if they don't exist.
init_database()

@app.route('/')
def index():
    """Render the main page, which will eventually include the form to submit work entries."""
    return render_template('index.html')

# The existing /add_entry route can be removed or modified if it's for HTML form submission.
# For this task, we are focusing on the JSON API endpoint /api/work_entries.
# I will remove the old /add_entry to avoid confusion.

@app.route('/api/work_entries', methods=['POST'])
def api_add_work_entry():
    """API endpoint to add a new work entry."""
    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    project_number = data.get('project_number')
    worker_name = data.get('worker_name')
    work_time_hours = data.get('work_time_hours')
    work_details = data.get('work_details') # This can be optional

    # Basic validation
    if not project_number:
        return jsonify({"error": "Project number is required"}), 400
    if not worker_name:
        return jsonify({"error": "Worker name is required"}), 400
    if work_time_hours is None: # Check for None specifically, 0 is a valid time
        return jsonify({"error": "Work time (hours) is required"}), 400

    try:
        work_time_hours = float(work_time_hours)
        if work_time_hours <= 0:
             return jsonify({"error": "Work time must be a positive number"}), 400
    except ValueError:
        return jsonify({"error": "Work time must be a valid number"}), 400

    # Call the database function to add the entry
    success = add_work_entry(project_number, worker_name, work_details, work_time_hours)

    if success:
        return jsonify({"message": "Work entry logged successfully"}), 201
    else:
        # Specific error should be logged in add_work_entry, return a generic server error
        return jsonify({"error": "Failed to log work entry due to a server error"}), 500

@app.route('/api/work_summary', methods=['GET'])
def api_work_summary():
    """API endpoint to get a summary of work hours by project."""
    summary_data = get_work_summary_by_project()

    if summary_data is None: # Indicates an error from the database function
        return jsonify({"error": "Failed to retrieve work summary due to a server error"}), 500
    
    return jsonify(summary_data), 200

if __name__ == '__main__':
    # Note: Running with app.run() is suitable for development.
    # For production, use a WSGI server like Gunicorn or Waitress.
    app.run(debug=True)
