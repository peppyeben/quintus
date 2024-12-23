import axios from "axios";
import cheerio from "cheerio";
import { SEARCH_RESULTS } from "../utils/search-results";

// Add a delay function to prevent overwhelming the API
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getHTML(url: string) {
    const { data: html } = await axios.get(url);
    return html;
}

async function getLinks(url: string) {
    const html = await getHTML(url);
    const $ = cheerio.load(html);
    const links = $("a")
        .map((i, elem) => $(elem).attr("href"))
        .get();
    return links;
}

// getHTML("https://www.bbc.com/news/articles/cqjz04lv5q9o")
//     .then(console.log)
//     .catch(console.error);

SEARCH_RESULTS.forEach((result) => {
    getLinks(result.link).then(console.log).catch(console.error);
});

// getLinks("https://www.bbc.com/news/articles/cqjz04lv5q9o")
//     .then(console.log)
//     .catch(console.error);
