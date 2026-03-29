import os
import re

emoji_regex = re.compile(r'[^\x00-\x7F]+')

for root, dirs, files in os.walk('app/dashboard'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                matches = emoji_regex.findall(content)
                if matches:
                    print(f"File: {path}")
                    for m in matches:
                        print(f"  Match: {m}")
