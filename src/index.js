import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // ✅ Импортируем BrowserRouter
import "./index.css";
import App from "./App";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter> 
    <ToastContainer
      toastClassName={() =>
        "relative flex py-4 px-3 rounded overflow-hidden cursor-pointer bg-white shadow-lg"
      }
      bodyClassName={() => "text-black text-base font-normal"}
      position="bottom-left"
      autoClose={4000}
      hideProgressBar={true}
      newestOnTop={false}
      closeButton={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
    <App />
  </BrowserRouter>
);
