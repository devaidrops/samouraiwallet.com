import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

export default function TableTooltip({ title, content }) {
  const iconRef = useRef();
  const contentRef = useRef();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (iconRef.current && contentRef.current) {
        const iconRect = iconRef.current.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();
        const isHovering = (e.clientX > iconRect.left && e.clientX < iconRect.right && e.clientY > iconRect.top && e.clientY < iconRect.bottom) || (e.clientX > contentRect.left && e.clientX < contentRect.right && e.clientY > contentRect.top && e.clientY < contentRect.bottom);
        if (isHovering) {
          setShowContent(true);
        } else {
          setShowContent(false);
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="table-tip-wrapper js-table-tip-wrapper">
      <img
        ref={iconRef}
        className="icon-info"
        src="/img/tip-info-blue.svg"
        alt="Tip"
        onMouseOver={() => setShowContent(true)}
      />

      <div ref={contentRef} className={clsx("table-tip", showContent && "is-visible")}>
        <img className="tip-arrow" src="/img/union.svg" alt="" />
        <div className="tip-content">
          <div className="tip-title">{title}</div>
          <p className="tip-descr">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}
