import os
import shutil
import glob

# Configuration
SOURCE_DIR = os.getcwd()
DEPLOY_DIR = os.path.join(SOURCE_DIR, 'deploy')

# File patterns to copy
PATTERNS = [
    'index.html',
    'app.js',
    'app_part_*.js',
    'ui-fix.css'
]

def prepare_deployment():
    # 1. Create clean deploy directory
    if os.path.exists(DEPLOY_DIR):
        print(f"Cleaning existing deploy directory: {DEPLOY_DIR}")
        shutil.rmtree(DEPLOY_DIR)
    
    os.makedirs(DEPLOY_DIR)
    print(f"Created deploy directory: {DEPLOY_DIR}")

    # 2. Copy files
    count = 0
    for pattern in PATTERNS:
        # Use glob to find files matching pattern
        files = glob.glob(os.path.join(SOURCE_DIR, pattern))
        for file_path in files:
            file_name = os.path.basename(file_path)
            dest_path = os.path.join(DEPLOY_DIR, file_name)
            
            shutil.copy2(file_path, dest_path)
            print(f"Copied: {file_name}")
            count += 1
            
    # 3. Create vercel.json
    vercel_config = '''{
  "name": "morgan-marketing-os",
  "version": 2,
  "builds": [
    { "src": "index.html", "use": "@vercel/static" }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}'''
    
    with open(os.path.join(DEPLOY_DIR, 'vercel.json'), 'w', encoding='utf-8') as f:
        f.write(vercel_config)
    print("Created: vercel.json")

    print(f"\nSuccess! {count} files prepared in '{DEPLOY_DIR}'")
    print("Ready for deployment.")

if __name__ == "__main__":
    prepare_deployment()
