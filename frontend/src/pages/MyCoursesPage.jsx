import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle2, GraduationCap } from "lucide-react";
import { useResource } from "../hooks/useResource";
import { RemoteState } from "../components/RemoteState";
import { Badge, ProgressBar } from "../components/ui";

export default function MyCoursesPage() {
  const resource = useResource("/estudiante/cursos");
  const courses = resource.data || [];

  return (
    <div className="py-2">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="eyebrow">
            <GraduationCap size={13} />
            MI APRENDIZAJE
          </span>
          <h1 className="text-3xl font-bold tracking-tight">Mis Cursos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Cursos en los que estás inscrito y tu avance actual.
          </p>
        </div>
        <Link to="/cursos" className="btn btn-secondary text-sm">
          Explorar catálogo
          <ArrowRight size={14} />
        </Link>
      </div>

      <RemoteState resource={resource}>
        {courses.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <BookOpen size={24} />
            </div>
            <h2 className="text-lg font-bold">Aún no estás inscrito en ningún curso</h2>
            <p className="mt-2 text-sm text-slate-500">
              Explora nuestro catálogo y empieza a aprender algo nuevo hoy.
            </p>
            <Link to="/cursos" className="btn btn-primary mt-6 inline-flex">
              Ver cursos disponibles
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((item) => {
              const total = item.total_lecciones || 0;
              const completed = item.lecciones_completadas || 0;
              const percent = total > 0 ? Math.round((completed * 100) / total) : 0;

              return (
                <div
                  key={item.inscripcion_id}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="p-6">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <Badge tone="indigo">{item.categoria}</Badge>
                      {item.completado ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <CheckCircle2 size={14} />
                          Completado
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          {percent}% completado
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
                      {item.titulo}
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-slate-500 line-clamp-2">
                      {item.descripcion}
                    </p>
                    <div className="mt-5">
                      <ProgressBar
                        value={percent}
                        label={`${completed} de ${total} lecciones`}
                      />
                    </div>
                  </div>
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                    <Link
                      to={`/cursos/${item.curso_id}`}
                      className="btn btn-primary w-full text-xs"
                    >
                      {item.completado ? "Repasar curso" : "Continuar curso"}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </RemoteState>
    </div>
  );
}
