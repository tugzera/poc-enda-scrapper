const puppeteer = require("puppeteer");
const fs = require("fs");

const main = async () => {
  const baseUrl = "https://frdaguidelines.org/table-of-contents/";
  const browser = await puppeteer.launch({
    headless: "new",
  });
  const page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
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
      if (!topicTitle.includes("Chapter Overview")) {
        console.log("ENTRA?");
        await handleTopics({ browser, topicLink, topicTitle });
      }
    }
    console.log("\n");
  }
  await browser.close();
};

function sleep() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("Waited for 1 second");
    }, 1000); // 1000 milliseconds = 1 second
  });
}

const handleTopics = async ({ topicLink, topicTitle, browser }) => {
  const page = await browser.newPage();
  try {
    await page.goto(topicLink, { waitUntil: "domcontentloaded" });
    await page.waitForSelector(
      '.su-tabs-pane[data-title="<strong>Full Text</strong>"]'
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
    fs.writeFileSync(`./topics/${topicTitle}.html`, htmlContent);
    fs.writeFileSync(`./topics/${topicTitle}.txt`, textContent);
    await sleep();
  } catch (error) {
    console.log(error);
  } finally {
    await page.close();
  }
};

main();
