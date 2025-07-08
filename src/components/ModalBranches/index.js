import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { createBranchPOS, updateBranchPOS } from "../../services/branchService";
import { getAllClientsPOS } from "../../services/clientService";
import { findSellers } from "../../services/sellerService";

export default function ModalBranches({
  branch,
  setBranch,
  showModal,
  setShowModal,
  reloadInfo,
}) {
  const [info, setInfo] = useState({
    branch: "",
    descripcion: "",
    clientId: "",
    sellerId: "",
  });
  const [clients, setClients] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllClientsPOS().then((data) => setClients(data));
    findSellers().then(({ data }) => setSellers(data));
  }, []);

  useEffect(() => {
    if (branch) {
      setInfo({
        branch: branch.branch,
        descripcion: branch.descripcion,
        clientId: branch.clientId,
        sellerId: branch.sellerId,
      });
    }
  }, [branch]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setInfo({
      ...info,
      [id]: value.toUpperCase(),
    });
  };

  const handleCreateNewBranch = (e) => {
    e.preventDefault();
    createBranchPOS(info)
    .then((data) => {
      setShowModal(!showModal)
      reloadInfo();
      Swal.fire({
        title: '¡Correcto!',
        text: 'El cliente se ha creado correctamente',
        icon: 'success',
        showConfirmButton: false,
        timer: 2500
      })
      cleanForm()
    })
    .catch((error) => {
      setError(error.response.data.errors.original.detail)
      setTimeout(() => setError(''), 2500)
    });
  };

  const handleUpdateBranch = (e) => {
    e.preventDefault();
    updateBranchPOS(branch.id, info)
      .then((data) => {
        cleanForm()
        setShowModal(!showModal)
        reloadInfo();
        Swal.fire({
          title: '¡Correcto!',
          text: 'El cliente se ha actualizado correctamente',
          icon: 'success',
          showConfirmButton: false,
          timer: 2500
        })
      })
      .catch((error) => {
        setError(error.response.data.errors.original.detail)
        setTimeout(() => setError(''), 2500)
      });
  };

  const cleanForm = () => {
    setInfo({
      branch: "",
      descripcion: "",
      clientId: "",
      sellerId: "",
    });
    setBranch(null);
  };

  return (
    <Modal show={showModal} style={{ fontSize: 11 }} centered>
      <Modal.Header>
        <Modal.Title className="text-danger">
          {branch ? "Actualizar" : "Crear"} Sucursal
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-2">
        <div className="container h-100">
          <form onSubmit={branch ? handleUpdateBranch : handleCreateNewBranch}>
            <div>
              <div>
                <label className="fw-bold">Cliente</label>
                <select
                  id="clientId"
                  value={info.clientId}
                  className="form-select form-select-sm"
                  onChange={handleChange}
                  required
                >
                  <option selected disabled value="">
                    -- Seleccione un cliente --
                  </option>
                  {clients.map((elem) => (
                    <option value={elem.nit}>{elem.razonSocial}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="fw-bold">Id.</label>
                <input
                  id="branch"
                  type="text"
                  value={info.branch}
                  className="form-control form-control-sm"
                  minLength={3}
                  maxLength={3}
                  onChange={handleChange}
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <label className="fw-bold">Nombre</label>
                <input
                  id="descripcion"
                  type="text"
                  value={info.descripcion}
                  className="form-control form-control-sm"
                  onChange={handleChange}
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <label className="fw-bold">Vendedor</label>
                <select
                  id="sellerId"
                  value={info.sellerId}
                  className="form-select form-select-sm"
                  onChange={handleChange}
                  required
                >
                  <option selected disabled value="">
                    -- Seleccione un vendedor --
                  </option>
                  {sellers.map((elem) => (
                    <option value={elem.id}>{elem.description}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="d-flex w-100 mt-2">
              <span
                className="text-center text-danger w-100 m-0"
                style={{ height: 15 }}
              >
                {error}
              </span>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button type="submit" variant="success">
                {branch ? "Guardar Cambios" : "Guardar"}
              </Button>
              <Button
                variant="secondary"
                onClick={(e) => {
                  setShowModal(false);
                  cleanForm();
                  setBranch(null);
                }}
              >
                Cerrar
              </Button>
            </div>
          </form>
        </div>
      </Modal.Body>
      <Modal.Footer></Modal.Footer>
    </Modal>
  );
}
