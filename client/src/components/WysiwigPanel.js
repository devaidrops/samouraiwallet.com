"use client";

import { useMemo } from "react";

export default function WysiwigPanel({ id, content }) {
  const innerHtml = useMemo(() => {
    const srcsetRegex = /\s*srcset="[^"]*"/g;
    const h2Regex = /<h2(.*?)>/g;
    let newContent = content.replace(srcsetRegex, "");
    let counter = 1;
    newContent = newContent.replace(h2Regex, (match, group) => {
      const uniqueId = `toc-${counter++}`;
      return `<h2${group} id="${uniqueId}">`;
    });

    return newContent;
  }, [content]);

  return (
    <div
      id={id || "wysiwyg"}
      className="wysiwyg-content"
      dangerouslySetInnerHTML={{ __html: innerHtml }}
    ></div>
  );
}
