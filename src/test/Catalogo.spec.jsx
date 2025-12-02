import { fireEvent, render, screen } from "@testing-library/react"
import Catalogo from "../pages/Catalogo.jsx"
import React from "react"


beforeEach(()=>{
    Storage.prototype.getItem = jest.fn(()=>
        JSON.stringify([])
    )
    Storage.prototype.setItem = jest.fn()
    console.log(JSON.parse(JSON.stringify([])))
})

describe('Catalogo Page', ()=>{
    const productosMock = [
  {
    id: 1,
    nombre: 'Producto 1',
    descripcion: 'Descripción 1',
    precio: 1000,
    imagen: 'url_imagen_1.jpg'
  },
  // ...otros productos si quieres
];

    it('muestra catalogo correctamente', ()=>{
        render(<Catalogo sinHeaderFooter={true} />)
        expect(screen.getByText("Disco de Freno Brembo")).toBeInTheDocument()
        // expect(screen.getByText("Filtro de aceite original para motores Volvo D12 y D13")).toBeInTheDocument()
        // expect(screen.getByText("45000")).toBeInTheDocument()
        // expect(screen.getByText("filtros")).toBeInTheDocument()
    })

    it('se guarda en localStorage al hacer clic en guardar',async ()=>{
        render(<Catalogo productosActuales={productosMock} sinHeaderFooter={true} />)
        const button = screen.getAllByText("Agregar al Carrito")[0]

        fireEvent.click(button)
        expect(localStorage.setItem).toHaveBeenCalledWith(
            'catalogo', JSON.stringify([productosMock[0]])
        )
    })
})