import { useEffect, useRef, useState } from "react";
import * as Bi from "react-icons/bi";
import TableProducts from "../TableProducts";
import { getAllProducts } from "../../services/productService";
import { FaCamera } from "react-icons/fa";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Modal, Button } from "react-bootstrap";
import './styles.css'

function AddProducts({ productosAgr, setProductosAgr }) {
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [modalOtra, setModalOtra] = useState(false);
  const [datos, setDatos] = useState({
    idProducto: "",
    description: "",
    cantidad: "",
    listaPrecios: "",
    reason: "",
    especifique: "",
  });
  const ref = useRef();

  useEffect(() => {
    getAllProducts().then((res) => {
      setProducts(res);
      setSuggestions(res);
    });
  }, []);

  const formater = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = "$1.";
    let arr = number.toString().split(".");
    arr[0] = arr[0].replace(exp, rep);
    return arr[1] ? arr.join(".") : arr[0];
  };

  const handlerChangePrice = (e) => {
    const { id, value } = e.target;
    setDatos({
      ...datos,
      [id]: formater(value.split(".").join("")),
    });
  };

  const handlerChangeSuggestions = (e) => {
    const { value } = e.target;
    setProductoSeleccionado(null);
    if (value !== "") {
      const filter = products.filter((elem) =>
        elem.item.descripcion.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filter);
    } else {
      setSuggestions(products);
    }
    ref.current.selectedIndex = 0;
    setDatos({
      ...datos,
      idProducto: "",
      description: value,
    });
  };

  const handlerChange = (e) => {
    const { id, value } = e.target;
    setDatos({
      ...datos,
      [id]: value,
    });
  };

  const findById = (e) => {
    const { value } = e.target;
    const item = products.find((elem) => parseInt(elem.item.codigo) === parseInt(value));

    if (item) {
      setProductoSeleccionado(item);
    } else {
      setProductoSeleccionado(null);
    }
  };

  const handlerSubmit = (e) => {
    e.preventDefault();
    if (!productoSeleccionado || !datos.cantidad || !datos.reason) {
      return 0;
    }
    const list = [...productosAgr.agregados];
    const newProducto = {
      id: productoSeleccionado.item.codigo,
      description: productoSeleccionado.item.descripcion,
      amount: Number(datos.cantidad),
      um: productoSeleccionado.item.um,
      reason: datos.reason === 'Otra (especifique)' ? datos.especifique : datos.reason,
    };

    list.push(newProducto);
    setProductosAgr({
      agregados: list,
    });
    cleanForm();
  };
  
  const cleanForm = () => {
    setSuggestions(products)
    setProductoSeleccionado(null);
    setDatos({
      idProducto: "",
      description: "",
      cantidad: "",
      listaPrecios: "",
      reason: "",
      especifique: "",
    });
  };

  //logica del modal con el scanner
  const [showModal, setShowModal] = useState(false);
  const scannerRef = useRef(null);
  const openModal = () => {
    setShowModal(true)
  }
  const handleCloseModal  = () => {
    setShowModal(false)
  }
  const handleCloseModalOtra  = () => {
    setModalOtra(false)
    setDatos({
      ...datos,
      reason: null
    })
  }
  //logica para abrir el scanner cuando se abra el modal
  useEffect(() => {
    if (showModal) {
      const config = {
        fps: 10, // Frames per second
        qrbox: { width: 250, height: 250 }, // Scanning area size
        
      };
      // Personalizar los textos del escáner
      const updateLabelsToSpanish = () => {
        const startScanningButton = document.querySelector(".html5-qrcode-button-camera-start");
        const stopScanningButton = document.querySelector(".html5-qrcode-button-camera-stop");
        const cameraPermissionText = document.querySelector(".html5-qrcode-camera-permission-text");
        const cameraUnavailableText = document.querySelector(".html5-qrcode-camera-setup-text");

        if (startScanningButton) startScanningButton.innerText = "Iniciar escaneo";
        if (stopScanningButton) stopScanningButton.innerText = "Detener escaneo";
        if (cameraPermissionText) cameraPermissionText.innerText = "Por favor, permita el acceso a la cámara.";
        if (cameraUnavailableText) cameraUnavailableText.innerText = "Cámara no disponible. Verifique su configuración.";
      };

      const scanner = new Html5QrcodeScanner("qr-reader", config, false);

      scanner.render(
        (decodedText) => {
          handleCloseModal(); // Close the modal after scanning
          scanner.clear(); // Clear the scanner
          setDatos({
            ...datos,
            idProducto: decodedText
          })

          const item = products.find((elem) => parseInt(elem.item.codigo) === parseInt(decodedText));
          if (item) {
            setProductoSeleccionado(item);
          } else {
            setProductoSeleccionado(null);
          }
          /* window.location.href = decodedText; */
        },
        (error) => {
          console.warn(error);
        }
      );
      
      // Modificar textos al español después de renderizar
      setTimeout(updateLabelsToSpanish, 500); // Esperar a que se renderice la interfaz
      
      scannerRef.current = scanner;
    }

    // Cleanup on modal close or component unmount
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [showModal]);

  // constante para cuando se seleccion la opcion otro y abra el modal
  const handleSelectChange = (e) => {
    const value = e.target.value;

    if (value === 'Otra (especifique)') {
      setModalOtra(true);
    }
  };

  //contante para guardar el motivo
  const handleChangeEspecifique = (e) => {
    const value = e.target.value;
    setModalOtra(false)
    /* setDatos({
      ...datos,
      especifique: value
    }) */
  }

  return (
    <div>
      <div className="bg-light rounded shadow-sm p-3 mb-2">
        <div>
          {/* modal para scannear codigo de barras */}
          <Modal show={showModal} onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
              <Modal.Title>Escanear código de barras</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div id="qr-reader" style={{ width: "100%", textAlign: "center" }}></div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="danger" onClick={(e)=>handleCloseModal(e)}>
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Modal para motivo otra */}
          <Modal show={modalOtra} onHide={handleCloseModalOtra} centered>
            <Modal.Header closeButton>
              <Modal.Title>Motivo seleccionado: Otra</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <label className="mb-1">Especifique cual:</label>
              <textarea
              id="especifique"
              className="form-control"
              value={datos.especifique}
              onChange={(e)=>handlerChange(e)}
              style={{ minHeight: 70, maxHeight: 100, fontSize: 12 }}
            ></textarea>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="success" onClick={(e)=>handleChangeEspecifique(e)}>
                Guardar
              </Button>
              <Button variant="danger" onClick={handleCloseModalOtra}>
                Cerrar
              </Button>
            </Modal.Footer>
          </Modal>

          <label className="fw-bold">AGREGAR PRODUCTOS</label>
          <div /* onSubmit={handlerSubmit} */>
            <div className="div-prod gap-2">
              <div className="div-25">
                <label>Referencia:</label>
                <div className="d-flex flex-row gap-2">
                  <input
                    id="idProducto"
                    type="number"
                    placeholder="Completa este campo para agregar"
                    value={
                      productoSeleccionado
                        ? parseInt(productoSeleccionado.item.codigo)
                        : datos.idProducto
                    }
                    className="form-control form-control-sm"
                    min={1000}
                    aria-controls="off"
                    onChange={(e) => {
                      handlerChange(e);
                      findById(e);
                    }}
                    
                  />
                  {/* <button 
                    placeholder='Scannear Código de barras'
                    className="btn btn-sm btn-warning"
                    onClick={(e)=>openModal(e)}  
                  >
                    <FaCamera />
                  </button> */}
                </div>
              </div>
              <div className="div-50">
                <label>Descripción:</label>
                <div className="d-flex align-items-center position-relative w-100">
                  <input
                    id="description"
                    type="search"
                    autoComplete="off"
                    placeholder="Selecciona un producto para agregarlo"
                    value={
                      productoSeleccionado
                        ? productoSeleccionado?.item.descripcion
                        : datos.description
                    }
                    onChange={handlerChangeSuggestions}
                    className="form-control form-control-sm input-select"
                    /* required={productoSeleccionado ? false : true} */
                  />
                  <select
                    ref={ref}
                    className="form-select form-select-sm"
                    onChange={findById}
                    /* required */
                  >
                    <option value="" selected disabled>
                      -- SELECCIONE --
                    </option>
                    {suggestions.sort((a, b) => parseInt(a.item.codigo) - parseInt(b.item.codigo)).map((elem, index) => (
                      <option key={index} value={elem.item.codigo}>
                        {elem.item.codigo} - {elem.item.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="div-25">
                <label>U.M.:</label>
                <input
                  type="text"
                  value={productoSeleccionado?.item.um || ""}
                  className="form-control form-control-sm"
                  disabled
                  /* required */
                />
              </div>
            </div>
            <div className="div-prod gap-2">
              <div className="div-50">
                <label>Cantidad:</label>
                <input
                  id="cantidad"
                  type="number"
                  placeholder="Completa este campo para agregar"
                  value={datos.cantidad}
                  min={0.1}
                  className="form-control form-control-sm"
                  onChange={handlerChange}
                  /* required */
                />
              </div>
              <div className="div-50">
                <label>Motivo:</label>
                <select
                    ref={ref}
                    id="reason"
                    value={datos.reason}
                    className="form-select form-select-sm"
                    onChange={(e)=>(handlerChange(e), handleSelectChange(e))}
                    /* required */
                  >
                    <option value="" selected disabled>
                      -- SELECCIONE EL MOTIVO DE DEVOLUCIÓN--
                    </option>
                      <option key='Mal olor' value='Mal olor'>Mal olor</option>
                      <option key='Producto quemado' value='Producto quemado'>Producto quemado</option>
                      <option key='Producto vencido' value='Producto vencido'>Producto vencido</option>
                      <option key='Pérdida de vacío' value='Pérdida de vacío'>Pérdida de vacío</option>
                      <option key='Empaque dañado' value='Empaque dañado'>Empaque dañado</option>
                      <option key='Sin rotulo' value='Sin rotulo'>Sin rotulo</option>
                      <option key='Fecha corta' value='Fecha corta'>Fecha corta</option>
                      <option key='Producto trocado' value='Producto trocado'>Producto trocado</option>
                      <option key='Otra (especifique)' value='Otra (especifique)'>Otra (especifique)</option>
                  </select>
                {/* <input
                  id="precio"
                  type="number"
                  placeholder="Completa este campo para agregar"
                  min={50}
                  value={datos.precio}
                  className="form-control form-control-sm"
                  onChange={handlerChangePrice}
                /> */}
              </div>
            </div>
            <div className="d-flex justify-content-center w-100 mt-2">
              <button
                /* type="submit" */
                className="d-flex align-items-center justify-content-center btn btn-sm btn-primary w-100"
                onClick={(e)=>handlerSubmit(e)}
              >
                AGREGAR PRODUCTO
                <Bi.BiCartAdd style={{ width: 20, height: 20 }} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <TableProducts
        list={productosAgr}
        setList={setProductosAgr}
        formater={formater}
      />
    </div>
  );
}

export default AddProducts;
