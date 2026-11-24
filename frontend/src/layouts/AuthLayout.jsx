import { Check, Sparkles, GraduationCap, CodeXml } from "lucide-react";
import { AppNavbar } from "./AppLayout";

export default function AuthLayout({ title, description, children, footer }) {
  return (
    <>
      <AppNavbar />
      <main className="grid min-h-[calc(100vh-80px)] lg:grid-cols-2">
        <section className="relative hidden overflow-hidden bg-[#151c3b] p-14 text-white lg:flex lg:flex-col lg:justify-between xl:p-20">
          <div className="absolute -top-24 -right-36 size-[550px] rounded-full border border-white/5 bg-indigo-500/5" />
          <div className="absolute -bottom-32 -left-20 size-[450px] rounded-full border border-white/10" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-semibold tracking-widest text-indigo-200">
              <Sparkles size={12} />
              TU CURIOSIDAD TIENE UN LUGAR
            </span>
            <h2 className="mt-10 max-w-md text-[44px] leading-[1.15] font-semibold tracking-[-0.04em]">
              Todo lo que puedes ser
              <br />
              empieza con lo que
              <br />
              <span className="text-indigo-300">te animas a aprender.</span>
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-7 text-indigo-100/60">
              Un espacio para explorar, equivocarte y descubrir de lo que eres
              capaz. Una pequeña lección a la vez.
            </p>
          </div>
          <div className="relative my-12 rotate-[-3deg] rounded-2xl border border-white/15 bg-white/5 p-6 shadow-2xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-indigo-400/20 text-indigo-200">
                <CodeXml size={21} />
              </span>
              <div>
                <strong className="text-sm font-medium">
                  Mi próxima gran idea
                </strong>
                <p className="mt-1 text-xs text-indigo-200/50">
                  Aprender. Practicar. Crear.
                </p>
              </div>
              <span className="ml-auto rounded-full bg-emerald-400/15 p-1.5 text-emerald-300">
                <Check size={16} />
              </span>
            </div>
            <div className="mb-2 flex justify-between text-[10px] text-indigo-200/60">
              <span>Cada paso cuenta</span>
              <span>Tu ritmo, tu camino</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10">
              <div className="h-full w-3/4 rounded-full bg-linear-to-r from-indigo-400 to-emerald-300" />
            </div>
          </div>
          <div className="relative flex items-center gap-2 text-xs text-indigo-200/40">
            <GraduationCap size={17} />
            MiniAula · Grandes posibilidades, pequeños pasos.
          </div>
        </section>
        <section className="flex items-center justify-center bg-white px-6 py-14 sm:px-12">
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-3 mb-8 text-sm leading-6 text-slate-500">
              {description}
            </p>
            {children}
            <div className="mt-7 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
              {footer}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
