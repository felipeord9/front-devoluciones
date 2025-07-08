import { useState, useEffect , useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import InputPassword from "../../components/InputPassword";
import useUser from "../../hooks/useUser";
import AuthContext from "../../context/authContext";
import Logo from "../../assets/logo-el-gran-langostino.png";
import "./styles.css";

export default function Login() {
  const { login, isLoginLoading, hasLoginError, isLogged } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  useEffect(() => {
    /* if (isLogged) navigate("/inicio"); */
    if (
      isLogged && user.role==='admin' || isLogged && user.role==='Autorizador clientes' ||
      isLogged && user.role==='supervisor' || isLogged && user.role==='solicitante' ||
      isLogged && user.role==='logistica' || isLogged && user.role==='Autorizador agencias'
     ){
      navigate('/inicio')
    }
  }, [isLogged, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if(email !== '' && password !== ''){
      login({email,password})
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center h-100 w-100 m-auto">
      <div
        className="card p-5 border border-4 shadow rounded-4 m-auto"
        style={{ maxWidth: 370 }}
      >
        <div className="mb-3 p-2">
          <img src={Logo} className="w-100" alt="logo" />
        </div>
        <form
          className="d-flex flex-column gap-2"
          style={{ fontSize: 13.5 }}
          onSubmit={handleLogin}
        >
          <div>
            <label className="fw-bold">Nombre de usuario</label>
            <input
              type="text"
              value={email}
              className="form-control form-control-sm shadow-sm"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <InputPassword
              label="Contraseña"
              password={password}
              setPassword={setPassword}
            />
          </div>
          <button
            type="submit"
            className="text-light btn btn-sm"
            style={{ backgroundColor: "#FF5757" }}
          >
            Ingresar
          </button>
        </form>
        {isLoginLoading && <div className="loading">Cargando...</div>}
        {hasLoginError && (
          <div className="text-danger text-center mt-2">
            Usuario o contraseña incorrectos
          </div>
        )}
        <Link
          to="/enviar/recuperacion"
          className="text-primary text-center text-decoration-none mt-2"
        >
          ¿Olvidó su contraseña?
        </Link>
      </div>
    </div>
  );
}
