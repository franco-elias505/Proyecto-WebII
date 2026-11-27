import { useState } from "react";
import {
  GraduationCap,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Menu,
  X,
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Avatar } from "../components/ui";

export function AppNavbar() {
  const { user, logout } = useAuth();
  const [menu, setMenu] = useState(false);
  const [mobile, setMobile] = useState(false);
  return (
    <header className="app-header">
      <div className="app-container flex min-h-20 flex-wrap items-center gap-7">
        <Link to="/cursos" className="brand">
          <span>
            <GraduationCap size={23} strokeWidth={1.8} />
          </span>
          Mini<span className="font-normal text-slate-400">Aula</span>
        </Link>
        <nav
          aria-label="Navegación principal"
          className={"nav-links " + (mobile ? "nav-open" : "")}
        >
          <NavLink to="/cursos" onClick={() => setMobile(false)}>
            Catálogo
          </NavLink>
          {user?.rol === "estudiante" && (
            <NavLink to="/mis-cursos" onClick={() => setMobile(false)}>
              Mis cursos
            </NavLink>
          )}
          {user?.rol === "instructor" && (
            <NavLink to="/instructor/cursos" onClick={() => setMobile(false)}>
              Mis cursos
            </NavLink>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                className="avatar-menu-trigger"
                aria-expanded={menu}
                aria-label="Menú de usuario"
                onClick={() => setMenu(!menu)}
              >
                <Avatar name={user.nombre} />
                <span className="hidden text-left text-sm lg:block">
                  <strong className="block text-xs font-semibold text-slate-800">
                    {user.nombre}
                  </strong>
                  <span className="text-[11px] capitalize text-slate-500">
                    {user.rol}
                  </span>
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>
              {menu && (
                <>
                  <button
                    className="fixed inset-0 z-30 cursor-default"
                    aria-label="Cerrar menú de usuario"
                    onClick={() => setMenu(false)}
                  />
                  <div className="avatar-menu">
                    <div className="border-b border-slate-100 px-3 py-3">
                      <strong className="block text-sm">{user.nombre}</strong>
                      <span className="text-xs text-slate-500">
                        {user.email}
                      </span>
                    </div>
                    <Link
                      to={
                        user.rol === "instructor"
                          ? "/instructor/cursos"
                          : "/mis-cursos"
                      }
                      onClick={() => setMenu(false)}
                    >
                      <LayoutDashboard size={16} />
                      Mi espacio
                    </Link>
                    <button
                      onClick={() => {
                        setMenu(false);
                        logout();
                      }}
                    >
                      <LogOut size={16} />
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex gap-3">
              <Link
                className="hidden self-center text-sm font-medium text-slate-600 sm:block"
                to="/login"
              >
                Iniciar sesión
              </Link>
              <Link className="btn btn-primary" to="/register">
                Comenzar gratis
              </Link>
            </div>
          )}
          <button
            className="icon-button md:hidden"
            aria-label="Abrir navegación"
            aria-expanded={mobile}
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default function AppLayout() {
  return (
    <div className="app-shell">
      <AppNavbar />
      <main className="app-container app-main">
        <Outlet />
      </main>
      <footer className="app-container app-footer">
        <Link
          className="flex items-center gap-2 font-semibold text-slate-500"
          to="/cursos"
        >
          <BookOpen size={16} />
          MiniAula
        </Link>
        <span>Pequeñas lecciones. Grandes posibilidades.</span>
        <span className="text-xs">Hecho para aprender.</span>
      </footer>
    </div>
  );
}
