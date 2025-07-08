import { useState, useEffect } from "react";
import * as LuIcons from "react-icons/lu"
import TableBranches from "../../components/TableBranches";
import ModalBranches from "../../components/ModalBranches";
import { getAllBranchesPOS } from "../../services/branchService"

export default function Branches () {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [suggestions, setSuggestions] = useState([])
  const [search, setSearch] = useState('')
  const [showModalBranches, setShowModalBranches] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    findAllBranchesPOS()
  }, [])

  const findAllBranchesPOS = () => {
    setLoading(true)
    getAllBranchesPOS()
      .then((data) => {
        setBranches(data)
        setSuggestions(data)
        setLoading(false)
      })
      .catch((error) => {
        setLoading(false)
      });
  }

  const searchBranches = (e) => {
    const { value } = e.target
    if(value !== "") {
      const filteredUsers = branches.filter((elem) => {
        if(
          elem.branch.includes(value) ||
          elem.descripcion.toLowerCase().includes(value.toLowerCase()) ||
          elem.client.razonSocial.toLowerCase().includes(value.toLowerCase())
        ) {
          return elem
        }
      })
      if(filteredUsers.length > 0) {
        setSuggestions(filteredUsers)
      } else {
        setSuggestions(branches)
     }
    } else {
      setSuggestions(branches)
    }
    setSearch(value)
  }

  return (
    <div className="d-flex flex-column container mt-5">
      <ModalBranches
        branch={selectedBranch}
        setBranch={setSelectedBranch}
        showModal={showModalBranches} 
        setShowModal={setShowModalBranches} 
        reloadInfo={findAllBranchesPOS} 
      />
      <div className="d-flex flex-column gap-2 h-100">
        <div className="d-flex justify-content-end mt-2 gap-3">
          <input
            type="search"
            value={search}
            className="form-control form-control-sm w-100"
            placeholder="Buscar sucursal"
            onChange={searchBranches }
          />
          <button
            title="Nueva sucursal"
            className="d-flex align-items-center text-nowrap btn btn-sm btn-danger text-light gap-1" 
            onClick={(e) => setShowModalBranches(!showModalBranches)}>
              Nueva sucursal
              <LuIcons.LuGitBranchPlus style={{width: 15, height: 15}} />
          </button>
        </div>
        <TableBranches 
          branches={suggestions} 
          setShowModal={setShowModalBranches} 
          setSelectedBranch={setSelectedBranch}
          loading={loading}
        />
      </div>
    </div>
  )
}