import { useEffect, useRef } from "react";
import { FileText, X } from "lucide-react";
import LessonForm from "./LessonForm";
import LessonFiles from "./LessonFiles";
import { Badge } from "./ui";

export default function LessonDrawer({ lesson, courseId, onSaved, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const active = document.activeElement;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    function keydown(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        const items = ref.current?.querySelectorAll(
          "a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled])",
        );
        const first = items?.[0];
        const last = items?.[items.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", keydown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", keydown);
      active?.focus();
    };
  }, [onClose]);
  return (
    <>
      <button
        className="drawer-backdrop"
        aria-label="Cerrar editor de lección"
        onClick={onClose}
      />
      <section
        ref={ref}
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        tabIndex={-1}
      >
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white/95 p-6 backdrop-blur-lg">
          <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-500">
            <FileText size={20} />
          </span>
          <div className="flex-1">
            <h2 id="drawer-title" className="font-semibold">
              {lesson ? "Diseña esta lección" : "Una nueva idea para compartir"}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Un paso más en el camino de tus estudiantes.
            </p>
          </div>
          <button
            className="icon-button"
            aria-label="Cerrar panel"
            onClick={onClose}
          >
            <X size={17} />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-5">
            <Badge tone="indigo">
              {lesson ? "Lección " + lesson.orden : "Nueva lección"}
            </Badge>
          </div>
          <LessonForm
            key={lesson?.id || "new"}
            lesson={lesson}
            courseId={courseId}
            onSaved={onSaved}
            onCancel={onClose}
          />
          {lesson?.tipo === "contenido" && (
            <div className="mt-7">
              <LessonFiles lessonId={lesson.id} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
