import { useState, useEffect, useContext } from "react";
import { PDFViewer, PDFDownloadLink } from "@react-pdf/renderer";
import { updateDevolucon } from "../../services/devolucionesService";
import { Modal , Button , Form } from "react-bootstrap";
import AuthContext from "../../context/authContext";
import DataTable from "react-data-table-component";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { TfiTicket } from "react-icons/tfi";
import { GrDeliver } from "react-icons/gr";
import * as FaIcons from "react-icons/fa";
import DocOrderPDF from "../DocOrderPDF";
import { FaEdit } from "react-icons/fa";
import Swal from "sweetalert2";
import "./styles.css";
import { sendMailCollect, sendMailEnd } from "../../services/mailService";
import { GiCancel } from "react-icons/gi";

const styleStatus = {
  "Solicitado": "primary",
  'Autorizado': "warning",
  "Recogido": "info",
  "Cancelado": "secondary",
  "Finalizado": "success",
  'Rechazado': "danger",
};

function TableOrders({ orders, getAllOrders, loading }) {
  const { user } = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [docAsociado, setDocAsociado] = useState('');
  const [nameReceiver, setNameReceiver] = useState('');
  const [nameDriver, setNameDriver] = useState('');
  const [recogiendo, setRecogiendo] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const navigate = useNavigate();
  const columns = [
    /* {
      id: "no",
      name: "No.",
      selector: (row) => row.id,
      sortable: true,
      width: "85px",
      center: true,
    }, */
    {
      id: "options",
      name: "",
      center: true,
      cell: (row, index, column, id) =>
        isMobile ? (
          <div className="d-flex gap-2 p-1">
            <PDFDownloadLink
              document={<DocOrderPDF order={row} />}
              fileName={`${(row?.coId !== null || row?.coId !== '') ? row?.coId : row?.clientId }-Devoluciones y averías.pdf`}
              onClick={(e) => {
                e.download();
              }}
            >
              <FaIcons.FaDownload />
            </PDFDownloadLink>
          </div>
        ) : (
          <div className="d-flex   p-1">
            <button
              title="Ver PDF de pedido"
              className="btn btn-sm btn-primary"
              onClick={(e) => {
                setSelectedOrder(row);
              }}
            >
              <FaIcons.FaEye />
            </button>
          </div>
        ),
      width: "50px",
    },
    {
      id: "editar",
      name: "",
      center: true,
      cell: (row, index, column, id) => (
        <div className='d-flex gap-2 p-1'>
          {((user.role === 'admin' || user.role === 'Autorizador clientes' || user.role === 'Autorizador agencias')) ? (
            <button 
              title="Editar registro" className='btn btn-sm'
              style={{background:'#FF5757', color:'white'}}
              onClick={(e) => {
                /* setSelectedCredito(row) */
                navigate(`/autorizacion/${row.id}`)
              }}
            >
              <FaEdit />
            </button>
          ):((user.role === 'logistica' && (row.state === 'Autorizado')) ?
            (
              <div className="d-flex flex-row gap-2">
                <button 
                  title="Recogido" className='btn btn-sm'
                  style={{background:'#FF5757', color:'white'}}
                  onClick={(e) => (setSelectedReturn(row), openModal(e))}
                  disabled = {row.state !== 'Autorizado'}
                >
                  <GrDeliver />
                </button>
                <button 
                  id={row.id}
                  title="Cancelar" className='btn btn-sm btn-secondary'
                  /* style={{background:'#FF5757', color:'white'}} */
                  onClick={(e) => (handleCancel(e, row))}
                  disabled = {row.state !== 'Autorizado'}
                >
                  <GiCancel  />
                </button>
              </div>
            ) : ((user.role === 'supervisor' && row.state === 'Recogido') &&
              <button 
                title="Finalizar" className='btn btn-sm btn-success'
                /* style={{background:'#FF5757', color:'white'}} */
                onClick={(e) => (setSelectedReturn(row), openModalFinish(e))}
              >
                <FaCheckCircle />
              </button>
            ))
          }
        </div>
      ),
      width: user.role === 'logistica' ? '80px' : '60px'
    },
    {
      id: "state",
      name: "Estado",
      center: true,
      sortable: true,
      selector: row => row.state, // 👈 esto define con qué valor ordenar
      cell: (row, index, column, id) => (
        <select
          id={row.id}
          className={`
              form-control form-control-sm border border-2 border-${
                styleStatus[row.state]
              } text-center text-${styleStatus[row.state]}
            `}
          value={row.state}
          disabled={user.role !== "admin"}
          onChange={(e) => updateState(e, row)}
        >
          <option className="text-primary">Solicitado</option>
          <option className="text-warning">Autorizado</option>
          <option className="text-info">Recogido</option>
          <option className="text-secondary">Cancelado</option>
          <option id="reasonForRejection" className="text-danger">Rechazado</option>
          <option id="reasonForDelivery" className="text-success">Finalizado</option>
        </select>
      ),
      width: "175px",
    },
    {
      name: "Notas de estado",
      center: true,
      cell: (row, index, column, id) => (
        <>
          {row.state === 'Cancelado' ? 
            <button
              className="btn btn-sm btn-primary"
              disabled={row.state !== 'Cancelado'}
              onClick={(e) =>
                Swal.fire({
                  title: "Motivo cancelación",
                  confirmButtonText: "Aceptar",
                  confirmButtonColor:'#FF5757',
                  html: row.cancelReason
                    ? row.cancelReason
                        .split("\n")
                        .map((elem) => `<p style="font-size: 15px; margin: 0;">${elem}</p>`)
                        .join("")
                    : "Sin Información",
                })
              }
            >
              Cancelado
            </button>
            :
            <>
              <button
                className="btn btn-sm btn-primary"
                disabled={row.state !== 'Rechazado'}
                onClick={(e) =>
                  Swal.fire({
                    title: "Notas Rechazo",
                    confirmButtonText: "Aceptar",
                    confirmButtonColor:'#FF5757',
                    html: row.reasonForRejection
                      ? row.reasonForRejection
                          .split("\n")
                          .map((elem) => `<p style="font-size: 15px; margin: 0;">${elem}</p>`)
                          .join("")
                      : "Sin Información",
                  })
                }
              >
                Rechazo
              </button>
              <button
                className="btn btn-sm btn-primary"
                disabled={row.state !== 'Finalizado'}
                onClick={(e) =>
                  Swal.fire({
                    title: "Notas Finalizado",
                    confirmButtonText: "Aceptar",
                    confirmButtonColor:'#FF5757',
                    html: row.associatedDocument
                      ? row.endDate
                          .split("\n")
                          .map((elem) => `<p style="font-size: 15px; margin: 0; " classname="m-0"><strong>Fecha de finalizado:</strong> ${new Date(elem).toLocaleString('es-CO')}</p>`)
                          .join("") +
                        row?.associatedDocument
                          .split("\n")
                          .map((elem) => `<p style="font-size: 15px; margin: 0;" classname="m-0"><strong>Documento asociado:</strong> ${elem}</p>`)
                          .join("")
                      : "Sin Información",
                  })
                }
              >
                Finalizado
              </button>
            </>
          }
        </>
      ),
      width: "210px",
      style: { gap: 5 },
    },
    {
      id: "id",
      name: "id",
      selector: (row) => `${row.id}`,
      width: "50px",
    },
    {
      id: "row_co_id",
      name: "Solicitante",
      selector: (row) => `${row.coDescription !== null ? row.coDescription : row.clientDescription}`,
      width: "240px",
    },
    {
      id: "row_co_id",
      name: "Sucursal",
      selector: (row) => `${row.branchDescription !== null ? row.branchDescription : ''}`,
      width: "300px",
    },
    {
      id: "created_at",
      name: "Fecha Creación",
      selector: (row) => new Date(row.createdAt).toLocaleString("es-CO"),
      sortable: true,
      width: "200px",
    },
    {
      id: "created_by",
      name: "Creado por",
      selector: (row) => row?.user?.name,
      sortable: true,
      width: "220px",
    },
    /* {
      id: "return_date",
      name: "Fecha de Devolución",
      selector: (row) =>
        new Date(row.returnDate).toLocaleString(
          "es-CO"
        ) ,
      width: "200px",
      sortable: true,
    }, */
    {
      id: "notes",
      name: "Observaciones",
      selector: (row) => row.observations,
      width: "550px",
    },
    
    
  ];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 600px)");
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", () =>
      setIsMobile(mediaQuery.matches)
    );
    return () =>
      mediaQuery.removeEventListener("change", () =>
        setIsMobile(mediaQuery.matches)
      );
  }, []);

  const updateState = (e, order) => {
    const { value } = e.target;
    console.log(value)
    const optionId = e.target.selectedOptions[0].id
    if (value === "rechazado" || value === "entregado") {
      return Swal.fire({
        input: "textarea",
        inputLabel: "Nota",
        inputPlaceholder:
          "Ingrese aquí la razón del cambio de estado del pedido...",
        inputAttributes: {
          "aria-label": "Ingrese la nota acá.",
        },
        inputValidator: (value) => {
          if (!value) {
            return "¡En necesario escribir algo!";
          }
        },
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        confirmButtonColor: "#dc3545",
        cancelButtonText: "Cancelar",
      }).then(({ isConfirmed, value: input }) => {
        if (isConfirmed && value) {
          let consecutive = 1;
          let text;
          const absConsecutive = order?.[optionId]?.split("\n");
          if (absConsecutive) {
            consecutive = absConsecutive;
            const nextConsecutive =
              parseInt(consecutive[consecutive?.length - 1].slice(0, 1)) + 1;
            text = `${order?.[optionId]}\n${nextConsecutive}. ${input} - ${new Date().toLocaleString("es-CO")}`;
          } else {
            text = `${consecutive}. ${input} - ${new Date().toLocaleString("es-CO")}`;
          }
          return updateDevolucon(order.id, {
            state: value,
            [optionId]: text,
          }).then((data) => {
            console.log(data);
            getAllOrders();
          });
        }
      });
    } else {
      return updateDevolucon(order.id, {
        state: value,
      }).then((data) => {
        getAllOrders();
      });
    }
  };

  const formater = (number) => {
    const exp = /(\d)(?=(\d{3})+(?!\d))/g;
    const rep = "$1.";
    let arr = number.toString().split(".");
    arr[0] = arr[0].replace(exp, rep);
    return arr[1] ? arr.join(".") : arr[0];
  };

  /* Modal para marcar como recogido */
  const [modalReject, setModalReject] = useState(false);
  const closeModal = () => {
    setModalReject(false);
    setSelectedReturn(null)
  };
  const openModal = () => {
    setModalReject(true);
  };
  /* marcar como recogido */
  const handleUpdateCollect = (e) => {
    e.preventDefault();
    if(nameDriver !== '' && nameReceiver !== ''){
      setRecogiendo(true);
      const body = {
        state: 'Recogido',
        nameDriver: nameDriver.toUpperCase(),
        nameReceiver: nameReceiver.toUpperCase(),
        colletedDate: new Date(),
      }
      updateDevolucon(selectedReturn.id, body)
        .then(({data})=>{
          sendMailCollect(data)
          .then(()=>{
            setRecogiendo(false)
            Swal.fire({
              icon:'success',
              title:'¡Felicidades!',
              text:'Se ha marcado la solicitud en estado "Recogido" de manera satisfactoria.',
              timer:5000,
              showConfirmButton:false,
              showCancelButton:false,
            })
            getAllOrders()
            closeModal()
          })
          .catch(()=>{
            setRecogiendo(false)
            Swal.fire({
            icon:'warning',
            title:'¡ERROR!',
            text:'Ha ocurrido un error al momento de enviar el correo de notificación, pero el estado de la solictud se ha marcado como "Recogido" de manera satisfactoria. Si el problema persiste comunícate con el área de sistemas.',
            showConfirmButton:true,
            confirmButtonColor: '#0101b5',
            showCancelButton:false
          })
          })
        })
        .catch(()=>{
          setRecogiendo(false)
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
  }

  /* Modal para marcar como finalizado */
  const [modalFinish, setModalFinish] = useState(false);
  const closeModalFinish = () => {
    setModalFinish(false);
    setSelectedReturn(null);
    setDocAsociado('')
  };
  const openModalFinish = () => {
    setModalFinish(true);
  };
  /* marcar como finalizado */
  const handleUpdateFinish = (e) => {
    e.preventDefault();
    setFinalizando(true);
    const body = {
      state: 'Finalizado',
      associatedDocument: `${prefix}${docAsociado}`,
      supervisorComments: supervisorComments,
      endDate: new Date(),
    }
    updateDevolucon(selectedReturn.id, body)
      .then(({data})=>{
        sendMailEnd(data)
        .then(()=>{
          setFinalizando(false);
          Swal.fire({
            icon:'success',
            title:'¡Felicidades!',
            text:'Se ha marcado la solicitud en estado "Finalizado" de manera satisfactoria.',
            timer:5000,
            showConfirmButton:false,
            showCancelButton:false,
          })
          getAllOrders()
          closeModalFinish()
        })
        .catch(()=>{
          setFinalizando(false);
          Swal.fire({
            icon:'warning',
            title:'¡ERROR!',
            text:'Ha ocurrido un error al momento de enviar el correo informativo, pero la solicitud ya se guardó como "Finalizado" y se adjunto el documento asociado. Si el problema persiste comunícate con el área de sistemas.',
            showConfirmButton:true,
            confirmButtonColor: '#0101b5',
            showCancelButton:false
          })
        })
      })
      .catch(()=>{
        setFinalizando(false);
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

  /* poner inicio de documento predeterminado en el input para finalizar */
  const [supervisorComments, setSupervisorComments] = useState('');
  const prefix = selectedReturn !== null ? (selectedReturn.coId !== null ?  "TRE - " : "NCN - ") : null;
  const handleChange = (e) => {
    const value = e.target.value;

    // Extrae solo la parte después del prefijo
    if (value.startsWith(prefix)) {
      const soloNumeros = value.slice(prefix.length);

      // Solo acepta números
      if (/^\d*$/.test(soloNumeros)) {
        setDocAsociado(soloNumeros);
      }
    }
  };

  const handleCancel = (e, order) => {
    const { value } = e.target;
    Swal.fire({
      input: "textarea",
      inputLabel: "Motivo",
      inputPlaceholder:
        "Ingrese aquí la razón del cambio de estado de la solicitud...",
      inputAttributes: {
        "aria-label": "Ingrese la nota acá.",
      },
      inputValidator: (value) => {
        if (!value) {
          return "¡En necesario escribir algo!";
        }
      },
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      confirmButtonColor: "#dc3545",
      cancelButtonText: "Cancelar",
    }).then(({ isConfirmed, value: input }) => {
      if (isConfirmed && input) {
        const body = {
          state: 'Cancelado',
          cancelReason: input,
          cancelDate: new Date(),
        }
        return updateDevolucon(order.id, body)
        .then((data) => {
          console.log(data);
          getAllOrders();
        });
      }
    });
  };

  return (
    <div
      className="d-flex flex-column rounded m-0 p-0 table-orders"
      style={{ width: "100%" }}
    >
      <DataTable
        className="bg-light text-center border border-2 h-100 p-0 m-0"
        columns={columns}
        data={orders}
        fixedHeaderScrollHeight={200}
        defaultSortField="id"           // Campo a ordenar por defecto
        defaultSortAsc={false}                  // false = descendente
        progressPending={loading}
        progressComponent={
          <div class="d-flex align-items-center text-danger gap-2 mt-2">
            <strong>Cargando...</strong>
            <div
              class="spinner-border spinner-border-sm ms-auto"
              role="status"
              aria-hidden="true"
            ></div>
          </div>
        }
        dense
        striped
        fixedHeader
        pagination
        paginationComponentOptions={{
          rowsPerPageText: "Filas por página:",
          rangeSeparatorText: "de",
          selectAllRowsItem: false,
        }}
        paginationPerPage={50}
        paginationRowsPerPageOptions={[15, 25, 50, 100]}
        noDataComponent={
          <div style={{ padding: 24 }}>Ningún resultado encontrado.</div>
        }
      />

      {/* Modal pdf normal */}
      <Modal
        size="lg"
        show={Boolean(selectedOrder && !isMobile)}
        onHide={() => setSelectedOrder(null)}
      >
        <PDFViewer
          className="rounded"
          style={{
            width: "100%",
            height: "90vh",
          }}
          showToolbar={true}
        >
          <DocOrderPDF order={selectedOrder} />
        </PDFViewer>
      </Modal>

      {/* Modal para marcar como recogido */}
      <Modal show={modalReject} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title className='d-flex justify-content-center w-100 fw-bold' style={{color:'#FF5757'}}>Cambio de estado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formWeight">
          <div className="d-flex flex-column mb-1 mt-2 gap-2">
            <label>Completa los siguientes campos para marcar la solicitud como "Recogido"</label>
            <input
              id="nameDriver"
              value={nameDriver}
              className="form-control form-control-sm"
              placeholder="**Nombre conductor**"
              onChange={(e) => setNameDriver(e.target.value)}
              style={{textTransform:'uppercase'}}
              required
            />
            <input
              id="nameReceiver"
              value={nameReceiver}
              className="form-control form-control-sm"
              placeholder="**Nombre quien recibe**"
              onChange={(e) => setNameReceiver(e.target.value)}
              style={{textTransform:'uppercase'}}
              required
            />
          </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={(e)=>(handleUpdateCollect(e))}>
            {recogiendo ? 'MARCANDO...' : 'MARCAR'}
          </Button>
          <Button variant="danger" onClick={(e)=>(closeModal(e))}>
            CANCELAR
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para marcar como finalizado */}
      <Modal show={modalFinish} onHide={closeModalFinish} centered>
        <Modal.Header closeButton>
          <Modal.Title className='d-flex justify-content-center w-100 fw-bold' style={{color:'green'}}>Documento asociado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="formWeight">
          <div className="d-flex flex-column mb-1 mt-2 gap-1">
            <label>Por favor ingresa el documento que va a estar asociado a esta devolución:</label>
            <input
              className="form-control form-control-sm"
              value={prefix + docAsociado}
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div className="d-flex flex-column mt-2">
            <label className="">Comentarios</label>
            <textarea
              id="supervisorComments"
              className="form-control"
              value={supervisorComments}
              placeholder="Aquí puedes agregar tus comentarios"
              onChange={(e)=>setSupervisorComments(e.target.value)}
              style={{ minHeight: 70, maxHeight: 100, fontSize: 12 }}
            ></textarea>
          </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={(e)=>(handleUpdateFinish(e))}>
            {finalizando ? 'FINALIZANDO...' : 'FINALIZAR'}
          </Button>
          <Button variant="danger" onClick={(e)=>(closeModalFinish(e))}>
            CANCELAR
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}

export default TableOrders;
