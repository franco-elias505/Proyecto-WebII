import { AlertCircle, RotateCcw } from "lucide-react";
import { EmptyState, PaginationControl } from "./ui";

export function ErrorNotice({ error }) {
  return error ? (
    <div role="alert" className="alert alert-danger flex items-start gap-3">
      <AlertCircle className="mt-0.5 shrink-0" size={18} />
      <span>{error.message || error}</span>
    </div>
  ) : null;
}
export function SkeletonCards() {
  return (
    <div
      className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      role="status"
      aria-label="Cargando contenido"
    >
      {[1, 2, 3].map((id) => (
        <div
          key={id}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <div className="skeleton h-44 rounded-none" />
          <div className="space-y-4 p-6">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-5 w-4/5" />
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-2/3" />
            <div className="skeleton mt-6 h-8 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
export function RemoteState({ resource, children }) {
  if (resource.loading) return <SkeletonCards />;
  if (resource.error)
    return (
      <>
        <ErrorNotice error={resource.error} />
        <EmptyState
          title="Vamos a intentarlo de nuevo"
          description="No pudimos cargar esta información. Revisa la conexión y vuelve a intentarlo."
          action={
            <button
              className="btn btn-outline-secondary"
              onClick={resource.reload}
            >
              <RotateCcw size={16} />
              Reintentar
            </button>
          }
        />
      </>
    );
  return children;
}
export const Pagination = PaginationControl;
