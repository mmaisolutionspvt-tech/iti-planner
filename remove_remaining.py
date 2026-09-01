import re
import os

def replace_in_file(filepath, pattern, replacement):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = re.sub(pattern, replacement, content)
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

# 1. backend/server.js
replace_in_file(
    r'C:\Users\HP\OneDrive\Desktop\flight_repo\firstflight-travels\backend\server.js',
    r"const token = process\.env\.WASENDER_API_KEY \|\| '6e388b8a96f6bea7f714d930f211fea7554038bbcc45727bc228c4e9a314c276';",
    "const token = process.env.WASENDER_API_KEY || '';"
)

# 2. backend/services/weatherAlertCron.js
replace_in_file(
    r'C:\Users\HP\OneDrive\Desktop\flight_repo\firstflight-travels\backend\services\weatherAlertCron.js',
    r"const token = process\.env\.WASENDER_API_KEY \|\| '6e388b8a96f6bea7f714d930f211fea7554038bbcc45727bc228c4e9a314c276';",
    "const token = process.env.WASENDER_API_KEY || '';"
)

# 3. n8n_production_workflow.md
replace_in_file(
    r'C:\Users\HP\OneDrive\Desktop\flight_repo\firstflight-travels\n8n_production_workflow.md',
    r"WASENDER_API_KEY=6e388b8a96f6bea7f714d930f211fea7554038bbcc45727bc228c4e9a314c276",
    "WASENDER_API_KEY=your_wasender_api_key"
)

# 4. react-app/src/components/global/LoginModal.jsx
replace_in_file(
    r'C:\Users\HP\OneDrive\Desktop\flight_repo\firstflight-travels\react-app\src\components\global\LoginModal.jsx',
    r"password: 'hubble123',",
    "password: '',"
)

