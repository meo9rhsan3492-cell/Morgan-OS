#!/usr/bin/env python3
"""
Fix app_fixed.js structure by extracting nested functions to global scope.
The issue: Many functions are nested inside updateDashboard() -> if (expos.length > 0) block.
"""

import re

def fix_structure():
    with open('app_fixed.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the problematic section: functions defined after line ~475
    # We need to close the if block and updateDashboard function before these utility functions
    
    # Pattern to find where the forEach ends and utility functions start
    # Looking for: });  followed by // ... comment about Data Backup
    
    # First, let's find and fix the structure
    # The fix: Insert closing braces before the utility functions section
    
    # Find the marker: "// 7. Data Backup & Resume"
    marker = "// ==========================================\n            // 7. Data Backup & Resume (Robust)"
    
    if marker in content:
        # Split at marker
        parts = content.split(marker, 1)
        
        # Before marker, we need to close:
        # 1. The forEach loop (already closed with });)
        # 2. The if (expos.length > 0) block
        # 3. The else block for expos
        # 4. The updateDashboard function
        
        # Insert proper closing before marker
        fix = """        } else {
            // No expos yet
            document.getElementById('dash-expo-name').innerText = '暂无展会';
            document.getElementById('dash-expo-countdown').innerText = '--';
        }
    }
}

// ==========================================
// 7. Data Backup & Resume (Robust)"""
        
        fixed_content = parts[0].rstrip() + "\n" + fix + parts[1].lstrip()
        
        # Now we need to outdent all the utility functions (they were too deeply nested)
        # Remove excess indentation from the utility functions section
        lines = fixed_content.split('\n')
        new_lines = []
        in_utility_section = False
        
        for line in lines:
            if "// 7. Data Backup & Resume" in line:
                in_utility_section = True
            
            if in_utility_section and line.startswith('            '):
                # Remove 12 spaces of indentation (3 levels -> 0 levels)
                new_lines.append(line[12:])
            else:
                new_lines.append(line)
        
        fixed_content = '\n'.join(new_lines)
        
        with open('app_fixed_v2.js', 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        
        print("Created app_fixed_v2.js with structure fixes")
        return True
    else:
        print("Marker not found, trying alternative approach")
        return False

if __name__ == '__main__':
    fix_structure()
