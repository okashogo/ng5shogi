import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
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
const db = firebase.firestore();
const collection_record = db.collection('record');
const collection_challenge = db.collection('challenge');

interface IState {
  loginUser : any;
}

class Root extends React.Component<{}, IState> {
  constructor(props : string[]) {
    super(props);
    this.state = {
      loginUser: null,
    };

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.add = this.add.bind(this);
  }

  login(){
    console.log("login");
    auth.signInAnonymously();
    auth.onAuthStateChanged(user => {
        console.log("aaa");
        if (user) {
          console.log(user.uid);
          this.setState({loginUser: user});
          console.log(this.state.loginUser.uid);
        }
      });
  }

  add(){
      collection_record.add({
        userId: this.state.loginUser.uid,
        message: "oka",
      })
      .then(doc => {
        console.log(doc.id + ' added!');
      })
      .catch(error => {
        console.log(error);
      })
  }

  logout(){
    console.log("logout");
    auth.signInAnonymously();
    this.setState({loginUser: null});
  }

  componentDidMount  = async () =>{
    collection_record.onSnapshot(snapshot => {
      snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
          console.log("ADD!!");
          console.log(change.doc.data().userId);
          console.log(change.doc.data().message);
        }
      })
    });
  }


  render() {
    return (
        <div>
          <h1>５枚持ったら負け将棋</h1>
          {this.state.loginUser == null &&
            <button onClick={this.login}>login</button>
          }
          {this.state.loginUser != null &&
            <div>
              <button onClick={this.logout}>logout</button>
              <button onClick={this.add}>add</button>
            </div>
          }
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
