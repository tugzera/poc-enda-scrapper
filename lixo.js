const puppeteer = require("puppeteer");
const fs = require("fs");
const axios = require("axios");

// const main = async () => {
//   const baseUrl = "https://frdaguidelines.org/table-of-contents/";
//   const browser = await puppeteer.launch({
//     headless: "new",
//   });
//   const page = await browser.newPage();
//   await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
//   const chapters = await page.$$("details");
//   for (const chapterElement of chapters) {
//     const chapterTitle = await chapterElement.$eval("summary", (summary) =>
//       summary.textContent.trim()
//     );
//     console.log(`${chapterTitle}`);
//     const topics = await chapterElement.$$eval(
//       'a[href*="/"]',
//       (topicElements) => {
//         return topicElements.map((topicElement) => {
//           const topicTitle = topicElement.textContent.trim();
//           const topicLink = topicElement.getAttribute("href");
//           return { topicTitle, topicLink };
//         });
//       }
//     );
//     topics.forEach(({ topicTitle, topicLink }) => {
//       if (!topicTitle.includes("Chapter Overview")) {
//         console.log(topicTitle, topicLink);
//       }
//     });
//     console.log("\n");
//   }
//   await browser.close();
// };

const handleTopics = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  try {
    const topics = [
      {
        topicLink: "https://frdaguidelines.org/3-1/",
        topicTitle: "Topic 1.1 Clinical features of Friedreich ataxia",
      },
    ];
    for (const { topicLink, topicTitle } of topics) {
      if (!topicTitle.includes("Chapter Overview")) {
        // const content = await axios.default.get(topicLink);
        // await page.setContent(content.data);
        await page.goto(topicLink, { waitUntil: "networkidle2" });
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
        fs.writeFileSync(`./topics/${topicTitle}.html`, htmlContent);
        fs.writeFileSync(`./topics/${topicTitle}.txt`, textContent);
        await page.close();
        // await sleep();
        fs.writeFileSync("test.html", htmlContent);
        fs.writeFileSync("test.txt", textContent);
      }
    }
  } catch (error) {
    console.log(error);
  } finally {
    await page.close(); // Close the page after processing each topic
  }
};

handleTopics();
