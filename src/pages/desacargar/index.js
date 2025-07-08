import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { utils, write } from 'xlsx';
import { saveAs } from 'file-saver';
import { getAllProducts , getAllProductsPg } from "../../services/productService";
import { createProduct , updateProduct } from '../../services/productService';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

const Descarga = () => {
  const [data, setData] = useState([]);
  const [pg, setPg] = useState([]);
  const [result, setResult] = useState([]);

  const [byUpdate, setByUpdate] = useState([]);
  const [byCreate, setByCreate] = useState([]);

  /* useEffect(() => {
    getAllProducts().then((res)=>{
        setData(res);
    });
    getAllProductsPg().then((res)=>{
      setPg(res);
    });
  }, []); */

  useEffect(() => {
    let siesa ;
    let pg;
    getAllProducts()
      .then((res)=>{
        siesa = res
        getAllProductsPg()
          .then((res)=>{
            pg = res
            //filtrar datos del siesa
            const DataFiltrada = siesa.map(({ item }) => ({
              codigo: item.codigo,
              descripcion: item.descripcion,
              um: item.um
            }));
            //filtrar datos de pgadmin
            const PgFiltrada = pg.map(( item ) => ({
              codigo: item.id,
              descripcion: item.description,
              um: item.um
            }));

            //se busca los elementos que el codigo ya existe, pero la referencia es diferente
            const diferencias = DataFiltrada.filter(
              item1 => PgFiltrada.some(item2 => parseInt(item1.codigo) === parseInt(item2.codigo) && !(item1.descripcion === item2.descripcion))
            );

            //se bucasn los datos que el codigo esta en siesa y no en pgadmina
            const porCrear = DataFiltrada.filter(
              item1 => !PgFiltrada.some(item2 => parseInt(item1.codigo) === parseInt(item2.codigo))
            );
        
            const result = [...porCrear]
        
            //se filtrar datos que el codigo son string
            const filtroResult = result.filter(item => !(item.codigo.includes("LC0003 ") || (item.codigo.includes("MP6075 ")) || item.codigo.includes("SR0060 ") || item.codigo.includes("MP0415 ")))
        
            //se guardan los valores en constantes de la funcion
            const creates = [...filtroResult]
            const updates = [...diferencias]

            //se guardan en variables locales
            setByCreate(creates)
            setByUpdate(updates)
            
          });
      });
  }, []);

  const downloadExcel = () => {
    const filtroPg = pg.map((item)=>item.id)
    const filtroSiesa = data.map((item)=>item.item.codigo.replace(/\s+/g, ''))
    const duo = data.filter((item)=>!filtroPg.includes(item.item.codigo))
   setResult(duo)
  };

  const handleCreateProducts = (e) => {
    e.preventDefault();

    // Muestra la barra de carga
    let timerInterval;
    Swal.fire({
        title: 'Creando...',
        text: 'Por favor, espera...',
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

    createProduct(byCreate)
    .then(()=>{
      Swal.fire({
        icon:'success',
        title:'Correcto',
        text:'He han creado los productos de manera exitosa',
        timer: 5000
      })
      .then(()=>{
        window.location.reload()
      })
    })
    .catch(()=>{
      Swal.fire({
        icon:'error',
        title:'¡ERROR!',
        text:'Hubo un error al momento de crear los productos'
      })
      window.location.reload()
    })
  }

  const handleUpdateProducts = (e) => {
    e.preventDefault();

    // Muestra la barra de carga
    let timerInterval;
    Swal.fire({
        title: 'editando...',
        text: 'Por favor, espera...',
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
    updateProduct(byUpdate)
    .then(()=>{
      Swal.fire({
        icon:'success',
        title:'Correcto',
        text:'He han editado los productos de manera exitosa',
        timer: 5000
      })
      .then(()=>{
        window.location.reload()
      })
    })
    .catch(()=>{
      window.location.reload()
      Swal.fire({
        icon:'error',
        title:'¡ERROR!',
        text:'Hubo un error al momento de editar los productos'
      })
    })
  }

  /* const obtenerElementosUnicos = () => {
    const DataFiltrada = data.map(({ item }) => ({
      codigo: item.codigo,
      descripcion: item.descripcion,
      um: item.um
    }));
    const PgFiltrada = pg.map(( item ) => ({
      codigo: item.id,
      descripcion: item.description,
      um: item.um
    }));

    const existentes = DataFiltrada.filter(
      item1 => !PgFiltrada.some(item2 => parseInt(item1.codigo) === parseInt(item2.codigo))
    );

    const resultExist = [...existentes]

    const filtroExist = resultExist.filter(item => !(item.codigo.includes("LC0003 ") || (item.codigo.includes("MP6075 ")) || item.codigo.includes("SR0060 ") || item.codigo.includes("MP0415 ")))
    
    const diferencias = DataFiltrada.filter(
      item1 => PgFiltrada.some(item2 => parseInt(item1.codigo) === parseInt(item2.codigo) && !(item1.descripcion === item2.descripcion))
    );
    
    const updates = [...filtroExist]
    const creates = [...diferencias]

    return [...updates, ...creates];
  };

  const obtenerProductosFaltantes = () => {
    const DataFiltrada = data.map(({ item }) => ({
      codigo: item.codigo,
      descripcion: item.descripcion,
      um: item.um
    }));
    const PgFiltrada = pg.map(( item ) => ({
      codigo: item.id,
      descripcion: item.description,
      um: item.um
    }));

    const porCrear = DataFiltrada.filter(
      item1 => !PgFiltrada.some(item2 => parseInt(item1.codigo) === parseInt(item2.codigo))
    );

    const result = [...porCrear]

    const filtroResult = result.filter(item => !(item.codigo.includes("LC0003 ") || (item.codigo.includes("MP6075 ")) || item.codigo.includes("SR0060 ") || item.codigo.includes("MP0415 ")))
    

    const creates = [...filtroResult]
    return [...creates];
  }

  const obtenerProductosExistentes = () => {
    const DataFiltrada = data.map(({ item }) => ({
      codigo: item.codigo,
      descripcion: item.descripcion,
      um: item.um
    }));
    const PgFiltrada = pg.map(( item ) => ({
      codigo: item.id,
      descripcion: item.description,
      um: item.um
    }));

    const diferencias = DataFiltrada.filter(
      item1 => PgFiltrada.some(item2 => parseInt(item1.codigo) === parseInt(item2.codigo) && !(item1.descripcion === item2.descripcion))
    );
    
    const updates = [...diferencias]

    return [...updates];
  };

  const elementosUnicos = obtenerElementosUnicos();
  const faltantes = obtenerProductosFaltantes();
  const existentes = obtenerProductosExistentes(); */

  return (
    <div className='row row-cols-sm-2 w-100 '>
      <div className='d-flex flex-column'>
        <h1>Data Table</h1>
        <h1>Productos por crear</h1>
        {/* {JSON.stringify(pg)} */}
        {/* {JSON.stringify(elementosUnicos)} */}
        
        <table>
          <thead>
            <th>Ref.</th>
            <th>Descripción</th>
            <th>UM</th>
          </thead>
          <tbody>
            {byCreate.map((row, index) => (
              <tr key={index}>
                <td>{row.codigo}</td>
                <td>{row.descripcion}</td>
                <td>{row.um}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className='mt-2 btn btn-success' onClick={(e) => handleCreateProducts(e)}>Crear productos</button>
      </div>
      <div className='d-flex flex-column'>
        <h1>Data Table</h1>
        <h1>Productos por editar</h1>
        
        {/* {JSON.stringify(pg)} */}
        {/* {JSON.stringify(elementosUnicos)} */}
        <table>
          <thead>
            <th>Ref.</th>
            <th>Descripción</th>
            <th>UM</th>
          </thead>
          <tbody>
            {byUpdate.map((row, index) => (
              <tr key={index}>
                <td>{row.codigo}</td>
                <td>{row.descripcion}</td>
                <td>{row.um}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className='mt-2 btn btn-primary' onClick={(e)=>handleUpdateProducts(e)}>editar productos</button>
      </div>
      <button onClick={downloadExcel}>Download Excel</button>
    </div>
  );
};

export default Descarga;
