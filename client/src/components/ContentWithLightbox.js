"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import dynamic from "next/dynamic";

// Dynamic import для лайтбокса с отключенным SSR
// Используем условный импорт, чтобы не ломать сборку, если библиотека не установлена
let Lightbox;
let CounterPluginLoader = null;
try {
  Lightbox = dynamic(
    () =>
      import("yet-another-react-lightbox")
        .then(async (mod) => {
          // Динамически импортируем стили только на клиенте
          if (typeof window !== "undefined") {
            import("yet-another-react-lightbox/styles.css").catch(() => {
              // Игнорируем ошибки импорта стилей
            });
            // Импортируем стили для плагина Counter
            import("yet-another-react-lightbox/plugins/counter.css").catch(() => {
              // Игнорируем ошибки импорта стилей
            });
          }
          // yet-another-react-lightbox экспортирует default export
          return mod.default || mod;
        })
        .catch((err) => {
          console.error("Failed to load yet-another-react-lightbox:", err);
          console.error("Please run: npm install yet-another-react-lightbox");
          // Возвращаем пустой компонент, если библиотека не установлена
          return { default: () => null };
        }),
    {
      ssr: false,
    }
  );

  // Загружаем плагин Counter отдельно
  CounterPluginLoader = () =>
    import("yet-another-react-lightbox/plugins/counter")
      .then((mod) => mod.default || mod)
      .catch(() => null);
} catch (err) {
  // Если модуль не найден на этапе сборки, создаем заглушку
  console.warn("yet-another-react-lightbox not found. Please install it: npm install yet-another-react-lightbox");
  Lightbox = () => null;
}

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
  const [counterPlugin, setCounterPlugin] = useState(null);

  // Загружаем плагин Counter при монтировании компонента
  useEffect(() => {
    if (typeof window !== "undefined" && CounterPluginLoader) {
      CounterPluginLoader()
        .then((plugin) => {
          if (plugin) {
            setCounterPlugin(() => plugin);
          }
        })
        .catch((err) => {
          console.warn("Failed to load Counter plugin:", err);
        });
    }
  }, []);

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

    // Формируем массив слайдов из всех изображений
    const slidesArray = Array.from(images).map((img) => ({
      src: img.src || img.getAttribute("src") || "",
      alt: img.alt || "",
    }));

    setSlides(slidesArray);

    // Добавляем обработчики клика на каждое изображение
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

    // Cleanup: удаляем обработчики при размонтировании или изменении HTML
    return () => {
      clickHandlers.forEach(({ img, handler }) => {
        img.removeEventListener("click", handler);
      });
    };
  }, [processedHtml]);

  // Формируем props для Lightbox динамически
  const lightboxProps = useMemo(() => {
    const baseProps = {
      open: lightboxOpen,
      close: () => setLightboxOpen(false),
      index: lightboxIndex,
      slides: slides,
      carousel: { finite: true },
      infinite: false,
      on: {
        view: ({ index }) => {
          // Обновляем индекс при изменении слайда
          setLightboxIndex(index);
        },
      },
    };

    // Добавляем плагин Counter только если он загружен и является функцией
    if (counterPlugin && typeof counterPlugin === "function") {
      try {
        baseProps.plugins = [counterPlugin];
        baseProps.counter = { separator: " из " };
      } catch (err) {
        console.warn("Failed to add Counter plugin:", err);
      }
    }

    return baseProps;
  }, [lightboxOpen, lightboxIndex, slides, counterPlugin]);

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

