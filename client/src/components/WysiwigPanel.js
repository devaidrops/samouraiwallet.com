"use client";

import ContentWithLightbox from "@/components/ContentWithLightbox";

export default function WysiwigPanel({ id, content }) {
  return <ContentWithLightbox html={content} id={id} />;
}
