import { useEffect, useState, useContext, useRef } from "react";
import { createDevolucon, deleteDevolucion } from "../../services/devolucionesService";
import { getAllClients } from "../../services/clientService";
import { getAllAgencies } from "../../services/agencyService";
import ClientContext from "../../context/clientContext";
import AddProducts from "../../components/AddProducts";
import { sendMail , sendMail2 } from "../../services/mailService";
import AuthContext from "../../context/authContext";
import ComboBox from "../../components/ComboBox";
import { Modal } from "react-bootstrap";
import Webcam from 'react-webcam';
import Swal from "sweetalert2";
import "./styles.css";
import { sendEvidence } from "../../services/evidence";

export default function Form() {
  const { user, setUser } = useContext(AuthContext);
  const { client, setClient } = useContext(ClientContext);
  const [agencia, setAgencia] = useState(null);
  const [sucursal, setSucursal] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [agencias, setAgencias] = useState([]);
  const [typeEvidence, setTypeEvidence] = useState(null);
  const [productosAgr, setProductosAgr] = useState({
    agregados: [],
    total: "0",
  });
  const [search, setSearch] = useState({
    idCliente: "",
    descCliente: "",
    observations: "",
    order: "",
  });
  const [loading, setLoading] = useState(false);
  const [invoiceType, setInvoiceType] = useState(false);
  const selectBranchRef = useRef();
  const [evidence, setEvidence] = useState(null);
  const webcamRef = useRef(null);
  const ImgFirmaRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null); // Foto en previsualización

  useEffect(() => {
    getAllClients().then((data) => setClientes(data));
    getAllAgencies().then((data) => setAgencias(data));
  }, []);

  //logica para saber si es celular
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900); // Establecer a true si la ventana es menor o igual a 768px
    };

    // Llama a handleResize al cargar y al cambiar el tamaño de la ventana
    window.addEventListener('resize', handleResize);
    handleResize(); // Llama a handleResize inicialmente para establecer el estado correcto

    // Elimina el event listener cuando el componente se desmonta
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Formatear tiempo como mm:ss
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const findById = (id, array, setItem) => {
    const item = array.find((elem) => elem.nit === id);
    if (item) {
      setItem(item);
    } else {
      setItem(null);
      setSucursal(null);
      selectBranchRef.current.selectedIndex = 0;
    }
  };

  const handlerChangeSearch = (e) => {
    const { id, value } = e.target;
    console.log(value);
    setSearch({
      ...search,
      [id]: value,
    });
  };

  const idParser = (id) => {
    let numeroComoTexto = id.toString();
    while (numeroComoTexto.length < 8) {
      numeroComoTexto = "0" + numeroComoTexto;
    }
    return numeroComoTexto;
  };

  const changeType = (e) => {
    setSearch({
      ...search,
      idCliente: "",
    });
    setInvoiceType(!invoiceType);
    setClient(null);
    setSucursal(null);
    selectBranchRef.current.selectedIndex = 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if( invoiceType ? (agencia !== null ) : (client !== null) ) {
      if (productosAgr.agregados.length <= 0) {
        Swal.fire({
          title: "¡Atención!",
          text: "No hay productos en la lista, agregue al menos uno",
          icon: "warning",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#198754",
          timer: 2500,
        });
      } else
        Swal.fire({
          title: "¿Está seguro?",
          text: "Se registrará la solicitud de devoluciones y/o averías",
          icon: "warning",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#198754",
          showCancelButton: true,
          cancelButtonText: "Cancelar",
        }).then(({ isConfirmed }) => {
          if (isConfirmed) {
            setLoading(true);
            var body = {
              client: client ? client : null,
              agency: agencia ? agencia : null,
              seller: sucursal ? sucursal.vendedor : null,
              branch: sucursal ? sucursal : null,
              products: productosAgr,
              createdAt: new Date(),
              createdBy: user.id,
              state: 'Solicitado',
              observations: search.observations,
              /* evidence: previewPhoto, */
              destiny: invoiceType ? 'auditoriacontable@granlangostino.net' : 'cordinadoragencias@granlangostino.com',
              /* destiny:'sistemas2@granlangostino.net', */
              typeApplicant: invoiceType ? 'Agencia' : 'Cliente'
              //file: JSON.stringify(files),
            };
            createDevolucon(body)
              .then(({data}) => {
                const f = new FormData();
                if(typeEvidence === 'Foto'){
                  f.append('evidence', evidence, 'evidence.jpg')
                }
                if(typeEvidence === 'Video'){
                  f.append('evidence', evidence, 'evidence.webm')
                }
                f.append('tipo', typeEvidence)
                f.append('id', data.id)
                f.append("info", JSON.stringify(body))
                /* const mime = typeEvidence === 'Foto' ? 'image/png' : 'video/webm';
                const file = typeEvidence === 'Foto' ? new File([evidence], `evidencia.png`, { type: mime }) : new File([evidence], `evidencia.webm`, { type: mime }) ;
                f.append('file', file) */
                if(evidence !== null){
                  sendEvidence(f)
                  .then(()=>{
                    sendMail2(body, data.id)
                    .then(()=>{
                      setLoading(false);
                      Swal.fire({
                        title: "¡Creación exitosa!",
                        text: `
                          La orden de devolución y averías se ha realizado satisfactoriamente.
                          Por favor revise el correo y verifique la información.
                        `,
                        icon: "success",
                        confirmButtonText: "Aceptar",
                      }).then(() => {
                        window.location.reload();
                      });
                    })
                    .catch(()=>{
                      setLoading(false);
                        /* deleteOrder(data.id); */
                        Swal.fire({
                          title: "¡Ha ocurrido un error!",
                          text: `
                          Hubo un error al momento de enviar el correo, intente de nuevo.
                          Si el problema persiste por favor comuniquese con el área de sistemas.`,
                          icon: "error",
                          confirmButtonText: "Aceptar",
                        });
                    })
                  })
                  .catch(()=>{
                    setLoading(false);
                    deleteDevolucion(data.id);
                    Swal.fire({
                      title: "¡Ha ocurrido un error!",
                      text: `
                      Hubo un error al momento de guardar la evidencia de la solicitud de devoluciones y averías, intente de nuevo.
                      Si el problema persiste por favor comuniquese con el área de sistemas.`,
                      icon: "error",
                      confirmButtonText: "Aceptar",
                    });
                  })
                }else{
                  sendMail2(body, data.id)
                  .then(()=>{
                    setLoading(false);
                    Swal.fire({
                      title: "¡Creación exitosa!",
                      text: `
                        La orden de devolución y averías se ha realizado satisfactoriamente.
                        Por favor revise el correo y verifique la información.
                      `,
                      icon: "success",
                      confirmButtonText: "Aceptar",
                    }).then(() => {
                      window.location.reload();
                    });
                  })
                  .catch(()=>{
                    setLoading(false);
                      /* deleteOrder(data.id); */
                      Swal.fire({
                        title: "¡Ha ocurrido un error!",
                        text: `
                        Hubo un error al momento de enviar el correo, intente de nuevo.
                        Si el problema persiste por favor comuniquese con el área de sistemas.`,
                        icon: "error",
                        confirmButtonText: "Aceptar",
                      });
                  })
                }
              })
              .catch((err) => {
                setLoading(false);
                /* deleteOrder(data.id); */
                Swal.fire({
                  title: "¡Ha ocurrido un error!",
                  text: `
                  Hubo un error al momento de registrar la solicitud de devoluciones y averías, intente de nuevo.
                  Si el problema persiste por favor comuniquese con el área de sistemas.`,
                  icon: "error",
                  confirmButtonText: "Aceptar",
                });
            });
          }
        });
    }else{
      Swal.fire({
        icon:'warning',
        title:'¡ATENCIÓN!',
        text:'Debes llenar todos los campos requeridos para hacer la solicitud de devoluciones y averías.',
        timer: 8000,
        showConfirmButton: false,
      })
    }
  };

  const refreshForm = () => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Se descartará todo el proceso que lleva",
      icon: "warning",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#dc3545",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
    }).then(({ isConfirmed }) => {
      if (isConfirmed) window.location.reload();
    });
  };

  /* Logica para tomar la foto de evidencia */
  //se agrega toda esta parte
  const camaraRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const startCamera = async () => {
    try {
      const backStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: "environment" } },
        audio: false,
      });
      setStream(backStream);
      if (camaraRef.current) {
        camaraRef.current.srcObject = backStream;
      }
    } catch (err) {
      alert("❌ Cámara trasera no disponible. Probando cámara frontal...");
      try {
        const frontStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        setStream(frontStream);
        if (camaraRef.current) {
          camaraRef.current.srcObject = frontStream;
        }
      } catch (fallbackErr) {
        console.error("❌ No se pudo acceder a ninguna cámara:", fallbackErr);
        setError("No se encontró ninguna cámara en el dispositivo.");
      }
    }
  };
  //
  
  // Abrir el modal para un campo específico
  const openModal = (e) => {
    setShowModal(true);
    /* setPreviewPhoto(null); */ // Resetear previsualización
  };
  // Cerrar el modal
  const closeModal = (e) => {
    setShowModal(false);
    
    /* Se agrega esta parte */
    // 🔴 Detener la cámara después de capturar la imagen
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (camaraRef.current) {
      camaraRef.current.srcObject = null;
    }
    /*  */
    /* setPreviewPhoto(null); */ // Resetear previsualización
  };
  // Capturar la foto y guardarla en el estado correspondiente
  const capturePhoto = () => {
    const video = camaraRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && canvas.getContext) {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setPreviewPhoto(dataUrl);

      // 🔴 Detener la cámara después de capturar la imagen
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };
  /* Version anterior 
    const capturePhoto = () => {
    const photo = webcamRef.current.getScreenshot();
    setPreviewPhoto(photo); // Mostrar previsualización
  }; */

  //descartar foto en el modal
  const discardPhoto = () => {
    setPreviewPhoto(null); // Mostrar previsualización
    setTypeEvidence(null);
    setEvidence(null);
  };
  // Guardar la foto en el estado correspondiente
  const savePhoto = async () => {
    const response = await fetch(previewPhoto);
    const imageBlob = await response.blob();
    setEvidence((imageBlob))
    closeModal();
  };
  // Subir una imagen desde el dispositivo
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewPhoto(event.target.result); // Mostrar previsualización
      };
      reader.readAsDataURL(file);
    }
  };

  /* logica para cuando es video */
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunks = useRef([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [recording, setRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: { ideal: 'environment' },
        /* width: { ideal : '100%' },
        height: { ideal : '100%' }  */
      },
      audio: true,
    });

    streamRef.current = stream;
    videoRef.current.srcObject = stream;

    mediaRecorderRef.current = new MediaRecorder(stream);
    recordedChunks.current = [];

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    };

    mediaRecorderRef.current.start();
    setRecording(true);
    setElapsedTime(0);

    const interval = setInterval(() => {
      setElapsedTime((t) => t + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    streamRef.current.getTracks().forEach((track) => track.stop());
    clearInterval(timerInterval);
    setRecording(false);
  };

  const uploadVideo = async (e) => {
      e.preventDefault();
      const video = new Blob(recordedChunks.current, { type: 'video/webm' })
      setEvidence(video)
      closeModal();
    };

  return (
    <div
      className="container d-flex flex-column w-100 py-3 mt-5"
      style={{ fontSize: 10.5 }}
    >
      <h1 className="text-center fs-5 fw-bold">DEVOLUCIONES Y AVERÍAS</h1>
      <section className="row row-cols-sm-2 justify-content-between align-items-center mb-2">
        <div className="d-flex flex-column">
          <h1 className="fs-6 fw-bold m-0">EL GRAN LANGOSTINO S.A.S.</h1>
          <span className="fw-bold">Nit: 835001216</span>
          <span>Tel: 5584982 - 3155228124</span>
        </div>
        <div className="d-flex flex-column align-items-end">
          <strong className="me-3">Tipo de solicitante</strong>
          <div className="d-flex flex-row align-items-center gap-2">
            <span className={!invoiceType && "text-primary"}>Tercero</span>
            <button
              className="position-relative d-flex align-items-center btn bg-body-secondary rounded-pill toggle-container p-0 m-0"
              onClick={changeType}
            >
              <div
                className={
                  !invoiceType
                    ? "d-flex align-items-center justify-content-center position-absolute bg-primary rounded-circle toggle"
                    : "d-flex align-items-center justify-content-center position-absolute bg-success   rounded-circle toggle active"
                }
                
              ></div>
            </button>
            <span style={{margin:0, padding:0}} className={invoiceType ? "text-success" : undefined}>
              Agencia
            </span>
          </div>
        </div>
      </section>
      {/* <form className="" onSubmit={(e)=>handleSubmit(e)}> */}
        <div className="bg-light rounded shadow-sm p-3 mb-3">
          <div className="d-flex flex-column gap-1">
            {invoiceType ?
              <div>
                {/* Centro de operación */}
              <label className="fw-bold">CENTRO DE OPERACIÓN</label>
              <select
                ref={selectBranchRef}
                className="form-select form-select-sm"
                onChange={(e) => setAgencia(JSON.parse(e.target.value))}
                required
              >
                <option selected value="" disabled>
                  -- Seleccione el Centro de Operación --
                </option>
                {agencias
                  .sort((a, b) => a.id - b.id)
                  .map((elem) => (
                    <option id={elem.id} value={JSON.stringify(elem)}>
                      {elem.id + " - " + elem.descripcion}
                    </option>
                  ))}
              </select>
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
                        value={client ? client.nit : search.idCliente}
                        className="form-control form-control-sm"
                        placeholder="Buscar por NIT/Cédula"
                        onChange={(e) => {
                          const { value } = e.target;
                          handlerChangeSearch(e);
                          findById(value, clientes, setClient);
                        }}
                        min={0}
                        required
                      />
                    </div>
                    <div className="d-flex flex-column align-items-start">
                      <label>Razón Social:</label>
                      <ComboBox
                        options={clientes}
                        id="razon-social"
                        item={client}
                        setItem={setClient}
                        invoiceType={invoiceType}
                      />
                    </div>
                  </div>
                  <div className="my-1">
                    <label className="fw-bold">SUCURSAL</label>
                    <select
                      ref={selectBranchRef}
                      className="form-select form-select-sm"
                      onChange={(e) => setSucursal(JSON.parse(e.target.value))}
                      disabled={client ? false : true}
                      required
                    >
                      <option selected value="" disabled>
                        -- Seleccione la Sucursal --
                      </option>
                      {client?.sucursales
                        .sort((a, b) => a.id - b.id)
                        .map((elem) => (
                          <option id={elem.id} value={JSON.stringify(elem)}>
                            {elem.id + " - " + elem.descripcion}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                {/* {JSON.stringify(client)}---- {JSON.stringify(sucursal)} ----  */}
                <hr className="my-1" />
                <div>
                  <label className="fw-bold">VENDEDOR</label>
                  <div className="row">
                    <div className="d-flex flex-column align-items-start">
                      <input
                        id="idVendedor"
                        type="text"
                        value={
                          client && sucursal && !invoiceType
                            ? sucursal.vendedor?.tercero?.razonSocial
                            : sucursal && invoiceType
                            ? sucursal.vendedor?.description
                            : ""
                        }
                        className="form-control form-control-sm w-100"
                        onChange={handlerChangeSearch}
                        required
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
                  value={new Date().toISOString().split("T")[0]}
                  onChange={handlerChangeSearch}
                  required
                  disabled
                />
              </div>
              <div className="">
                <label className="fw-bold">EVIDENCIA MERCANCIA</label>
                <div
                  style={{
                    width: "100%",
                    height: 30,
                    border: (previewPhoto || previewUrl) ? "2px solid green" : "2px solid #ccc",
                    display: "flex", 
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    borderRadius: 5
                  }}
                  onClick={() => openModal("backTp","Tarjeta de propiedad trasera")}
                >
                  {previewPhoto ? (
                    <div
                      style={{color:'green'}}  
                    >
                      Haz Click aquí para ver la foto
                    </div>
                  ):"Haz Click aquí para tomar la foto"}
                </div>
              </div>
            </div>
          </div>
          {/* {JSON.stringify(evidence)} */}
        </div>
        <AddProducts
          productosAgr={productosAgr}
          setProductosAgr={setProductosAgr}
        />
        <div className="d-flex flex-column mb-3">
          <label className="fw-bold">OBSERVACIONES</label>
          <textarea
            id="observations"
            className="form-control"
            value={search.observations}
            onChange={handlerChangeSearch}
            style={{ minHeight: 70, maxHeight: 100, fontSize: 12 }}
          ></textarea>
        </div>
        {/* Modal para tomar fotos */}
        <Modal show={showModal} onHide={closeModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Capturar evidencia:</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {/* <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  width: 1280,
                  height: 720,
                  facingMode: "enviroment", // 'user' para camara delante O 'enviroment' para la cámara trasera
                }}
                style={{ width: '100%', height: '100%', border: '2px solid #ccc', borderRadius: '10px' }}
              /> */}
              {(!previewPhoto && typeEvidence === 'Foto') ? (
                <div>
                  <video
                    ref={camaraRef}
                    autoPlay
                    playsInline
                    style={{ width: '100%', height: '100%', border: '2px solid #ccc', borderRadius: '10px' }}
                  />                
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                </div>
              ):( typeEvidence === 'Foto' &&
                <img
                  src={previewPhoto}
                  alt="Previsualización"
                  style={{ width: '100%', height: '100%', border: '2px solid #ccc', borderRadius: '10px' }}
                />
              )}
              {(!previewUrl && typeEvidence === 'Video') ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full rounded border h-full"
                  height={'100%'}
                  width={'100%'}
                  style={{height: isMobile ? '60vh' : '60vh'}}
                />
              ):((!recording && typeEvidence === 'Video' && previewUrl) &&
                <div>
                  <video
                    src={previewUrl}
                    controls
                    className="w-full rounded border"
                    height={'100%'}
                    width={'100%'}
                    style={{height: isMobile ? '60vh' : '60vh'}}
                  />
                </div>
              )}
              {recording && (
                <div className="text-red-600 font-bold text-lg mt-2">
                  ⏺ Grabando... {formatTime(elapsedTime)}
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              {typeEvidence === null &&
                <div className="d-flex gap-2">
                  <button
                    onClick={(e)=>(setTypeEvidence('Foto'), startCamera(e))}
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                    }}
                  >
                    Foto
                  </button>
                  <button
                    onClick={(e)=>(setTypeEvidence('Video'))}
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                    }}
                  >
                    Vídeo
                  </button>
                </div>
              }
              {typeEvidence === 'Foto' ?
                <div>
                {!previewPhoto ? (
                <div className="d-flex gap-2">
                  <button
                    onClick={(e)=>capturePhoto(e)}
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                    }}
                  >
                    Capturar
                  </button>
                  <label
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      backgroundColor: "#6c757d",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Subir
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
                ) : (
                <>
                  <button
                    onClick={savePhoto}
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      backgroundColor: "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      marginRight: "10px",
                    }}
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => discardPhoto()}
                    style={{
                      padding: "10px 20px",
                      fontSize: "16px",
                      backgroundColor: "#dc3545",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                    }}
                  >
                    Descartar
                  </button>
                </>
                )} 
                </div> 
                : typeEvidence === 'Video' &&
                <div className='d-flex flex-column'>

                  {!recording && previewUrl && (
                    <>
                      <div className={`mt-2 d-flex div-botons justify-content-center ${isMobile ? 'gap-2' : 'gap-4'} `}>
                        <button
                          onClick={uploadVideo}
                          className="bg-green-600 btn btn-sm btn-success text-black px-4 py-2 rounded"
                        >
                          📤 Guardar
                        </button>
                        <button
                          onClick={() => {
                            setPreviewUrl(null);
                            setEvidence(null);
                            recordedChunks.current = [];
                          }}
                          className="bg-gray-500 btn btn-sm btn-danger text-black px-4 py-2 rounded"
                        >
                          🔄 Grabar de nuevo
                        </button>
                      </div>
                    </>
                  )}

                  {!recording && !previewUrl && (
                    <div className={`mt-2 d-flex div-botons justify-content-center ${isMobile ? 'gap-2' : 'gap-4'} `}>
                      <button
                        onClick={(e)=>startRecording(e)}
                        className="bg-blue-600 btn btn-sm btn-primary text-black px-4 py-2 rounded"
                      >
                        ▶️ Iniciar grabación
                      </button>
                      <button
                        onClick={(e)=>setTypeEvidence(null)}
                        className="bg-red-600 btn btn-sm btn-danger text-black px-4 py-2 rounded"
                      >
                        ↩️ Volver
                      </button>
                    </div>
                  )}

                  {recording && (
                    <button
                      onClick={stopRecording}
                      className="bg-red-600 btn btn-sm btn-danger text-black px-6 py-2 rounded mt-1"
                    >
                      ⏹️ Detener grabación
                    </button>
                  )}
                  </div>

              }
            </Modal.Footer>
          </Modal>
        <Modal show={loading} centered>
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
        <div className="d-flex flex-row gap-3 mb-3 pb-3">
          <button
            type="submit"
            className="btn btn-sm btn-success fw-bold w-100"
            onClick={(e)=>handleSubmit(e)}
          >
            SOLICITAR
          </button>
          <button
            type="button"
            className="btn btn-sm btn-danger fw-bold w-100"
            onClick={refreshForm}
          >
            CANCELAR
          </button>
        </div>
      {/* </form> */}
    </div>
  );
}
