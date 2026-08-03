with open('components/ENSLinking.tsx', 'r') as f:
    content = f.read()

# Replace Activity01Icon with Link01Icon globally in this file
content = content.replace('Activity01Icon', 'Link01Icon')

with open('components/ENSLinking.tsx', 'w') as f:
    f.write(content)

print("Icon updated to Link01Icon in ENSLinking.")
