import * as MdIcons from "react-icons/md"
import * as AiIcons from "react-icons/ai"
import { CgFileAdd } from "react-icons/cg";

export const NavBarData = [
  {
    title: "Nueva Devolución",
    path: "/form",
    icon: <CgFileAdd />,
    cName: "nav-text",
    access: ['admin', 'solicitante']
  },
  {
    title: "Tabla Devoluciones",
    path: "/inicio",
    icon: <MdIcons.MdOutlineInventory />,
    cName: "nav-text",
    access: ['admin', 'solicitante', 'logistica','supervisor','Autorizador clientes','Autorizador agencias']
  },
  {
    title: "Usuarios",
    path: "/usuarios",
    icon: <AiIcons.AiOutlineUser />,
    cName: "nav-text",
    access: ['admin']
  },
];