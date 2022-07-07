import React, { useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';

import './App.css';

function fetcher(url) {
  return axios.get(url).then(res => res.data);
}

async function addProduct(product) {
  let response = await axios.post('/products', product);
  return response.data;
}

function useProducts() {
  const { data, error, mutate } = useSWR('/products', fetcher);
  return {
    products: data,
    isLoading: !data,
    isError: !!error,
    mutate
  };
}

function Products() {
  const { products, isLoading, isError } = useProducts();
  if(isError)
    return (
      <div>Unable to fetch products.</div>
    );

  if(isLoading)
    return (
      <div>Loading products...</div>
    );

  return (
    products.map((product) => (
      <div key={product.id} className="product-item">
        <div>{product.name}</div>
        <div>${product.price}</div>
      </div>
    ))
  );
}

function AddProduct({ goToList }) {
  const { products, mutate } = useProducts();
  const [product, setProduct] = useState({
    id: products.length + 1,
    name: '',
    price: null
  });
  const [disabled, setDisabled] = useState(true);

  async function handleAdd() {
    goToList();
    mutate(async () => {
      return [...products, await addProduct(product)]
    }, { optimisticData: [...products, product], rollbackOnError: true, revalidate: false } );
  }

  function handleFieldUpdate(e) {
    const element = e.target;
    const value = element.type === 'number' ? parseInt(element.value) : element.value;
    const nextProduct = {...product, [element.name]: value};

    setProduct(nextProduct);
    setDisabled(!nextProduct.name || !nextProduct.price);
  }

  return(
    <div className="product-form">
      <input
        type="text"
        name="name"
        placeholder="Name"
        autoFocus
        onChange={handleFieldUpdate}/>
      <input
        type="number"
        name="price"
        min="1"
        placeholder="Price"
        onChange={handleFieldUpdate}/>
      <button onClick={handleAdd} disabled={disabled}>Add</button>
    </div>
  );
}

function App() {
  const [ mode, setMode ] = useState('list');
  return (
    <>
    <div className="menu-bar">
      <div onClick={() => { setMode('list') }}
          className={mode === 'list' ? 'selected' : ''}>All products</div>
      <div onClick={() => { setMode('add') }}
          className={mode === 'add' ? 'selected' : ''}>Add product</div>
    </div>
    <div className="wrapper">
      { mode === 'list' ? <Products/> :
          <AddProduct goToList={() => setMode('list')}/> }
    </div>
    </>
  );
}

export default App;
