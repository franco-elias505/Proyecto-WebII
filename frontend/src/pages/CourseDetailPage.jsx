import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Globe,
  Layers,
  LockKeyhole,
  Play,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useResource } from "../hooks/useResource";
import { api } from "../services/api";

import { RemoteState, ErrorNotice } from "../components/RemoteState";
import { Avatar, Badge, CourseCover } from "../components/ui";

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const course = useResource("/cursos/" + id);
  const lessons = useResource(
    user?.rol === "estudiante" ? "/cursos/" + id + "/lecciones" : null,
  );
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState(null);

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      setEnrollError(null);
      await api.post("/cursos/" + id + "/inscribirme");
      lessons.reload();
      course.reload();
    } catch (err) {
      setEnrollError(err.message || "Error al inscribirse en el curso.");
    } finally {
      setEnrolling(false);
    }
  };
  const enrolled = !!lessons.data && !lessons.loading && !lessons.error;
  const nextLesson =
    lessons.data?.find(
      (l) => l.tipo === "contenido" && !l.bloqueada && !l.completada,
    ) ?? lessons.data?.find((l) => l.tipo === "contenido" && !l.bloqueada);
  return (
    <RemoteState resource={course}>
      {course.data && (
        <>
          <Link
            to="/cursos"
            className="mb-7 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600"
          >
            <ArrowLeft size={16} />
            Volver al catálogo
          </Link>
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px] xl:gap-12">
            <div>
              <div className="mb-5 flex gap-2">
                <Badge tone="indigo">{course.data.categoria}</Badge>
                <Badge>{course.data.nivel}</Badge>
              </div>
              <h1 className="text-3xl leading-tight font-bold tracking-[-0.04em] md:text-4xl">
                {course.data.titulo}
              </h1>
              <p className="mt-5 max-w-2xl text-[15px] leading-7 whitespace-pre-wrap text-slate-500">
                {course.data.descripcion}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <Avatar
                    name={course.data.instructor_nombre || "Instructor"}
                    small
                  />
                  {course.data.instructor_nombre || "Instructor del curso"}
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen size={15} />
                  {course.data.lecciones.length} lecciones
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe size={15} />
                  Español
                </span>
              </div>
              <div className="mt-9 grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
                <div className="flex gap-3">
                  <span className="mt-1 text-indigo-500">
                    <Clock3 size={20} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">
                      Aprende a tu ritmo
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Lecciones cortas para tu día a día.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="mt-1 text-emerald-500">
                    <Layers size={20} />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">Paso a paso</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Cada idea construye sobre la anterior.
                    </p>
                  </div>
                </div>
              </div>
              <section className="mt-9">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-xl font-bold tracking-tight">
                    Tu ruta de aprendizaje
                  </h2>
                  <span className="text-xs text-slate-400">
                    {course.data.lecciones.length} lecciones
                  </span>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  {course.data.lecciones.map((lesson) => {
                    const status = enrolled
                      ? lessons.data.find((l) => l.id === lesson.id)
                      : null;
                    const Icon = status?.completada
                      ? CheckCircle2
                      : status && !status.bloqueada
                        ? Play
                        : LockKeyhole;
                    return (
                      <div
                        className="flex items-center gap-4 border-b border-slate-100 px-5 py-5 last:border-0"
                        key={lesson.id}
                      >
                        <span className="w-5 text-xs font-medium text-slate-400">
                          {String(lesson.orden).padStart(2, "0")}
                        </span>
                        <span
                          className={
                            "grid size-9 shrink-0 place-items-center rounded-lg " +
                            (status?.completada
                              ? "bg-emerald-50 text-emerald-500"
                              : "bg-slate-50 text-slate-400")
                          }
                        >
                          <Icon size={17} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold">
                            {lesson.titulo}
                          </h3>
                          <span className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                            {lesson.tipo === "cuestionario" ? (
                              <FileQuestion size={12} />
                            ) : (
                              <BookOpen size={12} />
                            )}
                            {lesson.tipo === "cuestionario"
                              ? "Cuestionario"
                              : "Video / Lectura"}
                          </span>
                        </div>
                        {status &&
                          !status.bloqueada &&
                          lesson.tipo === "contenido" && (
                            <Link
                              className="text-xs font-semibold text-indigo-600"
                              to={"/lecciones/" + lesson.id}
                            >
                              {status.completada ? "Repasar" : "Abrir"}
                            </Link>
                          )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
            <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-28">
              <CourseCover course={course.data} />
              <div className="p-6">
                <h2 className="text-xl font-bold">Tu próximo paso está aquí</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Haz espacio para aprender algo que te inspire.
                </p>
                <ErrorNotice
                  error={lessons.error?.status === 403 ? null : lessons.error}
                />
                {user?.rol === "instructor" ? (
                  <Link
                    className="btn btn-primary mt-5 w-full"
                    to={
                      course.data.instructor_id === user.id
                        ? "/instructor/cursos/" + id + "/editar"
                        : "/cursos"
                    }
                  >
                    {course.data.instructor_id === user.id
                      ? "Editar este curso"
                      : "Explorar otros cursos"}
                    <ArrowRight size={16} />
                  </Link>
                ) : enrolled && nextLesson ? (
                  <Link
                    className="btn btn-primary mt-5 w-full"
                    to={"/lecciones/" + nextLesson.id}
                  >
                    Ir al curso
                    <ArrowRight size={16} />
                  </Link>
                ) : !user ? (
                  <Link className="btn btn-primary mt-5 w-full" to="/login">
                    Iniciar sesión
                    <ArrowRight size={16} />
                  </Link>
                ) : !enrolled ? (
                  <div className="mt-5 space-y-3">
                    <button
                      className="btn btn-primary w-full cursor-pointer disabled:opacity-50"
                      disabled={enrolling}
                      onClick={handleEnroll}
                    >
                      {enrolling ? "Inscribiendo..." : "Inscribirme en este curso"}
                      <ArrowRight size={16} />
                    </button>
                    {enrollError && (
                      <p className="text-xs text-rose-500">{enrollError}</p>
                    )}
                    <p className="text-xs text-slate-500">
                      Inscríbete gratis para acceder a todo el temario y cuestionarios.
                    </p>
                  </div>
                ) : (
                  <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    Completa los requisitos anteriores para acceder al siguiente contenido.
                  </p>
                )}
                <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-xs text-slate-500">
                  {[
                    "Contenido organizado y secuencial",
                    "Ejercicios para ponerlo en práctica",
                    "Un ritmo que se adapta a ti",
                  ].map((text) => (
                    <span className="flex gap-2" key={text}>
                      <Check size={15} className="text-emerald-500" />
                      {text}
                    </span>
                  ))}
                </div>
                <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                  <ShieldCheck size={13} />
                  Un espacio para seguir creciendo.
                </p>
              </div>
            </aside>
          </div>
        </>
      )}
    </RemoteState>
  );
}
