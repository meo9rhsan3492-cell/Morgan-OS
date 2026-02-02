import os

def fix_encoding():
    file_path = 'app.js'
    try:
        # Try reading as UTF-16 first (common result of PowerShell > redirection)
        with open(file_path, 'r', encoding='utf-16') as f:
            content = f.read()
    except UnicodeDecodeError:
        try:
            # Try UTF-8
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
             # Fallback to binary and simple decode or utf-16-le
             with open(file_path, 'r', encoding='utf-16-le') as f:
                content = f.read()

    # Write back as clean UTF-8
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Successfully converted {file_path} to UTF-8")

if __name__ == '__main__':
    fix_encoding()
