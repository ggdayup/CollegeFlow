import scrapy
from urllib.parse import urlparse

class CatalogSpider(scrapy.Spider):
    name = "catalog_spider"

    custom_settings = {
        "ROBOTSTXT_OBEY": False,
        "USER_AGENT": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "LOG_LEVEL": "INFO",
    }

    def __init__(self, start_url=None, *args, **kwargs):
        super(CatalogSpider, self).__init__(*args, **kwargs)
        self.start_urls = [start_url] if start_url else []
        self.allowed_domains = [urlparse(start_url).netloc] if start_url else []
        
        # Track already scraped URLs to avoid duplication
        self.scraped_urls = set()

    def parse(self, response):
        # Only parse HTML responses
        if not hasattr(response, "text"):
            return

        url = response.url
        if url in self.scraped_urls:
            return
        self.scraped_urls.add(url)

        self.logger.info(f"Crawled catalog page: {url}")
        
        # Yield the current page structure and content
        yield {
            "url": url,
            "title": response.xpath("//title/text()").get(default="").strip(),
            "html": response.text
        }

        # Be extra thorough: Find internal links that look like curriculum detail pages
        # and crawl them (up to depth of 1 level to avoid crawling the whole site)
        catalog_keywords = [
            "curriculum", "courses", "requirement", "program", "degree",
            "major", "catalog", "syllabus", "undergraduate"
        ]
        
        for href in response.css("a::attr(href)").getall():
            absolute_url = response.urljoin(href)
            parsed_absolute = urlparse(absolute_url)
            parsed_start = urlparse(response.url)
            
            # Keep on the same domain and avoid non-http URLs
            if parsed_absolute.netloc == parsed_start.netloc and parsed_absolute.scheme in ["http", "https"]:
                # Filter by path keywords to ensure we only scrape highly relevant pages
                path_lower = parsed_absolute.path.lower()
                if any(kw in path_lower for kw in catalog_keywords):
                    if absolute_url not in self.scraped_urls:
                        yield response.follow(absolute_url, callback=self.parse)
