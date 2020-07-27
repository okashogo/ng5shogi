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
  challengeId : number;
  applyId: number;
}

class Root extends React.Component<{}, IState> {
  constructor(props : string[]) {
    super(props);
    this.state = {
      loginUser: null,
      challengeId : 0,
      applyId : 0,
    };

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.input_challenge = this.input_challenge.bind(this);
    this.submit_challenge = this.submit_challenge.bind(this);
    this.submit_apply = this.submit_apply.bind(this);
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

  input_challenge = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value:number = Number(event.target.value);
      this.setState({challengeId: value});
  }

  submit_challenge(){
    if(this.state.challengeId != 0){
      console.log("submit_challenge");
      collection_challenge.add({
            userId: this.state.loginUser.uid,
            pass: this.state.challengeId,
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            enemy_id: "nobody",
          })
          .then(doc => {
            console.log(doc.id + ' added!');
          })
          .catch(error => {
            console.log(error);
          })
    }
    else{
      alert("0以外の半角数字を入力して下さい");
    }
    // console.log(<HTMLInputElement>document.getElementById("input_challenge").value);
  }

  input_apply = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value:number = Number(event.target.value);
      this.setState({applyId: value});
  }

  submit_apply(){
    if(this.state.applyId != 0){
      console.log("submit_apply");
      collection_challenge.where('enemy_id', '==', 'nobody').where('pass', '==', this.state.applyId).get()
        .then(snapshot => {
          if (snapshot.empty) {
            return;
          }

          snapshot.forEach(doc => {

            collection_challenge.doc(doc.id)
              .set({
                userId: doc.data().userId,
                pass: 0,
                created_at: doc.data().created_at,
                enemy_id: this.state.loginUser.uid,
              })
              .then(snapshot => {
                console.log(snapshot)
                console.log("OK!")
              })
              .catch(err => {
                console.log('Not update!');
                console.log(err);
              });

          });
        })
        .catch(err => {
            console.log('Error getting documents', err);
        });
    }
    else{
      alert("0以外の半角数字を入力して下さい");
    }
    // console.log(<HTMLInputElement>document.getElementById("input_challenge").value);
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
              <div>
                <button onClick={this.logout}>logout</button>
              </div>
              <div>
                <input id="input_challenge" placeholder="半角数字を入力" onChange={this.input_challenge}/>
                <button onClick={this.submit_challenge}>挑戦状を出す</button>
              <div>
              </div>
                <input id="input_apply" placeholder="半角数字を入力" onChange={this.input_apply}/>
                <button onClick={this.submit_apply}>申し込む</button>
              </div>
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
