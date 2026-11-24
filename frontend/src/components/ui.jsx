import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CodeXml,
  Palette,
  Languages,
  ArrowUpRight,
  Check,
  Layers,
} from "lucide-react";
import { Link } from "react-router-dom";

const categoryStyle = {
  Programación: {
    Icon: CodeXml,
    className: "cover-code",
    label: "CONSTRUYE ALGO INCREÍBLE",
    code: "<hello world />",
  },
  Diseño: {
    Icon: Palette,
    className: "cover-design",
    label: "DA FORMA A TUS IDEAS",
    code: "Make it matter.",
  },
  Idiomas: {
    Icon: Languages,
    className: "cover-language",
    label: "ABRE NUEVAS CONVERSACIONES",
    code: "Hello, world!",
  },
};
export function CourseCover({ course, large = false }) {
  const style = categoryStyle[course.categoria] || {
    Icon: Layers,
    className: "cover-code",
    label: "APRENDE ALGO NUEVO",
    code: "Start something.",
  };
  const Icon = style.Icon;
  return (
    <div
      className={`course-cover ${style.className} ${large ? "cover-large" : ""}`}
    >
      <div className="cover-grid" />
      <span className="cover-label">{style.label}</span>
      <div className="cover-graphic">
        <span>{style.code}</span>
        <Icon size={large ? 64 : 42} strokeWidth={1.5} />
      </div>
      <span className="cover-level">{course.nivel}</span>
    </div>
  );
}
export function Badge({ children, tone = "slate" }) {
  return <span className={"badge badge-" + tone}>{children}</span>;
}
export function CourseStatus({ state }) {
  return (
    <Badge
      tone={
        { publicado: "green", borrador: "amber", archivado: "slate" }[state]
      }
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {
        {
          publicado: "Publicado",
          borrador: "Borrador",
          archivado: "Archivado",
        }[state]
      }
    </Badge>
  );
}
export function Avatar({ name = "", small = false }) {
  return (
    <span className={"avatar " + (small ? "avatar-small" : "")}>
      {name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase()}
    </span>
  );
}
export function ProgressBar({ value, label, completed = false }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-500">{label}</span>
        <strong className={completed ? "text-emerald-600" : "text-indigo-600"}>
          {value}%
        </strong>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "Progreso del curso"}
      >
        <div
          className={
            completed
              ? "progress-fill bg-emerald-500"
              : "progress-fill bg-indigo-600"
          }
          style={{ width: value + "%" }}
        />
      </div>
    </div>
  );
}
export function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
export function EmptyState({
  title = "Un nuevo comienzo",
  description,
  action,
}) {
  return (
    <div className="empty-state">
      <div className="empty-illustration">
        <BookOpen size={32} />
        <span>
          <Check size={14} />
        </span>
      </div>
      <h2 className="mt-5 text-xl font-bold text-slate-800">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
export function CourseCard({ course }) {
  return (
    <article className="catalog-card">
      <Link to={"/cursos/" + course.id} tabIndex={-1} aria-hidden="true">
        <CourseCover course={course} />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <span className="mb-2 text-xs font-semibold text-indigo-600">
          {course.categoria}
        </span>
        <h2 className="text-lg font-bold leading-7 tracking-tight">
          <Link
            className="transition-colors hover:text-indigo-600"
            to={"/cursos/" + course.id}
          >
            {course.titulo}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {course.descripcion}
        </p>
        <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
          <Avatar small name={course.instructor_nombre || "Instructor"} />
          <span>{course.instructor_nombre || "Instructor del curso"}</span>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <BookOpen size={14} />
            {course.total_lecciones ?? course.lecciones?.length ?? 0} lecciones
          </span>
          <Link
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600"
            to={"/cursos/" + course.id}
          >
            Ver curso
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
export function PaginationControl({ data, onPage }) {
  const pages = Math.max(1, Math.ceil(data.total / data.limit));
  return (
    <nav
      className="mt-9 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-6"
      aria-label="Paginación"
    >
      <p className="text-sm text-slate-500">{data.total} cursos encontrados</p>
      <div className="flex items-center gap-2">
        <button
          className="icon-button"
          aria-label="Página anterior"
          disabled={data.page <= 1}
          onClick={() => onPage(data.page - 1)}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="min-w-10 rounded-lg bg-indigo-50 px-3 py-2 text-center text-sm font-semibold text-indigo-600">
          {data.page}
        </span>
        <span className="px-2 text-sm text-slate-400">de {pages}</span>
        <button
          className="icon-button"
          aria-label="Página siguiente"
          disabled={data.page >= pages}
          onClick={() => onPage(data.page + 1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </nav>
  );
}
