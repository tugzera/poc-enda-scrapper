const fs = require("fs");

module.exports = handleBlackListTopics = async ({
  topicLink,
  topicTitle,
  browser,
}) => {
  const page = await browser.newPage();
  try {
    console.log(topicTitle, topicLink);
    await page.goto(topicLink, {
      waitUntil: "networkidle2",
    });
    // Extract the content from the specified tab
    const { htmlContent, textContent } = await page.evaluate(() => {
      const fullTextElement = document.querySelector(
        ".su-tabs-pane.su-u-clearfix.su-u-trim.su-tabs-pane-open"
      );
      if (!fullTextElement) throw new Error("Tab not found");
      // Remove content within <p><em> and <details> tags
      const elementsToRemove = fullTextElement.querySelectorAll(
        'p em, details, p > strong > a[href="#rec"], p > strong > a[href="#bps"], p > strong > a[href="#lay"]'
      );
      elementsToRemove.forEach((el) => {
        // Remove the entire <p> parent for the specific <a> tags
        if (el.tagName === "A") {
          el.parentElement.parentElement.remove();
        } else {
          el.remove();
        }
      });
      const htmlContent = fullTextElement.innerHTML
        .replaceAll("<p></p>", "")
        .replaceAll("<details></details>", "");
      return {
        htmlContent,
        textContent: fullTextElement.textContent.trim(),
      };
    });
    const fileName = topicTitle.replace("/", " ");
    fs.writeFileSync(`./topics/${fileName}.html`, htmlContent);
    // fs.writeFileSync(`./topics/${fileName}.txt`, textContent);
  } catch (error) {
    console.log("ERROR", error);
  } finally {
    await page.close();
  }
};
