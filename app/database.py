import sqlite3

DATABASE_NAME = 'work_log.db'

def create_connection():
    """Create a database connection to the SQLite database."""
    conn = None
    try:
        conn = sqlite3.connect(DATABASE_NAME)
        print(f"sqlite3.version: {sqlite3.version}")
    except sqlite3.Error as e:
        print(e)
    return conn

def create_table(conn):
    """Create the work_entries table if it doesn't exist."""
    try:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS work_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_number TEXT NOT NULL,
                worker_name TEXT NOT NULL,
                work_details TEXT,
                work_time_hours REAL NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()
        print("Table 'work_entries' created successfully or already exists.")
    except sqlite3.Error as e:
        print(e)

def init_database():
    """Initialize the database: create connection and table."""
    conn = create_connection()
    if conn is not None:
        create_table(conn)
        conn.close()
    else:
        print("Error! Cannot create the database connection.")

if __name__ == '__main__':
    # This allows us to initialize the database by running this script directly
    init_database()

def add_work_entry(project_number, worker_name, work_details, work_time_hours):
    """Add a new work entry to the work_entries table."""
    conn = create_connection()
    if conn is None:
        print("Error! Cannot create the database connection.")
        return False

    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO work_entries (project_number, worker_name, work_details, work_time_hours)
            VALUES (?, ?, ?, ?)
        """, (project_number, worker_name, work_details, work_time_hours))
        conn.commit()
        print(f"Entry added: {project_number}, {worker_name}, {work_time_hours} hours")
        return True
    except sqlite3.Error as e:
        print(f"Error adding work entry: {e}")
        conn.rollback() # Rollback changes on error
        return False
    finally:
        conn.close()

def get_work_summary_by_project():
    """Retrieve a summary of work hours grouped by project."""
    conn = create_connection()
    if conn is None:
        print("Error! Cannot create the database connection for summary.")
        return None # Indicate error

    summary = []
    try:
        cursor = conn.cursor()
        # Make rows accessible by column name
        # conn.row_factory = sqlite3.Row # Alternative way, but manual dict creation is also clear
        cursor.execute("""
            SELECT project_number, SUM(work_time_hours) as total_hours
            FROM work_entries
            GROUP BY project_number
            ORDER BY project_number;
        """)
        rows = cursor.fetchall()
        for row in rows:
            # Convert each row (tuple) to a dictionary
            summary.append({'project_number': row[0], 'total_hours': row[1]})
        print(f"Work summary retrieved: {len(summary)} projects.")
        return summary
    except sqlite3.Error as e:
        print(f"Error retrieving work summary: {e}")
        return None # Indicate error
    finally:
        conn.close()
