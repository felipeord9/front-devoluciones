import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as FiIcons from "react-icons/fi";
import * as FaIcons from "react-icons/fa";
import AuthContext from "../../context/authContext";
import useUser from "../../hooks/useUser";
import { NavBarData } from "./NavbarData";
import Logo from "../../assets/logo-el-gran-langostino.png";
import "./styles.css";

export default function Navbar() {
  const { isLogged, logout } = useUser();
  const [showSideBar, setShowSidebar] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleClickImg = (e) => {
    if(user.role==='aprobador'){
      return navigate('/solicitudes')
    }else{
      return navigate('/inicio')
    }
  }

  return (
    <>
      {isLogged && (
        <div
          className="position-fixed shadow w-100"
          style={{ fontSize: 11, left: 0, height: "50px", zIndex: 2 , backgroundColor:'#dcdcdc'}}
        >
          <div className="d-flex flex-row justify-content-between align-items-center w-100 h-100 px-4 shadow">
            <div
              id="logo-header"
              className="d-flex flex-row align-items-center gap-2"
            >
              <span className="menu-bars m-0" style={{ cursor: "pointer" }}>
                <FaIcons.FaBars
                  className="text-danger"
                  onClick={(e) => setShowSidebar(!showSideBar)}
                />
              </span>
              <img
                src={Logo}
                width={100}
                className="navbar-img"
                /* onClick={(e) => navigate("/inicio")} */
                onClick={(e)=>handleClickImg(e)}
                alt=""
                style={{ cursor: "pointer" }}
              />
            </div>

            <div className="d-flex flex-row align-items-center">
              <div
                className="d-flex align-items-center position-relative bg-danger rounded-pill p-2 pe-4"
                style={{ right: "-20px", height: 25 }}
              >
                <span className="text-light text-nowrap m-0">{user.name}</span>
              </div>
              <div
                id="btn-session"
                className="dropdown"
                style={{ width: "40px", height: "40px" }}
              >
                <button
                  className="d-flex align-items-center btn btn-danger rounded-circle w-100 h-100 m-0 p-0 border border-2 border-light overflow-hidden"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  data-bs-offset="0,10"
                >
                  <FaIcons.FaUser className="w-100" />
                </button>
                <ul
                  className="dropdown-menu text-center p-0 rounded-3"
                  style={{ width: "250px" }}
                >
                  <li className="border-bottom">
                    <p className="fw-bold mt-1 mb-1">
                      {user.role.toUpperCase()}
                    </p>
                  </li>
                  <li style={{ cursor: "pointer" }} className="border-bottom">
                    <Link
                      to="/cambiar/contrasena"
                      className="text-decoration-none"
                    >
                      <p className="dropdown-item fw-bold m-0">
                        CAMBIAR CONTRASEÑA
                      </p>
                    </Link>
                  </li>
                  <li style={{ cursor: "pointer" }} onClick={(e) => logout()}>
                    <p className="d-flex justify-content-center align-items-center gap-2 dropdown-item fw-bold text-danger m-0">
                      CERRAR SESIÓN
                      <FiIcons.FiLogOut />
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <nav
            className={showSideBar ? "bg-light nav-menu active" : "nav-menu"}
          >
            <ul
              className="nav-menu-items"
              onClick={(e) => setShowSidebar(!showSideBar)}
            >
              {NavBarData.map((item, index) => {
                if (item.access.includes(user.role)) {
                  return (
                    <li key={index} className={item.cName}>
                      <Link to={item.path}>
                        {item.icon}
                        <span>{item.title}</span>
                      </Link>
                    </li>
                  );
                }
              })}
            </ul>
            <ul
              className="nav-menu-items"
              onClick={(e) => setShowSidebar(!showSideBar)}
            >
              <li className="text-center text-secondary">
                <span className="m-0">Gran Langostino S.A.S - v3.0.0</span>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
