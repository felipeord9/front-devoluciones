import Swal from "sweetalert2";
import * as Fa from "react-icons/fa";

function TableProducts({ list, setList, formater }) {
  const deleteProductList = (e) => {
    const { id } = e.target.parentNode;
    Swal.fire({
      icon: "warning",
      title: "¡Cuidado!",
      html: `
        <div>¿Está seguro que desea eliminar el producto de la lista?</div>
        <div>${list.agregados[id].id} - ${list.agregados[id].description}</div>
      `,
      showConfirmButton: true,
      confirmButtonText: "Si, eliminar",
      confirmButtonColor: "#dc3545",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      allowEnterKey: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        let newList = [...list.agregados];
        let newTotal = formater(
          list.total.split(".").join("") - newList[id].total.split(".").join("")
        );
        if (newList.length === 1) {
          newList = [];
        } else {
          newList.splice(id, 1);
        }
        setList({
          agregados: newList,
          total: newTotal,
        });
      }
    });
  };

  const restoreProductList = (e) => {
    Swal.fire({
      icon: "warning",
      title: "¡Cuidado!",
      html: `
        <div>¿Está seguro que desea restaurar la lista de productos?</div>
        <div>Vaciará la lista por completo, esta acción no se puede rehacer</div>
      `,
      showConfirmButton: true,
      confirmButtonText: "Si, restaurar",
      confirmButtonColor: "#dc3545",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      allowEnterKey: true,
    }).then(({ isConfirmed }) => {
      if(isConfirmed) {
        setList({
          agregados: [],
          total: "0",
        });
      }
    });
  };

  return (
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
            {/* <th>Valor total</th> */}
            <th style={{ width: 49 }}>
              {list.agregados.length > 1 && (
                <button
                  type="button"
                  className="d-flex align-items-center btn btn-danger m-auto p-0"
                  title="Restaurar"
                  onClick={restoreProductList}
                >
                  <Fa.FaTrashRestore
                    style={{ width: 30, height: 30 }}
                    className="p-2"
                  />
                </button>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {list.agregados.map((elem, index) => (
            <tr>
              <td>{elem.id}</td>
              <td className="text-start">{elem.description}</td>
              <td>{Number(elem.amount).toFixed(2)}</td>
              <td>{elem.um}</td>
              <td className="text-center">{elem.reason}</td>
              {/* <td className="text-end">${elem.total}</td> */}
              <td>
                <button
                  id={index}
                  title="Borrar producto"
                  type="button"
                  className="d-flex align-items-center btn btn-danger m-auto p-0"
                  onClick={deleteProductList}
                >
                  <Fa.FaTrash
                    id={index}
                    style={{ width: 30, height: 30 }}
                    className="p-2"
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        {/* <tfoot>
          <tr>
            <td className="fw-bold">TOTAL</td>
            <td colSpan={3}></td>
            <td className="fw-bold text-end">${list.total}</td>
            <td className="fw-bold text-end"></td>
          </tr>
        </tfoot> */}
      </table>
    </div>
  );
}

export default TableProducts;
