# Sales Planning Project V1 - [CLIENT_COMPANY] Cloud Analysis System

## 📁 Project Structure

### 00_Documentation/
- **Project_Notes/** - Meeting notes, workflows, API guides
- **Feedback/** - Customer feedback files
- **Agent_System/** - Agent system documentation

### 01_Company_Analyses/
- **Norgine [CLIENT] Analysis/** - Example company analysis with 5 required files
- Future company analyses will be added here

### 02_Database_System/
- **Scripts/** - Python scripts for database operations
  - `framework_database.py` - Core database handler
  - `load_framework_to_db.py` - Load analyses to database
  - `query_analyses.py` - Query interface
  - `find_themes.py` - Cross-company theme analyzer
  - `create_html_report.py` - Generate HTML reports
- **Data/** - Database files and outputs
  - `company_analyses.db` - Main SQLite database
  - Reports and exports
- **Documentation/** - Database usage guides

### 03_Agent_Configuration/
- **Guidelines/** - Agent behavior guidelines
- **Automation/** - Automation scripts
- **Schemas/** - JSON schemas for data validation

### Special Files (Root Directory)
- **CLAUDE.md** - MUST stay in root for VS Code auto-loading
- **.claude/** - Agent definitions (DO NOT MOVE)
- **.vscode/** - VS Code configuration

## 🚀 Quick Start

### For Analysts (Running Company Analyses)
1. Use agents to analyze companies
2. Ensure 5 files are created (including JSON)
3. Database auto-loads via scripts

### For Viewers (Accessing Database)
1. See `02_Database_System/Documentation/SIMPLE_SHARING_INSTRUCTIONS.txt`
2. Use DB Browser for SQLite
3. Access via Google Drive sharing

## 🔧 Key Scripts

### Database Operations
```bash
# Load new analysis
python3 02_Database_System/Scripts/load_framework_to_db.py [json_file]

# Query database
python3 02_Database_System/Scripts/query_analyses.py --list-by-score

# Generate HTML report
python3 02_Database_System/Scripts/create_html_report.py
```

### Automation
```bash
# Auto-load all analyses
./02_Database_System/Scripts/auto_load_to_db.sh
```

## 📊 Database Access
- Database location: `02_Database_System/Data/company_analyses.db`
- View with DB Browser for SQLite
- Share via Google Drive for team access

## ⚠️ Important Notes
- CLAUDE.md must remain in root directory
- .claude folder contains agent definitions - do not modify
- All company analyses must follow the 5-file structure
- Database auto-loads JSON files after analysis

## 🤝 Team Collaboration
See `SIMPLE_SHARING_INSTRUCTIONS.txt` for setting up team access to the database.