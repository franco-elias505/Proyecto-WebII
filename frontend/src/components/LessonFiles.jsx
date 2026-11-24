import { useState } from "react";
import { api } from "../services/api";
import { useResource } from "../hooks/useResource";
import { ErrorNotice, RemoteState } from "./RemoteState";

export function FileList({ lessonId, files, editable = false, onChanged }) {
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  async function act(file, remove) {
    if (remove && !window.confirm("¿Eliminar este adjunto?")) return;
    setError(null);
    setBusy(true);
    try {
      if (remove) {
        await api.delete(`/lecciones/${lessonId}/archivos/${file.id}`);
        onChanged();
      } else await api.download(lessonId, file);
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <ErrorNotice error={error} />
      <ul className="file-list">
        {files.map((file) => (
          <li key={file.id}>
            <div className="flex-1">
              <strong>{file.nombre_original}</strong>
              <span className="block text-slate-500 text-xs">
                {Math.ceil(file.tamano / 1024)} KB
              </span>
            </div>
            <button
              className="btn btn-outline-primary btn-sm"
              disabled={busy}
              onClick={() => act(file, false)}
            >
              Descargar
            </button>
            {editable && (
              <button
                className="btn btn-outline-danger btn-sm"
                disabled={busy}
                onClick={() => act(file, true)}
              >
                Eliminar
              </button>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

export default function LessonFiles({ lessonId }) {
  const lesson = useResource("/lecciones/" + lessonId);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  async function upload(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const file = form.elements.archivo.files[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      setError("El archivo supera los 25 MB.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.post(
        "/lecciones/" + lessonId + "/archivos",
        new FormData(form),
      );
      form.reset();
      lesson.reload();
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="rounded-xl border border-slate-200 p-4">
      <h3>Material de apoyo</h3>
      <p className="text-slate-500">
        PDF, PNG, JPEG, MP4 o WebM. Máximo 25 MB por archivo.
      </p>
      <ErrorNotice error={error} />
      <form onSubmit={upload} className="my-4 flex flex-wrap gap-3">
        <label className="sr-only" htmlFor="lesson-file">
          Archivo adjunto
        </label>
        <input
          className="form-control min-w-0 flex-1"
          id="lesson-file"
          name="archivo"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.mp4,.webm"
          required
          disabled={busy}
        />
        <button className="btn btn-outline-primary" disabled={busy}>
          {busy ? "Subiendo…" : "Subir archivo"}
        </button>
      </form>
      <RemoteState resource={lesson}>
        {lesson.data && (
          <FileList
            lessonId={lessonId}
            files={lesson.data.archivos}
            editable
            onChanged={lesson.reload}
          />
        )}
      </RemoteState>
    </section>
  );
}
