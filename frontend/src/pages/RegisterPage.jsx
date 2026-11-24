import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { api } from "../services/api";
import AuthLayout from "../layouts/AuthLayout";
import AuthField from "../components/AuthField";
import { ErrorNotice } from "../components/RemoteState";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "estudiante",
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  function change(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }
  async function submit(event) {
    event.preventDefault();
    const validation = {};
    if (!form.nombre.trim()) validation.nombre = "Cuéntanos cómo te llamas.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      validation.email = "Escribe un correo válido.";
    if (Array.from(form.password).length < 8)
      validation.password = "Usa al menos 8 caracteres.";
    else if (new TextEncoder().encode(form.password).length > 72)
      validation.password = "La contraseña admite hasta 72 bytes.";
    setErrors(validation);
    if (Object.keys(validation).length) return;
    setBusy(true);
    setError(null);
    try {
      await api.post("/auth/register", form);
      navigate("/login", { state: { registered: true } });
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthLayout
      title="Da tu primer paso."
      description="Crea tu cuenta y encuentra tu próxima posibilidad."
      footer={
        <>
          ¿Ya tienes una cuenta?{" "}
          <Link className="font-semibold text-indigo-600" to="/login">
            Inicia sesión
          </Link>
        </>
      }
    >
      <ErrorNotice error={error} />
      <form onSubmit={submit} noValidate>
        <div
          className="mb-6 grid grid-cols-2 gap-3"
          role="group"
          aria-label="Selecciona tu rol"
        >
          {[
            {
              rol: "estudiante",
              Icon: BookOpen,
              label: "Soy estudiante",
              description: "Quiero aprender",
            },
            {
              rol: "instructor",
              Icon: GraduationCap,
              label: "Soy instructor",
              description: "Quiero compartir",
            },
          ].map(({ rol, Icon, label, description }) => (
            <button
              type="button"
              key={rol}
              aria-pressed={form.rol === rol}
              onClick={() => setForm({ ...form, rol })}
              className={
                "rounded-xl border p-4 text-left transition-all " +
                (form.rol === rol
                  ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                  : "border-slate-200 hover:border-indigo-200")
              }
            >
              <Icon
                size={22}
                className={
                  form.rol === rol ? "text-indigo-600" : "text-slate-400"
                }
              />
              <strong className="mt-3 block text-xs font-semibold">
                {label}
              </strong>
              <span className="mt-1 block text-[11px] text-slate-400">
                {description}
              </span>
            </button>
          ))}
        </div>
        <AuthField
          name="nombre"
          label="Nombre completo"
          Icon={UserRound}
          value={form.nombre}
          onChange={change}
          error={errors.nombre}
          autoComplete="name"
          maxLength={120}
          placeholder="¿Cómo te llamas?"
        />
        <AuthField
          name="email"
          label="Correo electrónico"
          Icon={Mail}
          value={form.email}
          onChange={change}
          error={errors.email}
          type="email"
          autoComplete="email"
          maxLength={254}
          placeholder="tu@correo.com"
        />
        <AuthField
          name="password"
          label="Contraseña"
          Icon={LockKeyhole}
          value={form.password}
          onChange={change}
          error={errors.password}
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
        />
        <button className="btn btn-primary w-full" disabled={busy}>
          {busy ? "Creando cuenta…" : "Crear mi cuenta"}
          <ArrowRight size={16} />
        </button>
      </form>
    </AuthLayout>
  );
}
