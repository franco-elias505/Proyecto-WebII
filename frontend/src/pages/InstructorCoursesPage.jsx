import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Archive,
  ArrowRight,
  BookOpen,
  Eye,
  FileText,
  Pencil,
  Plus,
  Send,
  Users,
} from "lucide-react";
import { useResource } from "../hooks/useResource";
import { api } from "../services/api";
import { ErrorNotice, RemoteState } from "../components/RemoteState";
import {
  CourseCover,
  CourseStatus,
  EmptyState,
  PageHeading,
  PaginationControl,
} from "../components/ui";

export default function InstructorCoursesPage() {
  const [params, setParams] = useSearchParams();
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const query = new URLSearchParams(params);
  query.set("limit", "8");
  const courses = useResource("/instructor/cursos?" + query);
  async function state(course) {
    setBusy(course.id);
    setError(null);
    try {
      await api.patch("/cursos/" + course.id + "/estado", {
        estado: course.estado === "publicado" ? "archivado" : "publicado",
      });
      courses.reload();
    } catch (error) {
      setError(error);
    } finally {
      setBusy(null);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="ESPACIO DEL INSTRUCTOR"
        title="Comparte lo que sabes."
        description="Dale forma a tus ideas y acompaña a otros en su siguiente paso."
        action={
          <Link className="btn btn-primary" to="/instructor/cursos/nuevo">
            <Plus size={17} />
            Crear curso
          </Link>
        }
      />
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {[
            ["", "Todos los cursos"],
            ["publicado", "Publicados"],
            ["borrador", "Borradores"],
            ["archivado", "Archivados"],
          ].map(([value, label]) => (
            <button
              key={value}
              aria-pressed={(params.get("estado") || "") === value}
              onClick={() => setParams(value ? { estado: value } : {})}
              className={
                "rounded-lg px-3.5 py-2 text-xs font-medium transition-colors " +
                ((params.get("estado") || "") === value
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-500 hover:text-indigo-600")
              }
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400">
          {courses.data?.total || 0} cursos en tu espacio
        </span>
      </div>
      <ErrorNotice error={error} />
      <RemoteState resource={courses}>
        {courses.data && (
          <>
            {!courses.data.data.length ? (
              <EmptyState
                title="Toda gran idea empieza en borrador"
                description="Comparte una habilidad, una pasión o algo que te hubiera gustado aprender antes."
                action={
                  <Link
                    className="btn btn-primary"
                    to="/instructor/cursos/nuevo"
                  >
                    <Plus size={16} />
                    Crear mi primer curso
                  </Link>
                }
              />
            ) : (
              <div className="space-y-4">
                {courses.data.data.map((course) => (
                  <article
                    className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-[190px_1fr]"
                    key={course.id}
                  >
                    <div className="[&_.course-cover]:h-full [&_.course-cover]:min-h-36 [&_.cover-graphic]:inset-x-4 [&_.cover-graphic>span]:text-sm [&_.cover-graphic>svg]:size-8 [&_.cover-label]:text-[7px]">
                      <CourseCover course={course} />
                    </div>
                    <div className="p-5">
                      <div className="mb-2 flex flex-wrap items-center gap-3">
                        <CourseStatus state={course.estado} />
                        <span className="text-xs text-slate-400">
                          {course.categoria} · {course.nivel}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold tracking-tight">
                        {course.titulo}
                      </h2>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <BookOpen size={13} />
                          {course.total_lecciones || 0} lecciones
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users size={13} />
                          {course.total_inscritos || 0} estudiantes
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FileText size={13} />
                          {course.estado === "borrador"
                            ? "Tu próxima idea en construcción"
                            : course.estado === "archivado"
                              ? "Conservado para tus estudiantes"
                              : "Disponible en el catálogo"}
                        </span>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <Link
                          className="btn btn-outline-secondary btn-sm"
                          to={"/instructor/cursos/" + course.id + "/editar"}
                        >
                          <Pencil size={13} />
                          Editar curso
                        </Link>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          disabled={busy === course.id}
                          onClick={() => state(course)}
                        >
                          {course.estado === "publicado" ? (
                            <Archive size={13} />
                          ) : (
                            <Send size={13} />
                          )}
                          {course.estado === "publicado"
                            ? "Archivar"
                            : "Publicar"}
                        </button>
                        {course.estado === "publicado" && (
                          <Link
                            className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-indigo-600"
                            to={"/cursos/" + course.id}
                          >
                            <Eye size={14} />
                            Vista pública
                            <ArrowRight size={13} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <PaginationControl
              data={courses.data}
              onPage={(page) => {
                const next = new URLSearchParams(params);
                next.set("page", page);
                setParams(next);
              }}
            />
          </>
        )}
      </RemoteState>
    </>
  );
}
