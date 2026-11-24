import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Archive,
  BookOpen,
  CheckCircle2,
  FileQuestion,
  GripVertical,
  Lightbulb,
  MoreHorizontal,
  Pencil,
  Plus,
  Save,
  Send,
  Trash2,
} from "lucide-react";
import { useResource } from "../hooks/useResource";
import { api } from "../services/api";
import { ErrorNotice, RemoteState } from "../components/RemoteState";
import { Badge, CourseStatus, EmptyState } from "../components/ui";
import LessonDrawer from "../components/LessonDrawer";

const blank = { titulo: "", descripcion: "", categoria: "", nivel: "Básico" };

function Editor({ course, reload }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(course || blank);
  const [editing, setEditing] = useState(undefined);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const closeDrawer = useCallback(() => setEditing(undefined), []);
  async function action(work) {
    setError(null);
    setNotice("");
    setBusy(true);
    try {
      await work();
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  function save(event) {
    event.preventDefault();
    const body = Object.fromEntries(
      Object.keys(blank).map((key) => [key, form[key].trim()]),
    );
    if (Object.values(body).some((value) => !value)) {
      setError("Completa todos los datos del curso.");
      return;
    }
    action(async () => {
      const result = course
        ? await api.put("/cursos/" + course.id, body)
        : await api.post("/cursos", body);
      if (!course)
        navigate("/instructor/cursos/" + result.id + "/editar", {
          replace: true,
        });
      else {
        setNotice("Todos los cambios están guardados.");
        reload();
      }
    });
  }
  function state(estado) {
    action(async () => {
      await api.patch("/cursos/" + course.id + "/estado", { estado });
      reload();
      setNotice("El curso está " + estado + ".");
    });
  }
  function reorder(index, delta) {
    const ids = course.lecciones.map((l) => l.id);
    const other = ids[index + delta];
    ids[index + delta] = ids[index];
    ids[index] = other;
    action(async () => {
      await api.patch("/cursos/" + course.id + "/lecciones/orden", {
        lecciones: ids,
      });
      reload();
    });
  }
  function removeLesson(lesson) {
    if (window.confirm("¿Eliminar esta lección y sus adjuntos?"))
      action(async () => {
        await api.delete("/lecciones/" + lesson.id);
        reload();
      });
  }
  function removeCourse() {
    if (
      window.confirm(
        "¿Eliminar el curso y sus lecciones? Los cursos con inscritos solo se pueden archivar.",
      )
    )
      action(async () => {
        await api.delete("/cursos/" + course.id);
        navigate("/instructor/cursos");
      });
  }
  return (
    <>
      <Link
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500"
        to="/instructor/cursos"
      >
        <ArrowLeft size={16} />
        Mis cursos
      </Link>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="eyebrow">DA FORMA A LO QUE SABES</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="page-title">
              {course ? "Editor de curso" : "Tu próxima gran idea"}
            </h1>
            {course && <CourseStatus state={course.estado} />}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            className="btn btn-outline-secondary"
            form="course-editor"
            type="submit"
            disabled={busy}
          >
            <Save size={16} />
            {busy
              ? "Guardando…"
              : course
                ? "Guardar cambios"
                : "Guardar borrador"}
          </button>
          {course && course.estado !== "publicado" && (
            <button
              className="btn btn-primary"
              disabled={busy || !course.lecciones.length}
              onClick={() => state("publicado")}
            >
              <Send size={16} />
              Publicar curso
            </button>
          )}
        </div>
      </div>
      <ErrorNotice error={error} />
      {notice && (
        <div
          className="alert alert-success flex items-center gap-2"
          role="status"
        >
          <CheckCircle2 size={17} />
          {notice}
        </div>
      )}
      <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div>
          <section className="panel">
            <div className="mb-6 border-b border-slate-100 pb-5">
              <h2 className="text-lg font-bold">Primero, los fundamentos.</h2>
              <p className="mt-1 text-xs leading-6 text-slate-400">
                Una buena presentación invita a dar el primer paso.
              </p>
            </div>
            <form id="course-editor" onSubmit={save}>
              <fieldset disabled={busy}>
                <label className="form-label" htmlFor="course-titulo">
                  Título del curso
                </label>
                <input
                  className="form-control mb-5"
                  id="course-titulo"
                  value={form.titulo}
                  maxLength={200}
                  required
                  placeholder="Algo que valga la pena aprender"
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                />
                <div className="mb-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="form-label" htmlFor="course-categoria">
                      Categoría
                    </label>
                    <input
                      list="course-categories"
                      id="course-categoria"
                      className="form-control"
                      value={form.categoria}
                      onChange={(e) =>
                        setForm({ ...form, categoria: e.target.value })
                      }
                      maxLength={120}
                      required
                      placeholder="Elige o escribe"
                    />
                    <datalist id="course-categories">
                      <option>Programación</option>
                      <option>Diseño</option>
                      <option>Idiomas</option>
                    </datalist>
                  </div>
                  <div>
                    <label className="form-label" htmlFor="course-nivel">
                      Nivel
                    </label>
                    <select
                      id="course-nivel"
                      className="form-select"
                      value={form.nivel}
                      onChange={(e) =>
                        setForm({ ...form, nivel: e.target.value })
                      }
                    >
                      {!["Básico", "Intermedio", "Avanzado"].includes(
                        form.nivel,
                      ) && <option>{form.nivel}</option>}
                      <option>Básico</option>
                      <option>Intermedio</option>
                      <option>Avanzado</option>
                    </select>
                  </div>
                </div>
                <label className="form-label" htmlFor="course-descripcion">
                  ¿De qué se trata?
                </label>
                <textarea
                  className="form-control"
                  id="course-descripcion"
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({ ...form, descripcion: e.target.value })
                  }
                  required
                  maxLength={10000}
                  rows={6}
                  placeholder="Cuenta qué aprenderán y por qué importa."
                />
                <p className="mt-2 text-right text-[10px] text-slate-400">
                  {form.descripcion.length} / 10000
                </p>
              </fieldset>
            </form>
          </section>
          <section className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-5">
            <div className="flex gap-3">
              <Lightbulb
                size={19}
                className="mt-0.5 shrink-0 text-indigo-500"
              />
              <div>
                <h3 className="text-sm font-semibold text-indigo-900">
                  Pequeño, claro y memorable.
                </h3>
                <p className="mt-2 text-xs leading-6 text-indigo-800/70">
                  Cada lección funciona mejor con una idea central. Empieza con
                  lo esencial y construye desde ahí.
                </p>
              </div>
            </div>
          </section>
          {course && (
            <div className="mt-6 flex items-center justify-between px-1">
              <button
                className="inline-flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-700"
                disabled={busy}
                onClick={removeCourse}
              >
                <Trash2 size={13} />
                Eliminar curso
              </button>
              {course.estado !== "archivado" && (
                <button
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500"
                  disabled={busy}
                  onClick={() => state("archivado")}
                >
                  <Archive size={13} />
                  Archivar curso
                </button>
              )}
            </div>
          )}
        </div>
        <section className="panel !p-0">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-6">
            <div>
              <h2 className="text-lg font-bold">El camino de aprendizaje</h2>
              <p className="mt-1 text-xs text-slate-400">
                {course?.lecciones.length || 0} lecciones · Una idea a la vez
              </p>
            </div>
            <span className="rounded-lg bg-slate-50 p-2 text-slate-400">
              <MoreHorizontal size={18} />
            </span>
          </div>
          {!course ? (
            <div className="p-5">
              <EmptyState
                title="Todo empieza con una idea"
                description="Guarda los datos del curso para comenzar a construir las lecciones."
              />
            </div>
          ) : (
            <>
              <ol className="divide-y divide-slate-100">
                {course.lecciones.map((lesson, index) => (
                  <li
                    key={lesson.id}
                    className="group flex flex-wrap items-center gap-3 p-5 transition-colors hover:bg-slate-50/60"
                  >
                    <GripVertical
                      size={16}
                      className="text-slate-300"
                      aria-hidden="true"
                    />
                    <span
                      className={
                        "grid size-10 shrink-0 place-items-center rounded-xl " +
                        (lesson.tipo === "cuestionario"
                          ? "bg-amber-50 text-amber-500"
                          : "bg-indigo-50 text-indigo-500")
                      }
                    >
                      {lesson.tipo === "cuestionario" ? (
                        <FileQuestion size={18} />
                      ) : (
                        <BookOpen size={18} />
                      )}
                    </span>
                    <div className="min-w-24 flex-1">
                      <p className="mb-1 text-[10px] text-slate-400">
                        LECCIÓN {String(lesson.orden).padStart(2, "0")}
                      </p>
                      <h3 className="text-sm leading-5 font-semibold">
                        {lesson.titulo}
                      </h3>
                      <div className="mt-2">
                        <Badge
                          tone={
                            lesson.tipo === "cuestionario" ? "amber" : "slate"
                          }
                        >
                          {lesson.tipo === "cuestionario"
                            ? "Cuestionario"
                            : "Contenido"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="icon-button !size-7 !border-0 !bg-transparent"
                        aria-label={"Subir " + lesson.titulo}
                        disabled={busy || index === 0}
                        onClick={() => reorder(index, -1)}
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        className="icon-button !size-7 !border-0 !bg-transparent"
                        aria-label={"Bajar " + lesson.titulo}
                        disabled={busy || index === course.lecciones.length - 1}
                        onClick={() => reorder(index, 1)}
                      >
                        <ArrowDown size={13} />
                      </button>
                      <button
                        className="icon-button !size-8"
                        aria-label={"Editar " + lesson.titulo}
                        disabled={busy}
                        onClick={() => setEditing(lesson)}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        className="icon-button !size-8 hover:!text-rose-500"
                        aria-label={"Eliminar " + lesson.titulo}
                        disabled={busy}
                        onClick={() => removeLesson(lesson)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="p-5">
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/30 py-4 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
                  disabled={busy}
                  onClick={() => setEditing(null)}
                >
                  <Plus size={17} />
                  Agregar lección
                </button>
              </div>
              {!course.lecciones.length && (
                <p className="px-6 pb-5 text-center text-xs text-slate-400">
                  Agrega al menos una lección para publicar tu curso.
                </p>
              )}
            </>
          )}
        </section>
      </div>
      {editing !== undefined && (
        <LessonDrawer
          lesson={editing}
          courseId={course.id}
          onClose={closeDrawer}
          onSaved={(lesson) => {
            setEditing(lesson);
            reload();
          }}
        />
      )}
    </>
  );
}

export default function CourseEditorPage() {
  const { id } = useParams();
  const resource = useResource(id ? "/instructor/cursos/" + id : null);
  if (!id) return <Editor key="new" />;
  return (
    <RemoteState resource={resource}>
      {resource.data && (
        <Editor key={id} course={resource.data} reload={resource.reload} />
      )}
    </RemoteState>
  );
}
