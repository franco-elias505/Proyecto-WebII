import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../styles/Auth.css'

function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'estudiante',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Error al registrar el usuario.')
        return
      }

      // Registro exitoso, redirigir al login
      navigate('/login', { state: { registered: true } })
    } catch {
      setError('Error de conexión con el servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Crear Cuenta</h2>
          <p>Completa tus datos para registrarte</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo</label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              placeholder="Tu nombre completo"
              value={form.nombre}
              onChange={handleChange}
              required
              maxLength={120}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="correo@ejemplo.com"
              value={form.email}
              onChange={handleChange}
              required
              maxLength={254}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
              maxLength={72}
            />
          </div>

          <div className="form-group">
            <label htmlFor="rol">Rol</label>
            <select
              id="rol"
              name="rol"
              value={form.rol}
              onChange={handleChange}
            >
              <option value="estudiante">Estudiante</option>
              <option value="instructor">Instructor</option>
            </select>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
