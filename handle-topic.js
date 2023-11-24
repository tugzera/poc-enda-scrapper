const fs = require("fs");

module.exports = handleTopics = async ({ topicLink, topicTitle, browser }) => {
  const page = await browser.newPage();
  try {
    console.log(topicTitle, topicLink);
    await page.goto(topicLink, {
      waitUntil: "networkidle2",
    });
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
      if (!fullTextElement) throw new Error("Full text element not found");
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
    // fs.writeFileSync(`./topics/${fileName}.txt`, textContent);
  } catch (error) {
    console.log(error);
  } finally {
    await page.close();
  }
};
