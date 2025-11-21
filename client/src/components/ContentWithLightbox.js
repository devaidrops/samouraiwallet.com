"use client";

/* eslint-disable react/display-name */

import { useEffect, useRef, useState, useMemo } from "react";
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";

/**
 * Компонент для рендеринга HTML-контента с поддержкой лайтбокса для изображений
 * @param {string} html - HTML строка для рендеринга
 * @param {string} id - ID контейнера (опционально)
 * @param {string} className - CSS класс контейнера (опционально)
 */
export default function ContentWithLightbox({ html, id, className = "wysiwyg-content" }) {
  const containerRef = useRef(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [slides, setSlides] = useState([]);

  // Обработка HTML контента (удаление srcset, добавление ID для h2)
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

  // Инициализация лайтбокса: поиск всех изображений и добавление обработчиков
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
      counter: { separator: " из " },
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
