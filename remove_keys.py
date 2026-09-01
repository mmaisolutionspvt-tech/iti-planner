import re
import os

files_to_patch = [
    r'C:\Users\HP\OneDrive\Desktop\flight_repo\firstflight-travels\react-app\src\components\planner\ItineraryRouteMap.jsx',
    r'C:\Users\HP\OneDrive\Desktop\flight_repo\firstflight-travels\react-app\src\components\planner\LiveRouteModal.jsx',
    r'C:\Users\HP\OneDrive\Desktop\flight_repo\firstflight-travels\react-app\src\components\planner\Step1Places.jsx'
]

for fp in files_to_patch:
    if not os.path.exists(fp):
        continue
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace static map key
    content = re.sub(r'const STATIC_MAPS_KEY = "AIza[^"]+";', 'const STATIC_MAPS_KEY = import.meta.env.VITE_GOOGLE_PLACES_KEY || "";', content)
    
    # Replace places key inside URL
    content = re.sub(r'key=AIzaSyCgdgLi9zo0f4I8U3oKee9agodqkoBy2cI', r'key=${import.meta.env.VITE_GOOGLE_PLACES_KEY || ""}', content)

    with open(fp, 'w', encoding='utf-8') as f:
        f.write(content)

print("Replaced keys.")
