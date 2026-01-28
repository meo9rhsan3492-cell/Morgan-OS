import os

path = 'C:/Users/33589/.gemini/antigravity/scratch/tds_marketing_os/app.js'

try:
    with open(path, 'rb') as f:
        content = f.read().decode('utf-8', errors='ignore')

    # Remove renderRadar
    # We will look for the signature start and the function end.
    start_radar = "function renderRadar() {"
    # Just simple replace for the blocks we identified. 
    # Since we have the extracted code in previous steps, we know roughly what to look for.
    # CAUTION: app.js formatting might vary slightly, so we should be careful.
    
    # Strategy: Read the file line by line and skip the ranges we want to delete.
    lines = content.splitlines()
    new_lines = []
    skip = False
    
    for line in lines:
        if "function renderRadar() {" in line:
            skip = True
            print("Skipping renderRadar...")
        
        if skip and line.strip() == "}":
             if "renderRadar" in start_radar or "runReverseCalc" in start_radar: 
                 # This logic is flawed for nested braces. 
                 # Better approach: Use known line ranges or exact string match replacement if possible.
                 pass

    # Better Strategy: String replacement of the known block.
    # We viewed the file content in previous steps.
    
    # 1. Razor cut for Radar
    # Start: function renderRadar() {
    # End: zones.forEach...
    # ...
    # }
    
    # Let's try to match the exact block via Regex or just read->find->slice.
    
    # Radar Block
    radar_start = content.find("function renderRadar() {")
    if radar_start != -1:
        # Find the closing brace. This function has minimal nesting.
        # It ends before "function updateDashboard() {" usually.
        radar_end_marker = "function updateDashboard() {"
        radar_end = content.find(radar_end_marker)
        if radar_end != -1:
            print(f"Removing Radar code from {radar_start} to {radar_end}")
            content = content[:radar_start] + "\n// [Moved to app_part_radar.js]\n" + content[radar_end:]
        else:
            print("Could not find end of Radar block")
            
    # Calculator Block
    # Starts at: // 15. Export Price Calculator (5-Layer)
    # Ends at: // ----------------------------------------
    #          // 17. Local RAG Knowledge Base
    
    calc_start_marker = "// 15. Export Price Calculator (5-Layer)"
    calc_end_marker = "// 17. Local RAG Knowledge Base"
    
    calc_start = content.find(calc_start_marker)
    calc_end = content.find(calc_end_marker)
    
    if calc_start != -1 and calc_end != -1:
        # Backtrack to include the header
        calc_start_header = content.rfind("// ----------------------------------------", 0, calc_start)
        if calc_start_header != -1:
             calc_start = calc_start_header
        
        print(f"Removing Calc code from {calc_start} to {calc_end}")
        content = content[:calc_start] + "\n// [Moved to app_part_calc.js]\n// ----------------------------------------\n" + content[calc_end:]
    else:
        print("Could not find Calc block markers")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("app.js cleaned.")

except Exception as e:
    print(f"Error: {e}")
