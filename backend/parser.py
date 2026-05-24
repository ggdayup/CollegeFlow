import re
from bs4 import BeautifulSoup

def prune_html(html_content: str) -> str:
    """
    Extracts semantic text from raw HTML content by focusing on core regions
    (<main>, <article>, .content, .catalog-curriculum) and stripping
    noisy and non-semantic DOM trees like scripts, styles, navigations, header/footers.
    Reduces token footprint significantly.
    """
    if not html_content:
        return ""
        
    soup = BeautifulSoup(html_content, "lxml")
    
    # 1. Strip completely non-semantic and noise tags
    noise_tags = [
        "script", "style", "noscript", "iframe", "svg", "img", "picture", 
        "video", "audio", "embed", "object", "form", "button", "input", 
        "select", "textarea", "head", "meta", "link", "canvas", "map"
    ]
    for tag in soup(noise_tags):
        tag.decompose()
        
    # 2. Strip navigation and layout wrappers that are usually repeated
    nav_and_layout_tags = [
        "nav", "header", "footer", "aside", "menu", "dialog"
    ]
    for tag in soup(nav_and_layout_tags):
        tag.decompose()
        
    # 3. Strip structural element matches by standard class / ID noise patterns (e.g. sidebar, footer, menu)
    noise_classes_ids = re.compile(
        r"(sidebar|header|footer|menu|nav|navbar|search|banner|breadcrumbs|widget|ad-|ads-|social|share|comments)", 
        re.IGNORECASE
    )
    for tag in soup.find_all(attrs={"class": noise_classes_ids}):
        tag.decompose()
    for tag in soup.find_all(attrs={"id": noise_classes_ids}):
        tag.decompose()

    # 4. Search for core target container tags or fallback to body/soup
    semantic_containers = []
    
    # Try high-priority semantic tags
    for tag in ["main", "article"]:
        found = soup.find_all(tag)
        if found:
            semantic_containers.extend(found)
            
    # Try high-priority classes
    class_targets = ["content", "catalog-curriculum", "curriculum", "courses", "requirements"]
    for target in class_targets:
        found = soup.find_all(class_=re.compile(rf".*{target}.*", re.IGNORECASE))
        if found:
            semantic_containers.extend(found)
            
    # If semantic containers found, extract content from them
    if semantic_containers:
        # Combine texts from all unique found containers
        seen_texts = set()
        clean_chunks = []
        for container in semantic_containers:
            text = container.get_text(separator="\n", strip=True)
            if text and text not in seen_texts:
                seen_texts.add(text)
                clean_chunks.append(text)
        clean_text = "\n\n".join(clean_chunks)
    else:
        # Fallback to body or standard soup
        body = soup.find("body")
        if body:
            clean_text = body.get_text(separator="\n", strip=True)
        else:
            clean_text = soup.get_text(separator="\n", strip=True)
            
    # 5. Clean up excessive whitespaces and lines
    lines = [line.strip() for line in clean_text.splitlines()]
    # Remove empty lines and duplicates if they are adjacent or redundant
    cleaned_lines = []
    for line in lines:
        if line:
            # Simple deduplication of consecutive identical lines
            if not cleaned_lines or cleaned_lines[-1] != line:
                cleaned_lines.append(line)
                
    return "\n".join(cleaned_lines)
