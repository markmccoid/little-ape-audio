import TurndownService from "turndown";
import Markdown from "react-native-markdown-display";
import { NodeHtmlMarkdown } from "node-html-markdown";

// const turndownService = new TurndownService();

const HtmlToMarkdown: React.FC<{ html: string }> = ({ html }) => {
  // const markdown = turndownService.turndown(html);
  const validHtmlInput = typeof html === "string" ? html : "";

  // Convert HTML to Markdown using node-html-markdown
  // The translate method is static, so no need to instantiate the class for basic usage
  const markdown = NodeHtmlMarkdown.translate(
    validHtmlInput,
    /* options (optional) */ {},
    /* customTranslators (optional) */ undefined,
    /* customCodeBlockTranslators (optional) */ undefined
  );

  return (
    <Markdown
      style={{
        body: { color: "#000", fontSize: 16 },
        heading1: { fontSize: 24, fontWeight: "bold" },
        heading2: { fontSize: 20, fontWeight: "bold" },
        link: { color: "#007AFF" },
        paragraph: { marginBottom: 4 },
        list_item: {
          flexDirection: "row", // Important for aligning bullet and text
          alignItems: "center", // Aligns bullet with the top of the first line of text
          marginBottom: 8, // Space between list items
          // borderBottomWidth: 1,
          // paddingBottom: 4,
          // You can add paddingLeft here if you want to indent the whole item
          // including the bullet, but often bullet_list_icon marginRight is preferred
          // for space between bullet and text.
        },
        bullet_list_icon: {
          fontSize: 36, // Match body fontSize or make it slightly smaller/larger
          color: "black", // Example: Blue bullets
          marginRight: 8, // Space between the bullet and the text

          // lineHeight: 20, // Match body lineHeight for vertical alignment

          // You might need to adjust this slightly based on the font
          // For some fonts, a slightly different lineHeight or a marginTop
          // might be needed for perfect vertical centering with the text.
          // e.g., marginTop: 2 (experiment if needed)
        },
      }}
    >
      {markdown}
    </Markdown>
  );
};

export default HtmlToMarkdown;
