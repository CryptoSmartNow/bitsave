import sys

with open('full.patch', 'r') as f:
    lines = f.readlines()

out = []
i = 0
while i < len(lines):
    if lines[i].startswith('diff --git'):
        header = []
        while i < len(lines) and not lines[i].startswith('@@ '):
            header.append(lines[i])
            i += 1
        
        hunks = []
        while i < len(lines) and not lines[i].startswith('diff --git'):
            hunk_lines = [lines[i]]
            i += 1
            while i < len(lines) and not (lines[i].startswith('@@ ') or lines[i].startswith('diff --git')):
                hunk_lines.append(lines[i])
                i += 1
            
            # Keep hunk if it ADDS the avalanche-logo.svg and is small
            has_addition = any(l.startswith('+') and 'avalanche-logo.svg' in l for l in hunk_lines)
            if has_addition and len(hunk_lines) < 50:
                hunks.append(hunk_lines)
        
        if hunks:
            out.extend(header)
            for hunk in hunks:
                out.extend(hunk)
    else:
        i += 1

with open('avalanche.patch', 'w') as f:
    f.writelines(out)

print("".join(out))
