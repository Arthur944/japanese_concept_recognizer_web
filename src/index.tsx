import React from 'react';
import * as ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'tippy.js/dist/tippy.css';
import { Navbar } from './components/navbar';
import {MainPage} from "./components/main-page";

function App(){
  return (
      <>
        <Navbar />
        <MainPage />
      </>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
