import { SEARCH_RESULTS } from "../utils/search-results";
import axios from "axios";
import cheerio from "cheerio";
import { extract } from "article-parser";

async function extractArticleContent(url: string) {
    try {
        // Comprehensive domain-specific selectors
        const contentSelectors: Record<string, string[]> = {
            "bbc.com": [
                "article .article-body",
                ".story-body__inner",
                ".content__article-body",
                "div[data-component='text-block']",
            ],
            "reuters.com": [
                ".article-body__content",
                'div[data-testid="ArticleBody-2"]',
                ".body__content",
                ".text__text",
            ],
            "nytimes.com": [
                ".article-body",
                ".StoryBodyCompanionColumn",
                ".css-1uqfvh0 .css-53u6y8",
                ".meteredContent",
            ],
            "cnbc.com": [
                ".ArticleBody-articleBody",
                ".group",
                ".Article",
                ".RenderKeyPoints-list",
            ],
            "bloomberg.com": [
                ".body-content",
                ".article-body",
                ".body__copy",
                ".paywall-article",
            ],
            "ft.com": [
                ".article__content",
                ".content",
                ".article-body",
                ".o-typography-body",
            ],
            "fortune.com": [
                ".article-body",
                ".content",
                ".article-content",
                ".main-content",
            ],
            "marketwatch.com": [
                ".article__body",
                ".column",
                ".content__body",
                ".article-wrap",
            ],
            "wsj.com": [
                ".article__body",
                ".paywall",
                ".wsj-article-body",
                ".article-wrap",
            ],
        };

        // Try article-parser first
        try {
            const article = await extract(url);
            if (article && article.content && article.content.length > 100) {
                return article.content;
            }
        } catch {}

        // Fetch page content with robust headers
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate, br",
                Connection: "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-User": "?1",
            },
            timeout: 30000, // 30-second timeout
        });

        const $ = cheerio.load(data);

        // Remove script, style, comments
        $("script, style, comment").remove();

        const domain = new URL(url).hostname;
        const matchedDomain = Object.keys(contentSelectors).find((key) =>
            domain.includes(key)
        );

        // Try domain-specific selectors
        if (matchedDomain) {
            for (let selector of contentSelectors[matchedDomain]) {
                const content = $(selector).text().trim();
                if (content.length > 100) return content;
            }
        }

        // Fallback selectors
        const generalSelectors = [
            "article",
            "main",
            ".article-body",
            ".content",
            "#main-content",
            ".post-content",
            ".entry-content",
            "body > div",
        ];

        for (let selector of generalSelectors) {
            const content = $(selector).text().trim();
            if (content.length > 100) return content;
        }

        // Extremely generic fallback
        const bodyText = $("body").text().trim();
        return bodyText.length > 100 ? bodyText : null;
    } catch (error) {
        console.error(`Content extraction failed for ${url}:`, error);
        return null;
    }
}

export async function processSearchResults(searchResults: any[]) {
    const contents = await Promise.all(
        searchResults.map(async (result) => {
            try {
                const content = await extractArticleContent(result.link);
                return content
                    ? {
                          url: result.link,
                          title: stripHtmlTags(result.title),
                          content: stripHtmlTags(content),
                      }
                    : null;
            } catch {
                return null;
            }
        })
    );

    return contents.filter((item) => item !== null);
}

function stripHtmlTags(html: string): string {
    if (!html) return "";
    // Remove HTML tags
    const strippedText = html.replace(/<[^>]*>/g, "");

    // Decode HTML entities
    const decodedText = strippedText
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'")
        .replace(/&nbsp;/g, " ");

    // Remove excessive whitespace
    return decodedText.replace(/\s+/g, " ").trim();
}

processSearchResults(SEARCH_RESULTS)
    .then((res) => {
        console.log(JSON.stringify(res, null, 2));
    })
    .catch((e) => {
        console.error(e);
    });
