import os
import json

file_path = 'package.json'
try:
    with open(file_path, 'rb') as f:
        # Read start of file
        start_bytes = f.read(20)
        print(f"Start bytes: {start_bytes}")
        print(f"Start hex: {start_bytes.hex()}")
        
        # Read entire file and trying to decode
        f.seek(0)
        content = f.read()
        try:
            text = content.decode('utf-8')
            print("Decoded as utf-8 successfully")
            
            # Check for BOM
            if text.startswith('\ufeff'):
                print("BOM detected!")
            else:
                print("No BOM detected.")
                
            # Parse JSON
            try:
                json.loads(text)
                print("JSON parsing successful")
            except json.JSONDecodeError as e:
                print(f"JSON parsing failed: {e}")
                
        except UnicodeDecodeError:
            print("Failed to decode as utf-8")
            
except FileNotFoundError:
    print(f"{file_path} not found")

# Check for other config files
potential_configs = [
    'postcss.config.js',
    '.postcssrc',
    '.postcssrc.js',
    '.postcssrc.json',
    'postcss.config.cjs'
]

print("Checking for potential PostCSS config files:")
for config in potential_configs:
    if os.path.exists(config):
        print(f"Found: {config}")
    else:
        print(f"Not found: {config}")

# Walk to find any file with 'postcss' in name
print("Walking directory to find *postcss* files:")
for root, dirs, files in os.walk('.'):
    # skip node_modules
    if 'node_modules' in dirs:
        dirs.remove('node_modules')
    
    for file in files:
        if 'postcss' in file.lower():
            print(f"Found in walk: {os.path.join(root, file)}")
