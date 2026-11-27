import { useEffect, useState } from "react";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  FileQuestion,
  HelpCircle,
  RotateCcw,
  Send,
  XCircle,
} from "lucide-react";
import { api } from "../services/api";
import { Badge, ProgressBar } from "./ui";

export default function QuizView({ lesson, onCompleted }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quizData, setQuizData] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get(`/lecciones/${lesson.id}/cuestionario`);
      setQuizData(data);
    } catch (err) {
      setError(err.message || "Error al cargar las preguntas del cuestionario.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
    setResult(null);
    setSelectedAnswers({});
  }, [lesson.id]);

  const handleSelect = (questionId, optionIndex) => {
    if (result?.aprobado) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!quizData?.preguntas?.length) return;

    const respuestas = Object.entries(selectedAnswers).map(
      ([pregunta_id, opcion_seleccionada]) => ({
        pregunta_id: Number(pregunta_id),
        opcion_seleccionada: Number(opcion_seleccionada),
      }),
    );

    if (respuestas.length < quizData.preguntas.length) {
      setError("Por favor responde todas las preguntas antes de enviar.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const response = await api.post(
        `/lecciones/${lesson.id}/cuestionario/responder`,
        { respuestas },
      );
      setResult(response);
      if (response.completada && onCompleted) {
        onCompleted();
      }
      // Refresh quiz state to update attempts and best grade
      const updated = await api.get(`/lecciones/${lesson.id}/cuestionario`);
      setQuizData(updated);
    } catch (err) {
      setError(err.message || "Error al calificar el cuestionario.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 py-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        <p className="text-sm text-slate-500">Cargando cuestionario...</p>
      </div>
    );
  }

  if (error && !quizData) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
        <AlertCircle size={24} className="mx-auto mb-2 text-rose-500" />
        <p className="font-semibold">{error}</p>
        <button
          onClick={fetchQuiz}
          className="btn btn-secondary mt-4 inline-flex text-xs"
        >
          <RotateCcw size={14} />
          Reintentar carga
        </button>
      </div>
    );
  }

  const questions = quizData?.preguntas || [];
  const progress = quizData?.progreso || {};
  const minGrade = quizData?.leccion?.nota_minima ?? 70;
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const isOutOfAttempts = progress.intentos >= 3 && !progress.completada;

  return (
    <div className="space-y-8">
      {/* Quiz Header & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-5">
        <div>
          <div className="flex items-center gap-2">
            <FileQuestion size={18} className="text-indigo-600" />
            <h3 className="font-bold text-slate-900">Evaluación de la lección</h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Nota mínima requerida: <strong>{minGrade} / 100</strong>. Tienes hasta 3 intentos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone={progress.completada ? "green" : "indigo"}>
            {progress.completada ? "Aprobado" : `Intento ${progress.intentos} de 3`}
          </Badge>
          {progress.mejor_nota !== null && (
            <span className="text-xs font-semibold text-slate-600">
              Mejor nota: {progress.mejor_nota}/100
            </span>
          )}
        </div>
      </div>

      {/* Result Alert if just submitted */}
      {result && (
        <div
          className={`rounded-2xl border p-6 text-sm ${
            result.aprobado
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          <div className="flex items-start gap-4">
            {result.aprobado ? (
              <CheckCircle2 size={24} className="mt-0.5 shrink-0 text-emerald-600" />
            ) : (
              <XCircle size={24} className="mt-0.5 shrink-0 text-rose-600" />
            )}
            <div className="flex-1">
              <h4 className="text-base font-bold">
                {result.aprobado
                  ? "¡Felicitaciones! Has aprobado el cuestionario"
                  : "No has alcanzado la nota mínima requerida"}
              </h4>
              <p className="mt-1 text-xs leading-5">
                Obtuviste <strong>{result.nota}/100</strong> ({result.respuestas_correctas} de{" "}
                {result.total_preguntas} respuestas correctas).
                {result.aprobado
                  ? " Ya puedes continuar con la siguiente lección."
                  : result.intentos_restantes > 0
                    ? ` Te quedan ${result.intentos_restantes} intento(s) disponible(s). Puedes volver a intentarlo.`
                    : " Has utilizado todos tus intentos permitidos."}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Questions list */}
      {questions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          <HelpCircle size={24} className="mx-auto mb-2 text-slate-400" />
          Este cuestionario aún no tiene preguntas publicadas.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  Pregunta {idx + 1} de {totalQuestions}
                </span>
                {selectedAnswers[q.id] !== undefined && (
                  <span className="text-xs font-medium text-indigo-600">
                    Respondida
                  </span>
                )}
              </div>
              <h4 className="text-base font-bold text-slate-900 leading-snug">
                {q.enunciado}
              </h4>
              <div className="mt-4 space-y-2.5">
                {q.opciones.map((opcion, optIdx) => {
                  const isSelected = selectedAnswers[q.id] === optIdx;
                  return (
                    <label
                      key={optIdx}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm transition ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={optIdx}
                        checked={isSelected}
                        onChange={() => handleSelect(q.id, optIdx)}
                        disabled={submitting || isOutOfAttempts}
                        className="size-4 text-indigo-600 accent-indigo-600"
                      />
                      <span>{opcion}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Submission footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-xs text-slate-500">
              {answeredCount} de {totalQuestions} respondidas
            </span>
            <button
              type="submit"
              disabled={
                submitting ||
                answeredCount < totalQuestions ||
                isOutOfAttempts
              }
              className="btn btn-primary cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                "Calificando..."
              ) : isOutOfAttempts ? (
                "Intentos agotados"
              ) : (
                <>
                  <Send size={15} />
                  Enviar respuestas
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
