#!/usr/bin/env python3
"""
Complete restructuring of app_fixed.js
This script will:
1. Extract all nested functions to global scope
2. Fix the updateDashboard function structure
3. Clean up the code organization
"""

def restructure_app():
    with open('app_fixed.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Step 1: Find updateDashboard function and its proper end
    # The function should only update dashboard UI, not define other functions
    
    # Find line numbers for key markers
    lines = content.split('\n')
    
    # Find where updateDashboard starts
    update_dashboard_start = None
    for i, line in enumerate(lines):
        if 'function updateDashboard()' in line:
            update_dashboard_start = i
            break
    
    if update_dashboard_start is None:
        print("Could not find updateDashboard function")
        return
    
    print(f"updateDashboard starts at line {update_dashboard_start + 1}")
    
    # Find the forEach end (line with just });
    forEach_end = None
    for i in range(update_dashboard_start, len(lines)):
        if lines[i].strip() == '});' and forEach_end is None:
            forEach_end = i
            break
    
    print(f"forEach ends at line {forEach_end + 1 if forEach_end else 'NOT FOUND'}")
    
    # Find where utility functions start (marked by "// 7. Data Backup")
    utility_start = None
    for i, line in enumerate(lines):
        if '// 7. Data Backup' in line:
            utility_start = i
            break
    
    print(f"Utility functions start at line {utility_start + 1 if utility_start else 'NOT FOUND'}")
    
    # The fix: Close updateDashboard properly after the forEach, then extract utility functions
    if forEach_end and utility_start:
        # Build new content
        new_lines = []
        
        # Add everything up to and including forEach end
        for i in range(forEach_end + 1):
            new_lines.append(lines[i])
        
        # Close the if (expos.length > 0) block
        new_lines.append("        } else {")
        new_lines.append("            // No expos")
        new_lines.append("            dashExpoName.innerText = '暂无展会';")
        new_lines.append("        }")
        new_lines.append("    }")
        new_lines.append("}")
        new_lines.append("")
        
        # Now add the utility functions (from utility_start onwards)
        # But outdent them since they were nested too deep
        for i in range(utility_start, len(lines)):
            line = lines[i]
            # Remove 12 spaces of indentation (3 levels)
            if line.startswith('            '):
                new_lines.append(line[12:])
            else:
                new_lines.append(line)
        
        # Write to new file
        new_content = '\n'.join(new_lines)
        
        with open('app_restructured.js', 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print("Created app_restructured.js")
        return True
    
    return False

if __name__ == '__main__':
    restructure_app()
