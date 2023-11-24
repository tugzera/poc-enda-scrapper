const puppeteer = require("puppeteer");
const handleBlackListTopics = require("./handle-topic-black-list");
const handleTopics = require("./handle-topic");

const diffTagFormat = [
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
  await page.goto(baseUrl, {
    waitUntil: "networkidle2",
  });
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
      if (topicTitle.includes("Chapter Overview")) continue;
      const isBlackList = diffTagFormat.includes(topicLink);
      if (isBlackList) {
        await handleBlackListTopics({ topicLink, topicTitle, browser });
      } else {
        await handleTopics({ topicLink, topicTitle, browser });
      }
    }
    console.log("\n");
  }
  await browser.close();
};

main();
