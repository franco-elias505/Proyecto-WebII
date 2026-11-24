import { useNavigate } from 'react-router-dom'
import '../styles/Auth.css'

function HomePage() {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  return (
    <div className="home-container">
      <nav className="home-nav">
        <h2 className="nav-brand">MiniAula</h2>
        <div className="nav-right">
          <span className="nav-user">
            Hola, <strong>{usuario.nombre || 'Usuario'}</strong>
            <span className="nav-rol">{usuario.rol || ''}</span>
          </span>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main className="home-main">
        <div className="welcome-card">
          <h1>Bienvenido a MiniAula</h1>
          <p>Plataforma de cursos en línea</p>
          <div className="home-info">
            <div className="info-item">
              <span className="info-label">Nombre</span>
              <span className="info-value">{usuario.nombre || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{usuario.email || '-'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Rol</span>
              <span className="info-value">{usuario.rol || '-'}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default HomePage
