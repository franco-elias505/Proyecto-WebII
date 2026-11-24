import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  FileQuestion,
  LockKeyhole,
  Play,
  Sparkles,
} from "lucide-react";
import { useResource } from "../hooks/useResource";
import { RemoteState, ErrorNotice } from "../components/RemoteState";
import { Badge, ProgressBar } from "../components/ui";
import { FileList } from "../components/LessonFiles";
import LessonVideo from "../components/LessonVideo";

function Player({ lesson }) {
  const syllabus = useResource("/cursos/" + lesson.curso_id + "/lecciones");
  const items = syllabus.data || [];
  const current = items.find((item) => item.id === lesson.id);
  const available = items.filter(
    (item) => item.tipo === "contenido" && !item.bloqueada,
  );
  const previous = available.filter((item) => item.orden < lesson.orden).at(-1);
  const next = available.find((item) => item.orden > lesson.orden);
  const complete = items.filter((item) => item.completada).length;
  return (
    <>
      <Link
        className="mb-7 inline-flex items-center gap-2 text-sm text-slate-500"
        to={"/cursos/" + lesson.curso_id}
      >
        <ArrowLeft size={16} />
        Volver al curso
      </Link>
      <div className="grid items-start gap-7 lg:grid-cols-[285px_1fr]">
        <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-28">
          <div className="border-b border-slate-100 p-5">
            <p className="eyebrow">
              <BookOpen size={12} />
              TU RUTA DE APRENDIZAJE
            </p>
            <h2 className="mb-5 text-lg font-bold">Una lección a la vez.</h2>
            <ProgressBar
              value={
                items.length ? Math.round((100 * complete) / items.length) : 0
              }
              label={complete + " de " + items.length + " completadas"}
            />
          </div>
          <div className="space-y-1 p-3">
            {syllabus.loading ? (
              <div className="skeleton h-50" />
            ) : (
              items.map((item) => {
                const Icon = item.completada
                  ? CheckCircle2
                  : item.bloqueada
                    ? LockKeyhole
                    : item.tipo === "cuestionario"
                      ? FileQuestion
                      : Play;
                const content = (
                  <>
                    <Icon
                      size={17}
                      className={
                        "mt-0.5 shrink-0 " +
                        (item.completada ? "text-emerald-500" : "")
                      }
                    />
                    <span className="flex-1">
                      <span className="mb-0.5 block text-[10px] text-slate-400">
                        LECCIÓN {String(item.orden).padStart(2, "0")}
                      </span>
                      <span className="block text-xs leading-5 font-medium">
                        {item.titulo}
                      </span>
                      {item.tipo === "cuestionario" && (
                        <span className="mt-1 block text-[10px] text-slate-400">
                          Cuestionario
                        </span>
                      )}
                    </span>
                  </>
                );
                if (item.bloqueada || item.tipo === "cuestionario")
                  return (
                    <div
                      key={item.id}
                      className={
                        "lesson-nav-item " +
                        (item.bloqueada ? "locked" : "text-slate-500")
                      }
                      title={
                        item.bloqueada
                          ? "Completa los requisitos anteriores para desbloquear"
                          : "Lección de cuestionario"
                      }
                      aria-disabled="true"
                    >
                      {content}
                    </div>
                  );
                return (
                  <Link
                    key={item.id}
                    className={
                      "lesson-nav-item " +
                      (item.id === lesson.id ? "current" : "text-slate-600")
                    }
                    aria-current={item.id === lesson.id ? "page" : undefined}
                    to={"/lecciones/" + item.id}
                  >
                    {content}
                  </Link>
                );
              })
            )}
          </div>
          <ErrorNotice error={syllabus.error} />
        </aside>
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6 md:px-8">
            <div className="mb-3 flex items-center justify-between">
              <span className="eyebrow !mb-0">
                LECCIÓN {String(lesson.orden).padStart(2, "0")}
              </span>
              <Badge tone={current?.completada ? "green" : "indigo"}>
                {current?.completada ? "Completada" : "Lectura"}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight md:text-[28px]">
              {lesson.titulo}
            </h1>
          </div>
          <div className="p-6 md:p-8">
            {lesson.tipo === "contenido" ? (
              <>
                <LessonVideo lesson={lesson} />
                <div className="mb-7 flex items-center gap-2 text-sm font-semibold">
                  <BookOpen size={17} className="text-indigo-500" />
                  Exploremos la idea
                </div>
                <div className="prose-lesson">{lesson.contenido}</div>
                {lesson.archivos?.length > 0 && (
                  <section className="mt-8 rounded-xl border border-slate-200 p-5">
                    <h2 className="mb-4 text-sm font-semibold">
                      Material para acompañarte
                    </h2>
                    <FileList
                      key={lesson.id}
                      lessonId={lesson.id}
                      files={lesson.archivos}
                    />
                  </section>
                )}
                <div className="mt-8 flex gap-3 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                  <Sparkles
                    size={18}
                    className="mt-0.5 shrink-0 text-indigo-500"
                  />
                  <p className="text-xs leading-6 text-indigo-800">
                    Date tiempo para probar cada concepto y construir tus
                    propios ejemplos.
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm leading-7 text-slate-500">
                Lección de cuestionario. Nota mínima de aprobación:{" "}
                {lesson.nota_minima}/100.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/40 p-5">
            {previous ? (
              <Link
                className="btn btn-outline-secondary"
                to={"/lecciones/" + previous.id}
              >
                <ChevronLeft size={16} />
                Anterior
              </Link>
            ) : (
              <Link
                className="btn btn-outline-secondary"
                to={"/cursos/" + lesson.curso_id}
              >
                <ChevronLeft size={16} />
                Temario
              </Link>
            )}
            {next && (
              <Link className="btn btn-primary" to={"/lecciones/" + next.id}>
                Siguiente lección
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </article>
      </div>
    </>
  );
}

export default function LessonPage() {
  const { id } = useParams();
  const lesson = useResource("/lecciones/" + id);
  return (
    <RemoteState resource={lesson}>
      {lesson.data && <Player key={id} lesson={lesson.data} />}
    </RemoteState>
  );
}
