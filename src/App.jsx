import { useState } from "react";


function App() {

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "iPhone 17",
      price: 30000,
      stock: 10
    },
    {
      id: 2,
      name: "MacBook",
      price: 50000,
      stock: 5
    },
    {
      id: 3,
      name: "iPad",
      price: 20000,
      stock: 8
    },
    {
      id: 4,
      name: 'AirPods',
      price: 6000,
      stock: 20,
    }
  ]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  function addProduct(event) {
    if (name === "" || price === "" || stock === "") {
      return;
    }
    event.preventDefault();


    const newProduct = {
      id: Date.now(),
      name: name,
      price: Number(price),
      stock: Number(stock)
    };


    setProducts([...products, newProduct])
    setName("");
    setPrice("");
    setStock("");
  }

  function deleteProduct(id) {

    const newProducts = products.filter(function (product) {
      return product.id !== id;
    });

    setProducts(newProducts);
  }
  return (
    <div>
      <h1>商品管理系統</h1>
      <p>Full-Stack Product Management System</p>
      <form onSubmit={addProduct}>
        <div>
          <label>商品名稱：</label>

          <input
            type="text"
            value={name}
            onChange={function (event) {
              setName(event.target.value);
            }}
          />
        </div>

        <div>
          <label>價格：</label>

          <input
            type="number"
            value={price}
            onChange={function (event) {
              setPrice(event.target.value);
            }}
          />
        </div>

        <div>
          <label>庫存：</label>

          <input
            type="number"
            value={stock}
            onChange={function (event) {
              setStock(event.target.value);
            }}
          />
        </div>

        <button type="submit">
          新增商品
        </button>
      </form>

      {products.map(function (product) {
        return (
          <div key={product.id}>
            <h2>{product.name}</h2>
            <p>價格：{product.price}</p>
            <p>庫存：{product.stock}</p>
            <button onClick={function () {
              deleteProduct(product.id);
            }}>
              刪除
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default App;