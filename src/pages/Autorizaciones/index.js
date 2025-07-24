import { useState , useContext , useEffect} from "react";
import { verifyTokenById , findOneDevolucion, updateDevolucon } from '../../services/devolucionesService'
import { useParams , useNavigate } from "react-router-dom";
import AuthContext from "../../context/authContext";
import { sendMailAuthorization , sendMailReject } from "../../services/mailService";
import { Modal , Button , Form } from "react-bootstrap";
import Swal from "sweetalert2";
import './styles.css';
import { config } from "../../config";
import { verificarArchivo } from "../../services/evidence";
import { FaFileDownload } from "react-icons/fa";

const styleStatus = {
  "Solicitado": "primary",
  'Autorizado': "warning",
  "Recogido": "info",
  "Finalizado": "success",
  'Rechazado': "danger",
};

export default function Autorizaciones (){
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [reasonReject, setReasonReject] = useState('');
    const [reasonApprove, setReasonApprove] = useState('');
    const [foto, setFoto] = useState(null);
    const [video, setVideo] = useState(null);
    const [evidencia, setEvidencia] = useState([]);

    /* Modal para la razon de rechazo */
    const [modalReject, setModalReject] = useState(false);
    const closeModal = () => {
      setModalReject(false);
    };
    const openModal = () => {
      setModalReject(true);
    };

    //constante para guardar el valor del parametro
    const { token } = useParams();

    useEffect(()=>{
        if(user && (user.role === 'Autorizador agencias' || user.role === 'admin' || user.role === 'Autorizador clientes')){
          verifyTokenById(token)
            .then(async({data})=>{
                const foto = `id_${data.id}.jpg`
                const directFoto = `${config.apiUrl2}/upload/obtener-archivo/${foto}`
                const video = `id_${data.id}.webm`
                const directVideo = `${config.apiUrl2}/upload/obtener-archivo/${video}`
                const url = await verificarArchivo(directVideo)
                const url2 = await verificarArchivo(directFoto)
                if(url){
                  setVideo(url);
                } 
                if(url2){
                  setFoto(url2);
                }
                setSearch(data);
            })
            .catch(()=>{
                findOneDevolucion(token)
                .then(async({data})=> {
                    const foto = `id_${data.id}.jpg`
                    const directFoto = `${config.apiUrl2}/upload/obtener-archivo/${foto}`
                    const video = `id_${data.id}.webm`
                    const directVideo = `${config.apiUrl2}/upload/obtener-archivo/${video}`
                    const url = await verificarArchivo(directVideo)
                    const url2 = await verificarArchivo(directFoto)
                    if(url){
                      setVideo(url);
                    } 
                    if(url2){
                      setFoto(url2);
                    }
                    setSearch(data);
                })
                .catch(()=>{
                    setSearch({})
                    Swal.fire({
                        icon:'warning',
                        title:'¡ATENCIÓN!',
                        text:'Ha ocurrido un error al momento de abrir el vínculo. Vuelve a intentarlo, si el problema persiste comunícate con la auxiliar del fondo de empleados.',
                        confirmButtonText:'OK',
                        confirmButtonColor:'red'
                    })
                    .then(()=>{
                        window.location.href = "about:blank"
                    })
                })
            })
        }else{
            window.location.href = "about:blank"    
        }
    },[])

    const [ search, setSearch ] = useState({});

    //constante de envio
    const [enviando, setEnviando] = useState(false);
    const [rechazando, setRechazando] = useState(false);

    const handlerSubmit = (e) => {
        e.preventDefault();
        // Muestra la barra de carga
        let timerInterval;
        Swal.fire({
            title: 'Registrando...',
            text: 'Por favor, espera mientras se registra la autorización de la solicitud de devolciones y averías...',
            timer: 10000,
            timerProgressBar: true,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
                const timer = Swal.getPopup().querySelector("b");
                timerInterval = setInterval(() => {}, 200);
            },
            willClose: () => {
                clearInterval(timerInterval);
            },
            onBeforeOpen: () => {
                Swal.showLoading();
            },
            showConfirmButton: false,
        });
        setEnviando(true)

        const body = {
            state: 'Autorizado',
            authorizationDate: new Date(),
            solicitan: user.email,
        }

        updateDevolucon(search.id, body)
        .then(({data})=>{
          sendMailAuthorization(data)
          .then(()=>{
            Swal.fire({
                icon:'success',
                title:'¡Felicidades!',
                text:'Se ha registrado la autorización de manera satisfactoria',
                timer:5000,
                showConfirmButton:false,
                showCancelButton:false,
            })
            setEnviando(false)
            handleClear()
            navigate('/inicio')
          })
          .catch(()=>{
            setEnviando(false)
            Swal.fire({
                icon:'warning',
                title:'¡ERROR!',
                text:'Ha ocurrido un error al momento de enviar el correo de notificación, pero el registro se ha marcado como "Autorizado" de manera satisfactoria. Si el problema persiste comunícate con el área de sistemas.',
                showConfirmButton:true,
                confirmButtonColor: '#0101b5',
                showCancelButton:false
            })
        })
        })
        .catch(()=>{
            setEnviando(false)
            Swal.fire({
                icon:'warning',
                title:'¡ERROR!',
                text:'Ha ocurrido un error al momento de hacer esta acción. intenta de nuevo. Si el problema persiste comunícate con el área de sistemas.',
                showConfirmButton:true,
                confirmButtonColor: '#0101b5',
                showCancelButton:false
            })
        })
    }

    const handleReject = (e) => {
      e.preventDefault();
      // Muestra la barra de carga
      let timerInterval;
      Swal.fire({
          title: 'Registrando...',
          text: 'Por favor, espera mientras se registra el rechazo de la solicitud de devolciones y averías...',
          timer: 10000,
          timerProgressBar: true,
          allowOutsideClick: false,
          didOpen: () => {
              Swal.showLoading();
              const timer = Swal.getPopup().querySelector("b");
              timerInterval = setInterval(() => {}, 200);
          },
          willClose: () => {
              clearInterval(timerInterval);
          },
          onBeforeOpen: () => {
              Swal.showLoading();
          },
          showConfirmButton: false,
      });
      setRechazando(true)
      const body = {
        state: 'Rechazado',
        reasonForRejection: reasonReject,
        authorizationDate: new Date(),
        solicitan: user.email,
      }

      updateDevolucon(search.id, body)
      .then(({data})=>{
        sendMailReject(data)
        .then(()=>{
          Swal.fire({
              icon:'success',
              title:'¡Felicidades!',
              text:'Se ha registrado el estado "Rechazado" de manera satisfactoria',
              timer:5000,
              showConfirmButton:false,
              showCancelButton:false,
          })
          setRechazando(false)
          handleClear()
          navigate('/inicio')
        })
        .catch(()=>{
          setRechazando(false)
            Swal.fire({
                icon:'warning',
                title:'¡ERROR!',
                text:'Ha ocurrido un error al momento de enviar el correo de notificación, pero el registro se ha marcado como "Rechazado" de manera satisfactoria. Si el problema persiste comunícate con el área de sistemas.',
                showConfirmButton:true,
                confirmButtonColor: '#0101b5',
                showCancelButton:false
            })
        })
      })
      .catch(()=>{
          setRechazando(false)
          Swal.fire({
              icon:'warning',
              title:'¡ERROR!',
              text:'Ha ocurrido un error al momento de hacer esta acción. intenta de nuevo. Si el problema persiste comunícate con el área de sistemas.',
              showConfirmButton:true,
              confirmButtonColor: '#0101b5',
              showCancelButton:false
          })
      })
    }

    const handleClear = () => {
        setSearch({});
        setEnviando(false);
    };

    
    const formatNumber = (value) => {
        if (!value) return '';
        const formattedValue = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return formattedValue;
    };

    const parseNumber = (value) => {
        return value.replace(/\./g, '');
    };

    return(
    <div
      className="container d-flex flex-column w-100 py-3 mt-5"
      style={{ fontSize: 10.5 }}
    >
      <Modal show={modalReject} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className='d-flex justify-content-center w-100 fw-bold' style={{color:'#FF5757'}}>Razón de rechazo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formWeight">
          <div className="d-flex flex-column mb-1 mt-2">
            <textarea
              id="observations"
              className="form-control"
              placeholder='Escribe aquí la razón por la cual lo vas rechazar.'
              value={reasonReject}
              onChange={(e) => setReasonReject(e.target.value)}
              style={{ minHeight: 70, maxHeight: 100, fontSize: 12 , backgroundColor:'whitesmoke' , textTransform:'uppercase' }}
            ></textarea>
          </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={(e)=>(handleReject(e))}>
            ENVIAR
          </Button>
          <Button variant="danger" onClick={(e)=>(closeModal(e))}>
            CANCELAR
          </Button>
        </Modal.Footer>
      </Modal>
      <h1 className="text-center fs-5 fw-bold">AUTORIZACIÓN DE DEVOLUCIONES Y AVERÍAS</h1>
      <section className="row row-cols-sm-2 justify-content-between align-items-center mb-2">
        <div className="d-flex flex-column">
          <h1 className="fs-6 fw-bold m-0">EL GRAN LANGOSTINO S.A.S.</h1>
          <span className="fw-bold">Nit: 835001216</span>
          <span>Tel: 5584982 - 3155228124</span>
        </div>
        <div className="d-flex flex-column align-items-end">
          <strong className="me-3">Tipo de solicitante</strong>
          <div className="d-flex flex-row align-items-center gap-2">
            <span className={!search.coId && "text-primary"}>Tercero</span>
            <button
              className="position-relative d-flex align-items-center btn bg-body-secondary rounded-pill toggle-container p-0 m-0"
              
            >
              <div
                className={
                  !search.coId
                    ? "d-flex align-items-center justify-content-center position-absolute bg-primary rounded-circle toggle"
                    : "d-flex align-items-center justify-content-center position-absolute bg-success   rounded-circle toggle active"
                }
                
              ></div>
            </button>
            <span style={{margin:0, padding:0}} className={search.coId ? "text-success" : undefined}>
              Agencia
            </span>
          </div>
        </div>
      </section>
      {/* <form className="" onSubmit={(e)=>handleSubmit(e)}> */}
        <div className="bg-light rounded shadow-sm p-3 mb-3">
          <div className="d-flex flex-column gap-1">
            {search.coId !== null ?
              <div>
                {/* Centro de operación */}
              <label className="fw-bold">CENTRO DE OPERACIÓN</label>
              <input
                id="idCliente"
                type="text"
                value={`${search.coId}-${search.coDescription}`}
                className="form-control form-control-sm"
                placeholder="Buscar por NIT/Cédula"
                disabled
              />
              </div>
              :
              <div>
                <div>
                  {/* Cliente y vendedor*/}
                  <label className="fw-bold">CLIENTE</label>
                  <div className="row row-cols-sm-2">
                    <div className="d-flex flex-column align-items-start">
                      <label>NIT/Cédula:</label>
                      <input
                        id="idCliente"
                        type="number"
                        value={search.clientId}
                        className="form-control form-control-sm"
                        disabled
                      />
                    </div>
                    <div className="d-flex flex-column align-items-start">
                      <label>Razón Social:</label>
                      <input
                        id="idCliente"
                        type="text"
                        value={search.clientDescription}
                        className="form-control form-control-sm"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="my-1">
                    <label className="fw-bold">SUCURSAL</label>
                    <input
                        id="idCliente"
                        type="text"
                        value={`${search.branchId} - ${search.branchDescription}`}
                        className="form-control form-control-sm"
                        disabled
                      />
                  </div>
                </div>
                <hr className="my-1" />
                <div>
                  <label className="fw-bold">VENDEDOR</label>
                  <div className="row">
                    <div className="d-flex flex-column align-items-start">
                      <input
                        id="idVendedor"
                        type="text"
                        value={search.sellerDescription}
                        className="form-control form-control-sm w-100"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
            }

            <hr className="my-1" />
            <div className="row row-cols-sm-2">
              <div className="">
                <label className="fw-bold">FECHA CREACIÓN SOLICITUD</label>
                <input
                  id="createdAt"
                  type="date"
                  className="form-control form-control-sm"
                  value={search.createdAt && new Date(search.createdAt).toISOString().split("T")[0]}
                  required
                  disabled
                />
              </div>
              <div className="">
                <label className="fw-bold">ESTADO DEVOLUCIÓN</label>
                <input
                  id="state"
                  type="text"
                  className={`form-control form-control-sm border border-2 border-${
                    styleStatus[search.state]
                    } text-center text-${styleStatus[search.state]}
                  `}
                  value={search.state}
                  style={{color:''}}
                  disabled
                />
              </div>
            </div>
          </div>
        </div>

        {/* tabla con productos */}
        <div>
            <div className="table-responsive mt-2 mb-3 rounded">
                <table className="table table-bordered table-hover align-middle text-center m-0 caption-top">
                    <caption>PRODUCTOS AGREGADOS</caption>
                    <thead className="table-light">
                    <tr>
                        <th style={{ width: 100 }}>Ref.</th>
                        <th>Descripción</th>
                        <th style={{ width: 100 }}>Cantidad</th>
                        <th style={{ width: 100 }}>UM</th>
                        <th style={{ width: 400 }}>Motivo</th>
                    </tr>
                    </thead>
                    <tbody>
                    {search?.items && search?.items.map((elem, index) => (
                        <tr>
                        <td>{elem.id}</td>
                        <td className="text-start">{elem.description}</td>
                        <td>{Number(elem.ReturnProduct.amount).toFixed(2)}</td>
                        <td>{elem.um}</td>
                        <td className="text-center">{elem.ReturnProduct.reason}</td>
                        </tr>
                    ))}
                    </tbody>
                    <tfoot>
                    <tr>
                        <td className="fw-bold">TOTAL ITEMS</td>
                        <td colSpan={3}></td>
                        <td className="fw-bold text-center">{search?.items && search?.items.length}</td>
                    </tr>
                    </tfoot>
                </table>
            </div>
        </div>
        <div className="d-flex mb-3 mt-3 row row-cols-sm-2">
            <div className="d-flex flex-column">
              <div className="info-funcionario w-100">
                <div className={`div-50 `}>
                  <label className="fw-bold">EVIDENCIA</label>
                </div>
                <div className="div-50-2 d-flex flex-row">
                  {(foto) ?
                    <a 
                      className="" 
                      style={{fontSize:12}} 
                      href={foto} 
                      download={`id_${search.id}.jpg`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaFileDownload />Descargar evidencia
                    </a>
                    : (video) &&
                    <a 
                      className="" 
                      style={{fontSize:12}} 
                      href={video} 
                      download={`id_${search.id}.webm`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaFileDownload />Descargar evidencia
                    </a>
                  }
                </div>
              </div>
                {(!foto && !video) ? (
                    <div
                        style={{
                        width: "100%",
                        height: 33,
                        border: evidencia ? "2px solid green" : "2px solid #ccc",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 5,
                        backgroundColor:'whitesmoke',
                        borderColor:'red',
                        color:'red'
                    }}
                    >
                    { "No subieron evidencia en esta solicitud"}
                    </div>
                    ) : ((foto !== null) ? (
                      <div className="d-flex">
                          <img 
                              src={foto} 
                              alt="foto" 
                              style={{ width: "100%", height: 200 , borderRadius: 10}} 
                          />
                      </div>
                    ) : (
                    <>
                      <video
                        src={video}
                        controls
                        className="w-full rounded border"
                        style={{ width: "100%", height: 200 , borderRadius: 10}}
                      />
                    </>
                    )
                  )
                  
                  
                }
            </div>
            {/* {JSON.stringify(evidencia)} */}
            {/* {JSON.stringify(foto)}--------{JSON.stringify(video)} */}
           <div>
                <label className="fw-bold">OBSERVACIONES</label>
                <textarea
                    id="observations "
                    className="form-control"
                    value={search.observations}
                    style={{ fontSize: 12 , height: search.evidence !== null ? '92%' : 30 , textTransform:'uppercase' }}
                    disabled
                ></textarea>
            </div> 
        </div>
        <Modal show={enviando} centered>
          <Modal.Body>
            <div className="d-flex align-items-center">
              <strong className="text-danger" role="status">
                Cargando...
              </strong>
              <div
                className="spinner-grow text-danger ms-auto"
                role="status"
              ></div>
            </div>
          </Modal.Body>
        </Modal>
        {search.state === 'Solicitado' ?
          <div className="d-flex flex-row gap-3 mb-3 pb-3 mt-2 w-100 justify-content-end aling-items-end text-aling-end">
              <div className="div-end d-flex gap-3">
                  <button
                      type="submit"
                      className="btn btn-sm btn-success fw-bold w-100"
                      onClick={(e)=>handlerSubmit(e)}
                  >
                      APROBAR
                  </button>
                  <button
                      type="button"
                      className="btn btn-sm btn-danger fw-bold w-100"
                      onClick={(e)=>openModal(e)}
                  >
                      {rechazando ? 'RECHAZANDO...' : 'RECHAZAR'}
                  </button>
                  <button
                      type="button"
                      className="btn btn-sm btn-primary fw-bold w-100"
                      onClick={(e)=>navigate("/inicio")}
                  >
                      SALIR
                  </button>
              </div>
          </div>
          :
          <div className="d-flex flex-row gap-3 mb-3 pb-3 mt-2 w-100 justify-content-end aling-items-end text-aling-end">
              <div className="div-end d-flex gap-3">
                  <button
                      type="button"
                      className="btn btn-sm btn-primary fw-bold w-100"
                      onClick={(e)=>navigate("/inicio")}
                  >
                      SALIR
                  </button>
              </div>
          </div>
        }
      {/* </form> */}
    </div>
    )
}