import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  CodeXml,
  Check,
  Play,
  ArrowUpRight,
  BookOpen,
  X,
} from "lucide-react";
import { useResource } from "../hooks/useResource";
import { useAuth } from "../hooks/useAuth";
import { RemoteState } from "../components/RemoteState";
import {
  Badge,
  CourseCard,
  EmptyState,
  PaginationControl,
} from "../components/ui";

export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const query = new URLSearchParams(params);
  query.set("limit", "6");
  const courses = useResource("/cursos?" + query);
  const categories = useResource("/cursos/categorias");
  function filter(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setParams(next, { replace: true });
  }
  const choices = categories.data || [];
  return (
    <>
      <section className="relative mb-12 flex items-center justify-between gap-10 overflow-hidden rounded-3xl border border-indigo-100/70 bg-linear-to-br from-white via-indigo-50/60 to-indigo-100/70 px-7 py-10 md:px-11 md:py-12">
        <div className="relative z-10 max-w-xl">
          <Badge tone="indigo">
            <Sparkles size={12} />
            UN POCO CADA DÍA, UN GRAN CAMBIO
          </Badge>
          <h1 className="mt-5 text-[36px] leading-[1.14] font-bold tracking-[-0.045em] text-slate-900 md:text-[48px]">
            Tu siguiente gran idea
            <br />
            empieza <span className="text-indigo-600">aprendiendo.</span>
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-7 text-slate-500">
            Cursos cortos, ideas que se quedan. Aprende a tu ritmo y convierte
            ese “algún día” en tu primer paso.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-emerald-500" />
              Aprende a tu ritmo
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-emerald-500" />
              Ponlo en práctica
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={14} className="text-emerald-500" />
              Avanza paso a paso
            </span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="absolute inset-5 rounded-full border border-indigo-200/70" />
          <div className="absolute inset-12 rounded-full border border-indigo-200/60" />
          <div className="hero-mini-card top-4 left-4 w-64 rotate-[-5deg]">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="grid size-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                <CodeXml size={18} />
              </span>
              CONSTRUYE TU FUTURO
            </div>
            <div className="rounded-lg bg-slate-900 p-4 font-mono text-[11px] leading-6">
              <span className="text-violet-300">const</span>
              <span className="text-slate-200">
                {" "}
                siguientePaso = () =&gt; {"{"}
              </span>
              <br />
              <span className="text-emerald-300"> aprende();</span>
              <br />
              <span className="text-indigo-300"> crea();</span>
              <br />
              <span className="text-slate-200">{"};"}</span>
            </div>
          </div>
          <div className="hero-mini-card right-0 bottom-10 flex w-55 rotate-[5deg] items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-emerald-50 text-emerald-500">
              <Check size={22} />
            </span>
            <div>
              <strong className="text-sm text-slate-800">¡Un paso más!</strong>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Tu progreso cuenta.
              </p>
            </div>
          </div>
          <span className="absolute bottom-1 left-9 grid size-11 rotate-[-8deg] place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
            <Play size={18} fill="currentColor" />
          </span>
        </div>
      </section>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">
            <BookOpen size={13} />
            EXPLORA NUEVAS POSIBILIDADES
          </p>
          <h2 className="text-2xl font-bold tracking-tight">
            Encuentra tu próximo curso
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Un tema que te inspire. Un formato que se adapte a ti.
          </p>
        </div>
        {user?.rol === "instructor" && (
          <Link
            className="hidden items-center gap-1 text-xs font-semibold text-indigo-600 md:inline-flex"
            to="/instructor/cursos"
          >
            Administrar mis cursos
            <ArrowUpRight size={15} />
          </Link>
        )}
      </div>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-5">
        <div
          className="flex max-w-full flex-wrap gap-2 pb-1"
          aria-label="Filtrar por categoría"
        >
          {["Todas", ...choices].map((category) => {
            const selected = (params.get("categoria") || "Todas") === category;
            return (
              <button
                key={category}
                onClick={() =>
                  filter("categoria", category === "Todas" ? "" : category)
                }
                aria-pressed={selected}
                className={
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all " +
                  (selected
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                    : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-600")
                }
              >
                {category}
              </button>
            );
          })}
        </div>
        <div className="relative w-full sm:w-72">
          <Search
            size={17}
            className="absolute top-3.5 left-3.5 text-slate-400"
          />
          <input
            aria-label="Buscar cursos por título"
            className="form-control !pl-10 !pr-9"
            placeholder="Buscar un curso…"
            maxLength={200}
            value={params.get("q") || ""}
            onChange={(event) => filter("q", event.target.value)}
          />
          {params.get("q") && (
            <button
              className="absolute top-3.5 right-3 text-slate-400"
              aria-label="Limpiar búsqueda"
              onClick={() => filter("q", "")}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>
      <RemoteState resource={courses}>
        {courses.data && (
          <>
            <div className="mb-4 flex items-center justify-between text-xs text-slate-400">
              <span>{courses.data.total} cursos para descubrir</span>
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal size={13} />A tu ritmo
              </span>
            </div>
            {courses.data.data.length ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {courses.data.data.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Tu próxima idea está por aquí"
                description="No encontramos cursos con esos filtros. Prueba con otro título o explora todas las categorías."
                action={
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setParams({})}
                  >
                    Ver todos los cursos
                  </button>
                }
              />
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
