import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../layouts/AuthLayout";
import AuthField from "../components/AuthField";
import { ErrorNotice } from "../components/RemoteState";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      validation.email = "Escribe un correo válido.";
    if (!form.password) validation.password = "Escribe tu contraseña.";
    setErrors(validation);
    if (Object.keys(validation).length) return;
    setBusy(true);
    setError(null);
    try {
      const data = await api.post("/auth/login", form);
      login(data);
      navigate(
        location.state?.from ||
          (data.usuario.rol === "instructor"
            ? "/instructor/cursos"
            : "/cursos"),
      );
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthLayout
      title="Qué bueno verte de nuevo."
      description="Tu siguiente lección te está esperando."
      footer={
        <>
          ¿Primera vez por aquí?{" "}
          <Link className="font-semibold text-indigo-600" to="/register">
            Crea tu cuenta
          </Link>
        </>
      }
    >
      {location.state?.registered && (
        <div className="alert alert-success">
          Tu cuenta está lista. Ya puedes iniciar sesión.
        </div>
      )}
      <ErrorNotice error={error} />
      <form onSubmit={submit} noValidate>
        <AuthField
          label="Correo electrónico"
          name="email"
          Icon={Mail}
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={change}
          error={errors.email}
          placeholder="tu@correo.com"
        />
        <AuthField
          label="Contraseña"
          name="password"
          Icon={LockKeyhole}
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={change}
          error={errors.password}
          placeholder="Tu contraseña"
        />
        <button className="btn btn-primary mt-2 w-full" disabled={busy}>
          {busy ? "Entrando…" : "Iniciar sesión"}
          <ArrowRight size={16} />
        </button>
      </form>
    </AuthLayout>
  );
}
