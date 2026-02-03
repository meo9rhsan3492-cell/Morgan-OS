#!/usr/bin/env python3
# Check JavaScript syntax for bracket matching

def analyze_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    open_braces = content.count('{')
    close_braces = content.count('}')
    open_parens = content.count('(')
    close_parens = content.count(')')
    open_brackets = content.count('[')
    close_brackets = content.count(']')
    
    print(f"File: {filename}")
    print(f"  Braces {{ }}: Open={open_braces}, Close={close_braces}, Diff={open_braces - close_braces}")
    print(f"  Parens ( ): Open={open_parens}, Close={close_parens}, Diff={open_parens - close_parens}")
    print(f"  Brackets [ ]: Open={open_brackets}, Close={close_brackets}, Diff={open_brackets - close_brackets}")
    
    return open_braces - close_braces

if __name__ == '__main__':
    diff = analyze_file('app_fixed.js')
    if diff > 0:
        print(f"\n⚠️ Missing {diff} closing brace(s) '}}'")
    elif diff < 0:
        print(f"\n⚠️ Missing {-diff} opening brace(s) '{{'")
    else:
        print("\n✅ Braces are balanced")
