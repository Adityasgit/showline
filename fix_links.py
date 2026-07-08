import os

html_files = [f for f in os.listdir('.') if f.endswith('.html')]

for file in html_files:
    with open(file, 'r') as f:
        content = f.read()
    
    # Fix Blog
    content = content.replace('href="#">Blog</a>', 'href="knowledge-center.html">Blog</a>')
    
    # Fix Terms & Conditions
    content = content.replace('href="#">Terms &amp; Conditions</a>', 'href="terms-conditions.html">Terms &amp; Conditions</a>')
    
    # Fix Privacy Policy if any
    content = content.replace('href="#">Privacy Policy</a>', 'href="privacy-policy.html">Privacy Policy</a>')

    with open(file, 'w') as f:
        f.write(content)

print("Replaced links in all HTML files.")
