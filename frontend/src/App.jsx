import { useEffect, useState } from "react";
import "./App.css";
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
  const totalStock = products.reduce((total, product) => total + product.stock, 0);
  const lowStockCount = products.filter(product => product.stock <= 5).length;
  const numberFormat = new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 2 });

  return (
    <div className="dashboard-layout">
      <a className="skip-link" href="#main-content">跳至主要內容</a>
      <aside className="sidebar" aria-label="系統導覽">
        <a className="brand" href="#dashboard">
          <span className="brand-mark" aria-hidden="true">P</span>
          <span>Product Console<small>商品管理系統</small></span>
        </a>
        <p className="nav-label">WORKSPACE</p>
        <nav className="sidebar-nav">
          <a href="#dashboard"><span aria-hidden="true">▦</span>Dashboard</a>
          <a className="nav-products" href="#products"><span aria-hidden="true">▤</span>Products</a>
        </nav>
        <div className="sidebar-note"><span className="sidebar-note-line" />商品與庫存，一目了然。<small>PRODUCT MANAGEMENT</small></div>
      </aside>

      <main id="main-content" className="main-content">
        <header className="page-header" id="dashboard">
          <div><p className="eyebrow">WORKSPACE / PRODUCTS</p><h1>商品管理</h1><p className="page-description">掌握庫存概況，管理每一項商品。</p></div>
          <a className="header-link" href="#product-form">前往商品表單 <span aria-hidden="true">↗</span></a>
        </header>

        <section className="stats-grid" aria-label="商品統計">
          <article className="stat-card"><p>商品總數</p><div className="stat-value">{numberFormat.format(products.length)}<span>項商品</span></div><small>目前商品列表</small></article>
          <article className="stat-card"><p>總庫存</p><div className="stat-value">{numberFormat.format(totalStock)}<span>件</span></div><small>所有商品庫存加總</small></article>
          <article className="stat-card stat-warning"><p><span className="status-dot" aria-hidden="true" />低庫存商品數</p><div className="stat-value">{numberFormat.format(lowStockCount)}<span>項商品</span></div><small>庫存 ≤ 5 件，包含零庫存</small></article>
        </section>

        {error && <div className="error-banner" role="alert"><strong>操作未完成</strong><span>{error}</span></div>}

        <section className="panel form-panel" id="product-form" aria-labelledby="form-title">
          <div className="panel-heading"><div><p className="eyebrow">{editingId !== null ? "EDIT PRODUCT" : "NEW PRODUCT"}</p><h2 id="form-title">{editingId !== null ? "編輯商品" : "新增商品"}</h2></div><span className="form-note">{editingId !== null ? "修改下方資料後儲存" : "填寫商品名稱、價格與庫存"}</span></div>
          <form className="product-form" onSubmit={addProduct}>
            <div className="field field-name"><label htmlFor="product-name">商品名稱</label><input id="product-name" type="text" value={name} placeholder="輸入商品名稱" onChange={event => setName(event.target.value)} /></div>
            <div className="field"><label htmlFor="product-price">價格</label><input id="product-price" type="number" value={price} placeholder="0" onChange={event => setPrice(event.target.value)} /></div>
            <div className="field"><label htmlFor="product-stock">庫存</label><input id="product-stock" type="number" value={stock} placeholder="0" onChange={event => setStock(event.target.value)} /></div>
            <button className="button-primary" type="submit">{editingId !== null ? "儲存修改" : "新增商品"}<span aria-hidden="true">↗</span></button>
          </form>
        </section>

        <section className="panel products-panel" id="products" aria-labelledby="products-title">
          <div className="panel-heading"><div className="list-title"><h2 id="products-title">商品列表</h2><span className="count-badge">{products.length} 項</span></div><span className="table-note">低庫存標記：≤ 5 件</span></div>
          <div className="table-scroll" role="region" aria-label="商品資料表，可水平捲動" tabIndex={0}>
            <table className="products-table">
              <caption className="sr-only">商品名稱、價格、庫存與管理操作</caption>
              <thead><tr><th scope="col">商品名稱</th><th scope="col" className="numeric">價格</th><th scope="col" className="numeric">庫存</th><th scope="col" className="actions-heading">操作</th></tr></thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className={editingId === product.id ? "editing-row" : undefined}>
                    <th scope="row" className="product-name">{product.name}{editingId === product.id && <span className="editing-label">編輯中</span>}</th>
                    <td className="numeric price-cell">{numberFormat.format(product.price)}</td>
                    <td className="numeric"><span className={product.stock <= 5 ? "stock-badge stock-low" : "stock-badge"}>{numberFormat.format(product.stock)}<span>件{product.stock <= 5 ? " · 低庫存" : ""}</span></span></td>
                    <td><div className="row-actions"><button type="button" className="button-edit" aria-label={"編輯 " + product.name} onClick={() => startEdit(product)}>編輯</button><button type="button" className="button-delete" aria-label={"刪除 " + product.name} onClick={() => deleteProduct(product.id)}>刪除</button></div></td>
                  </tr>
                ))}
                {products.length === 0 && <tr><td colSpan={4} className="empty-state"><strong>{error ? "目前無法顯示商品" : "目前沒有商品"}</strong><p>{error ? "請參考上方錯誤訊息。" : "使用上方表單新增第一項商品。"}</p></td></tr>}
              </tbody>
            </table>
          </div>
          <div className="table-footer">共 {numberFormat.format(products.length)} 項商品<span>PRODUCT INVENTORY</span></div>
        </section>
      </main>
    </div>
  );
}

export default App;
