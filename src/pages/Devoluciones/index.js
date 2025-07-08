import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as HiIcons from "react-icons/hi";
import * as FaIcons from "react-icons/fa";
import * as VscIcons from "react-icons/vsc";
import * as XLSX from "xlsx";
import TableOrders from "../../components/TableOrders";
import AuthContext from "../../context/authContext";
import { MdPriceChange } from "react-icons/md";
import {
  findDevolucones,
  findDevoluconesByAgencias,
  findDevoluconesByClientes,
  findDevoluconesByCreator,
  findDevoluconesAutorizadas
} from "../../services/devolucionesService";
import './styles.css'
import Swal from "sweetalert2";

export default function Devoluciones() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [filterDate, setFilterDate] = useState({
    initialDate: null,
    finalDate: null,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const refTable = useRef();
  const [typeFillDate, setTypeFillDate] = useState('');

  useEffect(() => {
    getAllOrders();
  }, []);

  const getAllOrders = () => {
    setLoading(true)
    if(user.role === 'admin' || user.role === 'supervisor'){
      findDevolucones()
      .then(({ data }) => {
        setOrders(data);
        setSuggestions(data);
        setLoading(false)
      })
    }else if(user.role === 'Autorizador agencias'){
      findDevoluconesByAgencias()
        .then(({ data }) => {
          setOrders(data);
          setSuggestions(data);
          setLoading(false)
        });
    }else if(user.role === 'Autorizador clientes'){
      findDevoluconesByClientes()
        .then(({ data }) => {
          setOrders(data);
          setSuggestions(data);
          setLoading(false)
        });
    }else if(user.role === 'logistica'){
      findDevoluconesAutorizadas()
        .then(({ data }) => {
          setOrders(data);
          setSuggestions(data);
          setLoading(false)
        })
    }else{
      findDevoluconesByCreator(user.id)
        .then(({ data }) => {
          setOrders(data);
          setSuggestions(data);
          setLoading(false)
        })
    }
  };

  const handleChangeFilterDate = (e) => {
    const { id, value } = e.target;
    setFilterDate({
      ...filterDate,
      [id]: value,
    });
  };

  const handleFilterDate = () => {
    if(filterDate.finalDate !== null && filterDate.initialDate !== null){
      const initialDate = new Date(filterDate?.initialDate?.split('-').join('/')).toLocaleDateString();
      const finalDate = new Date(filterDate?.finalDate?.split('-').join('/')).toLocaleDateString();
      const filtered = orders.filter((elem) => {
        const splitDate = new Date(elem.craetedAt).toLocaleDateString();
        if (splitDate >= initialDate && splitDate <= finalDate) {
          return elem;
        }
        return 0;
      });
      if(filtered.length > 0) {  
        setSuggestions(filtered)
      } else {
        setSuggestions([])
      }
    }
  }

  const removeFilterDate = () => {
    setFilterDate({
      initialDate: 0,
      finalDate: 0,
    });
    setTypeFillDate('');
    getAllOrders();
  };

  const searchReturns = (e) => {
    const { value } = e.target
    if(value !== "") {
      const filteredUsers = orders.filter((elem) => {
        if(elem?.coDescription !== null && elem?.coDescription.includes(value.toUpperCase())) {
          return elem
        }else if(elem?.clientDescription !== null && elem?.clientDescription.includes(value.toUpperCase())){
          return elem
        }
      })
      if(filteredUsers.length > 0) {
        setSuggestions(filteredUsers)
      } else {
        setSuggestions(orders)
     }
    } else {
      setSuggestions(orders)
    }
    setSearch(value)
  }

  const flattenObject = (obj, prefix = "") => {
    delete obj.items;
    return Object.keys(obj).reduce((acc, key) => {
      const pre = prefix?.length ? prefix + "." : "";
      if (typeof obj[key] === "object" && obj[key] !== null) {
        Object.assign(acc, flattenObject(obj[key], pre + key));
      } else {
        acc[pre + key] = obj[key];
      }

      delete acc.userId;
      delete acc["user.id"];
      delete acc["user.email"];
      delete acc["user.password"];
      delete acc["user.recoveryToken"];
      delete acc["user.createdAt"];

      return acc;
    }, {});
  };

  const handleDownload = () => {
    const date = new Date();
    const workbook = XLSX.utils.book_new();
    const newData = orders.map((value) => flattenObject(value));
    console.log(orders);
    const worksheet = XLSX.utils.json_to_sheet(newData);
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `Pedidos-${date.toDateString("es-CO")}`
    );
    XLSX.writeFile(workbook, "Pedidos.xlsx");
    //navigate("/formulario");
  };

  return (
    <div className="d-flex flex-column container mt-5">
      <div className="d-flex flex-column h-100 gap-2">
        <div className="div-botons justify-content-center mt-2 gap-2 w-100">
          <div className="d-flex flex-row w-100 gap-2">
            <form
              className="position-relative d-flex justify-content-center w-100"
              onSubmit={searchReturns/* findOrder */}
            >
              <input
                type="search"
                value={search}
                className="form-control form-control-sm"
                style={{paddingRight: 35, textTransform:'uppercase'}}
                placeholder="Buscar por solicitante"
                /* onChange={(e) => setSearch(e.target.value)} */
                onChange={(e)=>searchReturns(e)}
              />
              <button
                type="submit"
                className="position-absolute btn btn-sm"
                style={{ right: 0 }}
              >
                  {search?.length ? <FaIcons.FaSearch /> : <VscIcons.VscDebugRestart />}
              </button>
            </form>
            <div class="btn-group">
              {/* <button
                title="Filtro por fecha"
                type="button"
                class="d-flex align-items-center btn btn-sm btn-primary"
                onClick={(e)=>(
                  typeFillDate === 'creacion' ? getFilteredOrders() : getFilteredOrdersByDelivery()
                )}
              >
                <FaIcons.FaFilter />
              </button> */}
              <button
                type="button"
                class="btn btn-sm btn-primary dropdown-toggle dropdown-toggle-split"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <FaIcons.FaFilter className="me-2"/>
                <span class="visually-hidden">Toggle Dropdown</span>
              </button>
              <ul class="dropdown-menu p-0 m-0">
                {/* <label className="d-flex w-100 text-primary fw-bold ms-2">Tipo de filtro:</label> */} 
                <li className="d-flex flex-row gap-2 mb-1 mt-2">
                  <input
                    id="initialDate"
                    type="date"
                    value={filterDate.initialDate}
                    className="form-control form-control-sm ms-2"
                    max={(filterDate.finalDate !== null) ? filterDate.finalDate : new Date().toISOString().split("T")[0]}
                    onChange={handleChangeFilterDate}
                  />
                  -
                  <input
                    id="finalDate"
                    type="date"
                    value={filterDate.finalDate}
                    className="form-control form-control-sm me-2"
                    min={filterDate.initialDate}
                    max={new Date().toISOString().split("T")[0]}
                    disabled={filterDate.initialDate === null}
                    onChange={handleChangeFilterDate}
                  />
                  
                </li>
                  <li className="gap-2 d-flex p-1">
                      <button
                        className="btn btn-sm btn-primary w-100"
                        onClick={(e)=>searchReturns(e)}
                      >
                        Filtrar
                      </button>
                      <button
                        className="btn btn-sm btn-danger w-100"
                        onClick={removeFilterDate}
                      >
                        Borrar filtro
                      </button>
                  </li>
              </ul>
            </div>
            <button
              title="Descargar Excel"
              className="btn btn-sm btn-success"
              onClick={(e) => handleDownload()}
            >
              <FaIcons.FaDownload />
            </button>
          </div> 
          <div className="div-botons">
          {(user.role === 'admin' || user.role === 'solicitante' ) &&
            <button
              title="Nuevo pedido"
              className="d-flex align-items-center text-nowrap btn btn-sm btn-danger text-light gap-1 h-100"
              onClick={(e) => navigate("/form")}
            >
              Nueva devolución
              <HiIcons.HiDocumentAdd style={{ width: 15, height: 15 }} />
            </button>
          }
          </div> 
        </div>
        <TableOrders ref={refTable} orders={suggestions} getAllOrders={getAllOrders} loading={loading} />
      </div>
    </div>
  );
}
