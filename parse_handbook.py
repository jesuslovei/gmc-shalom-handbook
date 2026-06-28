import re
import json
import os

def extract_script_data(html_content):
    # Find the script block
    script_match = re.search(r'<script type="text/x-dc" data-dc-script>(.*?)</script>', html_content, re.DOTALL)
    if not script_match:
        return None
    
    script_text = script_match.group(1)
    
    # Extract qtDays array
    # We look for const qtDays = [ ... ];
    qt_days_match = re.search(r'const qtDays = \[(.*?)\];\s*return', script_text, re.DOTALL)
    qt_days = []
    if qt_days_match:
        qt_days_raw = qt_days_match.group(1)
        # Parse individual objects in the array
        # e.g., { date: '6/30 (화)', ref: '...', passage: '...' }
        # Let's extract each object using regex
        obj_matches = re.findall(r'\{\s*date:\s*\'([^\']+)\',\s*ref:\s*\'([^\']+)\',\s*passage:\s*\'([^\']+)\'\s*\}', qt_days_raw)
        for date, ref, passage in obj_matches:
            # Clean passage text
            passage = passage.replace('\\n', '\n')
            qt_days.append({
                'date': date,
                'ref': ref,
                'passage': passage
            })
            
    return {
        'qtDays': qt_days
    }

def extract_static_sections(html_content):
    # Find all divs with data-page attribute
    # Since BeautifulSoup is not guaranteed, we can use regex to extract the outer divs
    # of the pages. Let's find matches for: <div data-page ...> ... </div>
    # A robust way is to find the opening tags and search for their matching closing tag.
    pages = []
    
    # Simple regex to find data-page blocks
    # We find '<div data-page' and search until we hit the next page div or the end of x-dc
    div_starts = [m.start() for m in re.finditer(r'<div\s+[^>]*data-page', html_content)]
    
    # Also find where x-dc ends
    xdc_end = html_content.find('</x-dc>')
    if xdc_end == -1:
        xdc_end = len(html_content)
        
    boundaries = div_starts + [xdc_end]
    
    for i in range(len(div_starts)):
        start = boundaries[i]
        end = boundaries[i+1]
        chunk = html_content[start:end]
        
        # Parse the data-page attribute and screen-label
        tag_match = re.match(r'<div\s+([^>]*data-page[^>]*)>', chunk)
        if not tag_match:
            continue
        
        attrs_str = tag_match.group(1)
        
        # Extract page type/label/section
        page_val = ""
        page_m = re.search(r'data-page="([^"]+)"', attrs_str)
        if page_m:
            page_val = page_m.group(1)
            
        label_val = ""
        label_m = re.search(r'data-screen-label="([^"]+)"', attrs_str)
        if label_m:
            label_val = label_m.group(1)
            
        section_val = ""
        sec_m = re.search(r'data-section="([^"]+)"', attrs_str)
        if sec_m:
            section_val = sec_m.group(1)
            
        # We want the content inside this div. Since the div closes at the end of the page print box,
        # we find the last </div> before the end of the chunk.
        # Let's find all </div> in the chunk and take the last one or match it.
        # The page structure is typically: <div data-page ...> [inner html] </div> (at the very end of chunk)
        # We can find the last </div> in the chunk
        last_div_idx = chunk.rfind('</div>')
        if last_div_idx != -1:
            inner_html = chunk[tag_match.end():last_div_idx].strip()
        else:
            inner_html = chunk[tag_match.end():].strip()
            
        # Clean pageno placeholder if any
        inner_html = re.sub(r'<div\s+data-pageno[^>]*>.*?</div>', '', inner_html, flags=re.DOTALL)
        
        # Clean inline widths/heights that lock it to page printing so they become responsive
        # E.g., style="width:8.5in; height:11in; ... font-size:14.5px" -> we want to keep styling except the layout boundaries
        # Actually we will handle layout styling in CSS, but let's clean up absolute heights/widths on child divs if needed.
        
        pages.append({
            'page': page_val,
            'label': label_val,
            'section': section_val,
            'html': inner_html
        })
        
    return pages

def main():
    ko_path = '샬롬 핸드북 (한🇬🇧판).dc.html' # Wait, let's get the exact filename
    # Let's list files in current directory to match name
    files = os.listdir('.')
    ko_file = None
    en_file = None
    for f in files:
        if f.endswith('.dc.html') and 'print' not in f and 'Canvas' not in f:
            if 'English' in f:
                en_file = f
            else:
                ko_file = f
                
    print(f"Korean File found: {ko_file}")
    print(f"English File found: {en_file}")
    
    if not ko_file or not en_file:
        print("Error: Could not locate handbook files.")
        return

    with open(ko_file, 'r', encoding='utf-8') as f:
        ko_html = f.read()
        
    with open(en_file, 'r', encoding='utf-8') as f:
        en_html = f.read()
        
    ko_data = extract_script_data(ko_html)
    en_data = extract_script_data(en_html)
    
    ko_pages = extract_static_sections(ko_html)
    en_pages = extract_static_sections(en_html)
    
    # Save as src/data/handbook.js
    output_js = f"""// Structured handbook data compiled from HTML templates.
// This is automatically generated by parse_handbook.py.

export const handbookData = {{
  ko: {{
    qtDays: {json.dumps(ko_data['qtDays'] if ko_data else [], ensure_ascii=False, indent=2)},
    pages: {json.dumps(ko_pages, ensure_ascii=False, indent=2)}
  }},
  en: {{
    qtDays: {json.dumps(en_data['qtDays'] if en_data else [], ensure_ascii=False, indent=2)},
    pages: {json.dumps(en_pages, ensure_ascii=False, indent=2)}
  }}
}};
"""
    
    os.makedirs('src/data', exist_ok=True)
    with open('src/data/handbook.js', 'w', encoding='utf-8') as f:
        f.write(output_js)
        
    print("Successfully parsed handbook files and wrote src/data/handbook.js!")

if __name__ == '__main__':
    main()
