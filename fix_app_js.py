import os

path = 'C:/Users/33589/.gemini/antigravity/scratch/tds_marketing_os/app.js'

try:
    with open(path, 'rb') as f:
        # Read as binary to avoid encoding errors initially
        content_bytes = f.read()

    # Decode with error replacement to handle corruption
    content = content_bytes.decode('utf-8', errors='replace')

    # 1. Truncate Standby Mode sections
    split_marker = '// 13. Exhibition Standby Mode'
    idx = content.find(split_marker)
    if idx != -1:
        print(f"Found split marker at index {idx}. Truncating.")
        content = content[:idx]
    else:
        print("Split marker not found. Inspecting file content...")
        # Fallback: look for the function definition if comment is missing/corrupt
        func_idx = content.find("function toggleStandbyMode")
        if func_idx != -1:
             # Go back a bit to try to find the comment or just cut there
             content = content[:func_idx]
             print(f"Truncated at function definition index {func_idx}")

    # 2. Fix corrupted Toast messages causing syntax errors or UI bugs
    # We use vague matching because the specific corrupted chars might vary
    # Strategy: Replace the entire function block logic or specific lines if identifiable
    
    # Replacing the corrupt 'copyReply' toast
    # Looking for: showToast('...correct pattern or corrupt pattern...', 'success');
    # The corrupt pattern was roughly: showToast(' ?   0 ''?', 'success');
    
    # We will simply look for the call inside copyReply
    if "function copyReply() {" in content:
        print("Fixing copyReply...")
        # Regex or simple string replacement might be risky with corruption. 
        # Let's replace the common corrupted sequences identified in the tail output.
        # "showToast(' ?   0 ''?', 'success');"
        
        # We will try to replace the known corrupt fragments
        content = content.replace("showToast(' ?   0 ''?', 'success');", "showToast('内容已复制', 'success');")
        content = content.replace("showToast(': ~  ??0 \"  x  ?', 'success');", "showToast('草稿已生成', 'success');")
        content = content.replace("draftArea.value = '  x  ? 'R _! ?_\" a   ';", "draftArea.value = '生成失败，请重试';")
        
        # Also clean up any trailing garbage from previous appends
        content = content.strip()

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print("app.js cleaned and saved.")

except Exception as e:
    print(f"Error: {e}")
