const fs = require("fs");
const { JSDOM } = require("jsdom");

const extractContent = async (filePath) => {
  try {
    const htmlContent = fs.readFileSync(filePath, "utf8");
    const dom = new JSDOM(htmlContent, {
      resources: "usable",
      runScripts: "outside-only", // Disables the execution of scripts within the page
    });

    const document = dom.window.document;

    // Replace this with the correct selector for the "Full Text" tab content
    const fullTextSelector =
      '.su-tabs-pane[data-title="<strong>Full Text</strong>"]';

    const fullTextElement = document.querySelector(fullTextSelector);
    if (fullTextElement) {
      console.log("Full Text Content:", fullTextElement.textContent.trim());
      // You can also write this content to a file if needed
    } else {
      console.log("Full Text content not found.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// Replace this with the path to your HTML file
const filePath = "./not-works.html";
extractContent(filePath);
