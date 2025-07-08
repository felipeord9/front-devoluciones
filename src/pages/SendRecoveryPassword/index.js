import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useUser from '../../hooks/useUser';
import { sendRecovery } from '../../services/authService';
import Logo from '../../assets/logo-el-gran-langostino.png'
import './styles.css'

export default function SendRecoveryPassword() {
  const { isLogged } = useUser()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (isLogged) navigate('/inicio');
  }, [isLogged, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault()
    sendRecovery(email)
      .then((data) => {
        Swal.fire({
          title: "¡CORECTO!",
          text: "El correo de recuperación fue enviado de manera exitosa",
          icon: 'success',
          confirmButtonText: "Aceptar"
        })
        navigate('/login')
      })
      .catch((error) => {
        setError(error)
        setTimeout(() => setError(''), 2500)
      })
  }

  return (
    <div className='d-flex justify-content-center align-items-center h-100 w-100 m-auto'>
      <div className='card p-5 border border-4 shadow rounded-4 m-auto' style={{ maxWidth: 370}}>
        <div className='mb-3 p-2'>
          <img src={Logo} className='w-100' alt='logo' />
        </div>
        <form className='d-flex flex-column gap-3' style={{fontSize: 13.5}} onSubmit={handleSubmit}>
          <div>
            <label className='fw-bold w-100'>Correo electrónico</label>
            <input
              type='email'
              value={email}
              className='form-control form-control-sm shadow-sm'
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button 
            type='submit'
            className='text-light btn btn-sm' 
            style={{ backgroundColor: '#FF5757'}}
          >
            Obtener token de recuperación
          </button>
        </form>
        <span className='text-center text-danger text-rowrap w-100 m-0 my-2' style={{height: 0}}>{error.message}</span>
        <Link to="/login" className='text-decoration-none text-center mt-3 w-100'>Volver al login</Link>
      </div>
    </div>
  )
}