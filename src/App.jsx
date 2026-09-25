import { useEffect, useState } from "react";
function App() {

  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  useEffect(function () {

    async function getProducts() {
      try {
        const response = await fetch("http://localhost:3000/products");
        if (!response.ok) {
          throw new Error(`GET /products failed: HTTP ${response.status}`);
        }

        const data = await response.json();

        setProducts(data);
        setError("");
      } catch (error) {
        console.error("讀取商品失敗", error);
        setError("無法讀取商品，請稍後再試。");
      }
    }

    getProducts();

  }, []);


  async function addProduct(event) {
    event.preventDefault();

    if (name === "" || price === "" || stock === "") {
      return;
    }

    if (editingId !== null) {
      try {
        const response = await fetch(`http://localhost:3000/products/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: name,
            price: Number(price),
            stock: Number(stock)
          })
        });

        if (!response.ok) {
          throw new Error(`PUT /products failed: HTTP ${response.status}`);
        }

        const updatedProduct = await response.json();

        setProducts(function (currentProducts) {
          return currentProducts.map(function (product) {
            return product.id === updatedProduct.id ? updatedProduct : product;
          });
        });

        setEditingId(null);
        setName("");
        setPrice("");
        setStock("");
        setError("");
      } catch (error) {
        console.error("更新商品失敗", error);
        setError("無法更新商品，請檢查輸入或稍後再試。");
      }
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name,
          price: Number(price),
          stock: Number(stock)
        })
      });

      if (!response.ok) {
        throw new Error(`POST /products failed: HTTP ${response.status}`);
      }
      const newProduct = await response.json();


      setProducts(currentProducts => [...currentProducts, newProduct]);
      setName("");
      setPrice("");
      setStock("");
      setError("");
    } catch (error) {
      console.error("新增商品失敗", error);
      setError("無法新增商品，請檢查輸入或稍後再試。");
    }
  }

  async function deleteProduct(id) {
    try {
      const response = await fetch(`http://localhost:3000/products/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error(`DELETE /products failed: HTTP ${response.status}`);
      }

      setProducts(currentProducts =>
        currentProducts.filter(product => product.id !== id)
      );
      setError("");
    } catch (error) {
      console.error("刪除商品失敗", error);
      setError("無法刪除商品，請稍後再試。");
    }
  }

  function startEdit(product) {
    setEditingId(product.id);

    setName(product.name);
    setPrice(product.price);
    setStock(product.stock);
  }
  return (
    <div>
      <h1>商品管理系統</h1>
      <p>Full-Stack Product Management System</p>
      {error && <p role="alert">{error}</p>}
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
          {editingId !== null ? "儲存修改" : "新增商品"}
        </button>
      </form>

      {products.map(function (product) {
        return (
          <div key={product.id}>
            <h2>{product.name}</h2>
            <p>價格：{product.price}</p>
            <p>庫存：{product.stock}</p>
            <button onClick={function () {
              startEdit(product);
            }}>
              編輯
            </button>
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
