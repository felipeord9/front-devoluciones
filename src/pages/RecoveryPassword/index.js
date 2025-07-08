import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import InputPassword from '../../components/InputPassword';
import useUser from '../../hooks/useUser';
import { changeRecoveryPassword } from '../../services/authService';
import Logo from '../../assets/logo-el-gran-langostino.png'
import './styles.css'

export default function RecoveryPassword() {
    const { isLogged } = useUser()
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [errorInput, setErrorInput] = useState('')
    const { token } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
      if (isLogged) navigate('/inicio');
    }, [isLogged, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault()
    if(newPassword !== confirmNewPassword) {
      setErrorInput('La contraseña nueva no coincide')
      return setTimeout(() => setErrorInput (''), 3000)
    }
    changeRecoveryPassword({token, newPassword})
      .then((data) => {
        Swal.fire({
          title: "¡CORECTO!",
          text: "La contraseña se ha cambiado exitosamente.",
          icon: 'success',
          confirmButtonText: "Aceptar",
          timer: 3000
        })
        navigate('/login')
      })
      .catch((error) => {
        setErrorInput('El token ha expirado, será redirigido al login')
        return setTimeout(() => navigate('/login'), 4000)
      })
  }

  return (
    <div className='d-flex justify-content-center align-items-center h-100 w-100 m-auto'>
      <div className='card p-5 border border-4 shadow rounded-4 m-auto' style={{ maxWidth: 400}}>
        <div className='mb-3 p-2'>
          <img src={Logo} className='w-100' alt='logo' />
        </div>
        <form className='d-flex flex-column gap-3' style={{fontSize: 13.5}} onSubmit={handleSubmit}>
        <div>
            <InputPassword
              id="new-password"
              label="Nueva Contraseña"
              password={newPassword}
              setPassword={setNewPassword}
            />
          </div>
          <div>
            <InputPassword
              id="confirm-new-password"
              label="Repite la Nueva Contraseña"
              password={confirmNewPassword}
              setPassword={setConfirmNewPassword}
            />
          </div>
          <button 
            type='submit'
            className='text-light btn btn-sm' 
            style={{ backgroundColor: '#FE7F20'}}
          >
            Recuperar contraseña
          </button>
        </form>
        <span className="text-center text-danger m-0 mt-2" style={{ fontSize: 13, height: 0 }}>{errorInput}</span>
      </div>
    </div>
  )
}