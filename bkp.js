const puppeteer = require("puppeteer");
const axios = require("axios");
const fs = require("fs");

const blackList = [
  "https://frdaguidelines.org/3-1/",
  "https://frdaguidelines.org/11-1/",
  "https://frdaguidelines.org/11-2/",
  "https://frdaguidelines.org/11-3/",
  "https://frdaguidelines.org/11-4/",
  "https://frdaguidelines.org/11-5/",
  "https://frdaguidelines.org/11-6/",
  "https://frdaguidelines.org/12-1/",
  "https://frdaguidelines.org/12-2/",
  "https://frdaguidelines.org/13-1/",
  "https://frdaguidelines.org/13-2/",
  "https://frdaguidelines.org/13-3/",
  "https://frdaguidelines.org/13-4/",
  "https://frdaguidelines.org/13-5/",
  "https://frdaguidelines.org/14-1/",
  "https://frdaguidelines.org/14-2/",
  "https://frdaguidelines.org/14-3/",
  "https://frdaguidelines.org/14-4/",
  "https://frdaguidelines.org/15-1/",
  "https://frdaguidelines.org/15-2/",
  "https://frdaguidelines.org/16-1/",
  "https://frdaguidelines.org/17-1/",
  "https://frdaguidelines.org/17-2/",
  "https://frdaguidelines.org/17-3/",
];

const main = async () => {
  const baseUrl = "https://frdaguidelines.org/table-of-contents/";
  const browser = await puppeteer.launch({
    headless: "new",
  });
  const page = await browser.newPage();
  const content = await axios.default.get(baseUrl);
  await page.setContent(content.data);
  const chapters = await page.$$("details");
  for (const chapterElement of chapters) {
    const chapterTitle = await chapterElement.$eval("summary", (summary) =>
      summary.textContent.trim()
    );
    console.log(`${chapterTitle}`);
    const topics = await chapterElement.$$eval(
      'a[href*="/"]',
      (topicElements) => {
        return topicElements.map((topicElement) => {
          const topicTitle = topicElement.textContent.trim();
          const topicLink = topicElement.getAttribute("href");
          return { topicTitle, topicLink };
        });
      }
    );
    for (const topic of topics) {
      const { topicLink, topicTitle } = topic;
      if (
        !topicTitle.includes("Chapter Overview") &&
        !blackList.includes(topicLink)
      ) {
        await handleTopics({ browser, topicLink, topicTitle });
      }
    }
    console.log("\n");
  }
  await browser.close();
};

const handleTopics = async ({ topicLink, topicTitle, browser }) => {
  const page = await browser.newPage();
  try {
    const content = await axios.default.get(topicLink);
    await page.setContent(content.data);
    console.log(topicTitle, topicLink);
    await page.waitForSelector(
      '.su-tabs-pane[data-title="<strong>Full Text</strong>"]',
      {
        timeout: 10000,
      }
    );
    const { htmlContent, textContent } = await page.evaluate(() => {
      const fullTextElement = document.querySelector(
        '.su-tabs-pane[data-title="<strong>Full Text</strong>"]'
      );
      const clonedElement = fullTextElement.cloneNode(true);
      const pElements = clonedElement.querySelectorAll("p");
      pElements.forEach((pElement) => {
        if (pElement.querySelector("em")) {
          pElement.innerHTML = "";
        }
      });
      const detailsElements = clonedElement.querySelectorAll("details");
      detailsElements.forEach((detailsElement) => {
        detailsElement.innerHTML = "";
      });
      const htmlContent = clonedElement.innerHTML
        .replaceAll("<p></p>", "")
        .replaceAll("<details></details>", "");
      return {
        htmlContent,
        textContent: clonedElement.textContent.trim(),
      };
    });
    const fileName = topicTitle.replace("/", " ");
    fs.writeFileSync(`./topics/${fileName}.html`, htmlContent);
    fs.writeFileSync(`./topics/${fileName}.txt`, textContent);
    // await sleep();
  } catch (error) {
    console.log(error);
  } finally {
    await page.close();
  }
};

main();
