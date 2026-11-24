import { useState } from "react";
import { api } from "../services/api";
import { ErrorNotice } from "./RemoteState";

export default function LessonForm({ lesson, courseId, onSaved, onCancel }) {
  const [form, setForm] = useState({
    titulo: lesson?.titulo || "",
    tipo: lesson?.tipo || "contenido",
    contenido: lesson?.contenido || "",
    videoUrl: lesson?.video_url || "",
    notaMinima: lesson?.nota_minima ?? 60,
  });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }
  async function save(event) {
    event.preventDefault();
    setError(null);
    const data = { titulo: form.titulo.trim(), tipo: form.tipo };
    if (form.tipo === "contenido") {
      if (!form.contenido.trim() && !form.videoUrl.trim()) {
        setError("Agrega texto o un enlace a video.");
        return;
      }
      if (form.videoUrl && !/^https?:\/\//i.test(form.videoUrl)) {
        setError("El video debe usar http o https.");
        return;
      }
      data.contenido = form.contenido.trim() || null;
      data.videoUrl = form.videoUrl.trim() || null;
    } else data.notaMinima = Number(form.notaMinima);
    setBusy(true);
    try {
      const result = lesson
        ? await api.put("/lecciones/" + lesson.id, data)
        : await api.post("/cursos/" + courseId + "/lecciones", data);
      onSaved(result);
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save} className="space-y-4">
      <h3>{lesson ? "Editar lección" : "Nueva lección"}</h3>
      <ErrorNotice error={error} />
      <fieldset disabled={busy}>
        <label htmlFor="lesson-title" className="form-label">
          Título
        </label>
        <input
          id="lesson-title"
          className="form-control mb-5"
          name="titulo"
          value={form.titulo}
          onChange={change}
          required
          maxLength={200}
        />
        <label htmlFor="lesson-type" className="form-label">
          Tipo
        </label>
        <select
          id="lesson-type"
          className="form-select mb-5"
          name="tipo"
          value={form.tipo}
          onChange={change}
          disabled={!!lesson}
        >
          <option value="contenido">Contenido</option>
          <option value="cuestionario">Cuestionario</option>
        </select>
        {form.tipo === "contenido" ? (
          <>
            <label htmlFor="lesson-content" className="form-label">
              Contenido de la lección
            </label>
            <textarea
              id="lesson-content"
              className="form-control mb-5"
              name="contenido"
              value={form.contenido}
              onChange={change}
              rows={7}
              maxLength={100000}
            />
            <label htmlFor="lesson-video" className="form-label">
              Enlace a video (opcional)
            </label>
            <input
              id="lesson-video"
              className="form-control mb-5"
              name="videoUrl"
              value={form.videoUrl}
              onChange={change}
              type="url"
              maxLength={2048}
              placeholder="https://…"
            />
          </>
        ) : (
          <>
            <label htmlFor="lesson-grade" className="form-label">
              Nota mínima de aprobación
            </label>
            <input
              id="lesson-grade"
              className="form-control mb-5"
              name="notaMinima"
              value={form.notaMinima}
              onChange={change}
              type="number"
              min="0"
              max="100"
              step="0.01"
              required
            />
            <p className="text-slate-500 mb-5">
              Define una meta clara de aprobación para esta lección.
            </p>
          </>
        )}
        <div className="flex gap-3">
          <button className="btn btn-primary" type="submit">
            {busy ? "Guardando…" : "Guardar lección"}
          </button>
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={onCancel}
          >
            Cancelar
          </button>
        </div>
      </fieldset>
    </form>
  );
}
