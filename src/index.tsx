import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

import "firebase/auth";
import "firebase/firebase-firestore";

import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyAvvQqBys0iT9wfbrW5qYkIaQwIr6Rb1fQ",
  authDomain: "my-project-2020d.firebaseapp.com",
  databaseURL: "https://my-project-2020d.firebaseio.com",
  projectId: "my-project-2020d",
  storageBucket: "my-project-2020d.appspot.com",
  messagingSenderId: "933778217827",
  appId: "1:933778217827:web:879ba61242dcd706d81156",
  measurementId: "G-VBG8Z4EE82"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

class Root extends React.Component {
  login(){
    console.log("login");
    auth.signInAnonymously();

  }

  logout(){
    console.log("logout");
    auth.signInAnonymously();
  }

  render() {
    return (
      <div>
        <div>
          <button onClick={this.login}>login</button>
          <button onClick={this.logout}>logout</button>
        </div>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </div>
    );
  }
}


ReactDOM.render(
  <Root />,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
