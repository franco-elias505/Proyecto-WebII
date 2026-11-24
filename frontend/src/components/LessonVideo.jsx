import { BookOpen, ExternalLink, Play, Sparkles } from "lucide-react";

export default function LessonVideo({ lesson }) {
  const url = lesson.video_url;
  let parsed;
  try {
    parsed = url ? new URL(url) : null;
  } catch {
    parsed = null;
  }
  if (parsed && !["https:", "http:"].includes(parsed.protocol)) parsed = null;
  const youtubeId =
    parsed?.hostname === "youtu.be"
      ? parsed.pathname.slice(1)
      : ["www.youtube.com", "youtube.com"].includes(parsed?.hostname)
        ? parsed.searchParams.get("v")
        : null;
  if (youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(youtubeId))
    return (
      <div className="mb-8 aspect-video overflow-hidden rounded-xl bg-slate-950">
        <iframe
          title={lesson.titulo}
          className="h-full w-full"
          src={"https://www.youtube-nocookie.com/embed/" + youtubeId}
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  if (parsed && /\.(mp4|webm)$/i.test(parsed.pathname))
    return (
      <video
        className="mb-8 aspect-video w-full rounded-xl bg-slate-950"
        controls
        preload="metadata"
        src={parsed.href}
      >
        <track kind="captions" />
      </video>
    );
  return (
    <div className="relative mb-8 flex aspect-video flex-col items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-[#17213f] to-[#343c79] p-6 text-center text-white">
      <div className="cover-grid" />
      <span className="mb-5 grid size-16 place-items-center rounded-2xl border border-white/20 bg-white/5 text-indigo-200">
        {parsed ? <Play size={26} /> : <BookOpen size={28} />}
      </span>
      <p className="text-xs font-medium tracking-widest text-indigo-200/60 uppercase">
        {parsed ? "Video de la lección" : "Un concepto, muchas posibilidades"}
      </p>
      <h2 className="mt-3 max-w-sm text-xl font-semibold tracking-tight">
        {lesson.titulo}
      </h2>
      {parsed ? (
        <a
          className="mt-5 inline-flex items-center gap-1.5 text-xs text-indigo-200"
          href={parsed.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir video
          <ExternalLink size={13} />
        </a>
      ) : (
        <span className="mt-4 flex items-center gap-1.5 text-[11px] text-indigo-200/50">
          <Sparkles size={12} />
          Lectura guiada · A tu ritmo
        </span>
      )}
    </div>
  );
}
