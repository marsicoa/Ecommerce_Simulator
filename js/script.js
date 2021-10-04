/*Variables*/
let pedido = []
const contenedorArticulos = document.getElementById('contenedor-articulos')
const total = document.getElementById('carrito-total')
const contador= document.getElementById('carrito-contador')
const modal = document.getElementById('pedido')

/* DOM */

/*Modal*/
$().ready(()=>{
    $('.modal').modal()
})

/*fetch a mi JSON, me traigo los articulos*/
const fetchArticulos = async () => {
   const resp = await fetch('./json/articulos.json')
   const data = await resp.json()
   articulos = data
   articulos.forEach( (el) => {
      localStorage.setItem(`${el.id}`, JSON.stringify(el)) //guardo mis articulos en el Local Storage como base de datos
   })
   verArticulos(articulos)
}
fetchArticulos()

/*Mostramos los articulos en el DOM*/
const verArticulos = (x) => {
   contenedorArticulos.innerHTML = ''

    x.forEach( (articulo) => {
        const div = document.createElement('div')
        div.classList.add('articulo')
        div.innerHTML = `
                    <img src=${articulo.img} alt="">
                    <h5><i class='tiny material-icons'>description</i> ${articulo.descripcion} <span><h6> <i class='tiny material-icons'>computer</i> Código: (${articulo.codigo}) <h6></span></h5>
                    <p><i class='tiny material-icons'>account_balance_wallet</i> $${articulo.precio}</p>
                    <button onclick=carritoAgregarArticulo(${articulo.id}) class="btn waves-effect waves-light">Agregar <i class="tiny material-icons" style="font-size:15px">add_shopping_cart</i></button>
        `        
        contenedorArticulos.appendChild(div)
        
    } )
}

/*Pedido, agregar articulos al carrito*/
let carritoAgregarArticulo = (ID) => {
   let articuloPedido = pedido.find(el => el.id == ID)
   if (articuloPedido) {
       articuloPedido.cantidad += 1
   } else {
       let {id, codigo, descripcion, precio} = articulos.find( el => el.id == ID)
       pedido.push({id: id, codigo: codigo, descripcion: descripcion, precio: precio, cantidad: 1})
   }
   localStorage.setItem('pedido', JSON.stringify(pedido)) //guardamos el pedido en el Local Storage
   carritoGuardarArticulo()
}

/*Guardar articulo en carrito*/
const carritoGuardarArticulo = () => {
   modal.innerHTML=''
   pedido.forEach( (articulo) => {
       const div = document.createElement('div')
       div.classList.add('articuloPedido')
       div.innerHTML = `
                       <p><i class='tiny material-icons'>description</i> Artículo: ${articulo.descripcion}</p>
                       <p><i class='tiny material-icons'>account_balance_wallet</i> Precio: $${articulo.precio * articulo.cantidad}</p>
                       <p>Cantidad: ${articulo.cantidad}</p>
                       <button onclick=eliminarArticulo(${articulo.id}) class="btn waves-effect waves-light"><i class="material-icons">delete</i></button>
                   `
       modal.appendChild(div)
   })
   contador.innerText = pedido.length
   total.innerText = pedido.reduce( (acc, el) => acc + (el.precio * el.cantidad), 0 )
}

/*Borrar articulos del carrito*/
function eliminarArticulo(id) {
   let articuloEliminado = pedido.find( el => el.id == id )
   articuloEliminado.cantidad--
   if (articuloEliminado.cantidad == 0) {
       let indice = pedido.indexOf(articuloEliminado)
       pedido.splice(indice, 1)
   }
   carritoGuardarArticulo()
}

/*Interactuamos con la API de Mercadopago para efectuar el pago del articulo*/
$('#comprar').click( async () => {
    const carritoMP = pedido.map( (art) => {
        return {
            title: art.descripcion,
            description: art.codigo,
            picture_url: `http://127.0.0.1:5500/${art.img}`,
            category_id: art.id,
            quantity: art.cantidad,
            currency_id: "ARS",
            unit_price: art.precio
        }
    })
    const resp = await fetch('https://api.mercadopago.com/checkout/preferences', {
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer TEST-8795248907721922-100113-01d9bec684ae9a5ac7bd56c05a3fa26f-234513991'
                    },
                    body: JSON.stringify({
                        items: carritoMP,
                        back_urls: {
                            success: 'http://127.0.0.1:5500/index.html',
                            failure: 'http://127.0.0.1:5500/index.html'
                        }
                    })
                })
    const data = await resp.json()
    window.location.replace(data.init_point)
})
