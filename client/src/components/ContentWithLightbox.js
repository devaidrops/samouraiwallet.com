"use client";

/* eslint-disable react/display-name */

import { useEffect, useRef, useState, useMemo } from "react";
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";

/**
 * Component for rendering HTML content with lightbox support for images
 * @param {string} html - HTML string to render
 * @param {string} id - Container ID (optional)
 * @param {string} className - Container CSS class (optional)
 */
export default function ContentWithLightbox({ html, id, className = "wysiwyg-content" }) {
  const containerRef = useRef(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [slides, setSlides] = useState([]);

  // Process HTML content (remove srcset, add ID to h2)
  const processedHtml = useMemo(() => {
    if (!html) return "";

    const srcsetRegex = /\s*srcset="[^"]*"/g;
    const h2Regex = /<h2(.*?)>/g;
    let newContent = html.replace(srcsetRegex, "");
    let counter = 1;
    newContent = newContent.replace(h2Regex, (match, group) => {
      const uniqueId = `toc-${counter++}`;
      return `<h2${group} id="${uniqueId}">`;
    });

    return newContent;
  }, [html]);

  // Initialize lightbox: find all images and add handlers
  useEffect(() => {
    if (!containerRef.current || !processedHtml) return;

    const container = containerRef.current;
    const images = container.querySelectorAll("img");

    if (images.length === 0) {
      setSlides([]);
      return;
    }

    const slidesArray = Array.from(images).map((img) => ({
      src: img.src || img.getAttribute("src") || "",
      alt: img.alt || "",
    }));

    setSlides(slidesArray);

    const clickHandlers = [];
    images.forEach((img, index) => {
      const handler = (e) => {
        e.preventDefault();
        setLightboxIndex(index);
        setLightboxOpen(true);
      };

      img.addEventListener("click", handler);
      clickHandlers.push({ img, handler });
    });

    return () => {
      clickHandlers.forEach(({ img, handler }) => {
        img.removeEventListener("click", handler);
      });
    };
  }, [processedHtml]);

  const lightboxProps = useMemo(
    () => ({
      open: lightboxOpen,
      close: () => setLightboxOpen(false),
      index: lightboxIndex,
      slides,
      carousel: { finite: true },
      infinite: false,
      on: {
        view: ({ index }) => {
          setLightboxIndex(index);
        },
      },
      plugins: [Counter],
      counter: { separator: " of " },
    }),
    [lightboxOpen, lightboxIndex, slides]
  );

  return (
    <>
      <div
        ref={containerRef}
        id={id}
        className={className}
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />

      {slides.length > 0 && <Lightbox {...lightboxProps} />}
    </>
  );
}
