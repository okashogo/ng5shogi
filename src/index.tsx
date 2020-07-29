import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

import "firebase/auth";
import "firebase/firebase-firestore";
import firebase from "firebase";

const B = require('./img/B.jpg').default;

const ou = "王";
const kin = "金";
const gin = "銀";
const hisha = "飛";
const kaku = "角";
const kei = "桂";
const kyo = "香";
const hu = "歩";
const ryu = "龍";
const uma = "馬";
const nariGin = "成銀";
const nariKyo = "成香";
const nariKei = "成桂";
const tokin = "と";


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

class Box extends React.Component<{koma:string[]}> {
  render() {
    const emptyJudge = this.props.koma;
    var dom:any;
    if(!(emptyJudge)) {
      dom = <div></div>
    }
    else{
      if(emptyJudge[1] == "after"){
        dom = <div style={{transform: "rotate(180deg)", textAlign:"center", position: "absolute", top:"30%", left:"35%"}}>{emptyJudge[0]}</div>
      }
      else{
        dom = <div style={{textAlign:"center", position: "absolute", top:"30%", left:"35%"}}>{emptyJudge[0]}</div>
      }
    }
    return (
      dom
    );
  }
}

interface IState {
  loginUser : any;
  enemyUser : string;
  stage: number;
  challengeId : number;
  applyId: number;
  squares: any[];
  mySide: string;
  moveSelct: number;
  myKomaHave: any;
  enemyKomaHave: any;
}

class Root extends React.Component<{}, IState> {
  constructor(props : string[]) {
    super(props);
    this.state = {
      loginUser: null,
      enemyUser: "",
      stage: 2,
      challengeId : 0,
      applyId : 0,
      squares: Array(9*9).fill(["",""]),
      mySide: "before",
      moveSelct: -1,
      // myKomaHave: [
      //   [kin, 0],
      //   [gin, 0],
      //   [hisha, 0],
      //   [kaku, 0],
      //   [kei, 0],
      //   [kyo, 0],
      //   [hu, 0],
      // ],
      myKomaHave: {
        'hisha': 0,
        'kaku': 0,
        'kin': 0,
        'gin': 0,
        'kei': 0,
        'kyo': 0,
        'hu': 0,
      },
      enemyKomaHave: {
        'hisha': 0,
        'kaku': 0,
        'kin': 0,
        'gin': 0,
        'kei': 0,
        'kyo': 0,
        'hu': 0,
      },
    };

    //歩
    for (let i = 18; i < 18 + 9; i++) {
      this.state.squares[i] = [hu, "after"];
    }
    for (let i = 54; i < 54 + 9; i++) {
      this.state.squares[i] = [hu, "before"];
    }

    for (let i = 0; i < 2; i++) {

      let j = i*2 -1;
      this.state.squares[4 + j] = [kin, "after"];
      this.state.squares[4 + j*2] = [gin, "after"];
      this.state.squares[4 + j*3] = [kei, "after"];
      this.state.squares[4 + j*4] = [kyo, "after"];

      this.state.squares[76 + j] = [kin, "before"];
      this.state.squares[76 + j*2] = [gin, "before"];
      this.state.squares[76 + j*3] = [kei, "before"];
      this.state.squares[76 + j*4] = [kyo, "before"];

      this.state.squares[10] = [hisha, "after"];
      this.state.squares[70] = [hisha, "before"];
      this.state.squares[16] = [kaku, "after"];
      this.state.squares[64] = [kaku, "before"];

      this.state.squares[4] = [ou, "after"];
      this.state.squares[76] = [ou, "before"];

      // //桂
      // this.state.squares[1] = kei;
      // this.state.squares[7] = kei;
      // this.state.squares[73] = kei;
      // this.state.squares[79] = kei;
    }


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
        if (user) {
          console.log(user.uid);
          this.setState({loginUser: user});
          this.setState({stage: 1});
          console.log(this.state.loginUser.uid);
        }
      });
  }

  logout(){
    console.log("logout");
    auth.signInAnonymously();
    this.setState({loginUser: null});
    this.setState({stage: 0});
  }

  componentDidMount  = async () =>{
    // collection_record.onSnapshot(snapshot => {
    //   snapshot.docChanges().forEach(async change => {
    //     if (change.type === 'added') {
    //       console.log("ADD!!");
    //       console.log(change.doc.data().userId);
    //       console.log(change.doc.data().message);
    //     }
    //   })
    // });

    //申し込みを受けた時
    collection_challenge.onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'modified' && this.state.challengeId == change.doc.data().pass && this.state.loginUser.uid == change.doc.data().userId && change.doc.data().enemyId != "nobody") {
          console.log('applyed!!!');
          // console.log(change.doc.data().userId);
          // console.log(change.doc.data().enemyId);
          this.setState({stage: 2});
          this.setState({enemyUser: change.doc.data().enemyId});
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
            enemyId: "nobody",
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
      collection_challenge.where('enemyId', '==', 'nobody').where('pass', '==', this.state.applyId).get()
        .then(snapshot => {
          if (snapshot.empty) {
            return;
          }

          snapshot.forEach(doc => {

            collection_challenge.doc(doc.id)
              .set({
                userId: doc.data().userId,
                pass: doc.data().pass,
                created_at: doc.data().created_at,
                enemyId: this.state.loginUser.uid,
              })
              .then(snapshot => {
                console.log(snapshot)
                console.log("OK!")
                this.setState({enemyUser: doc.data().userId});
                this.setState({stage: 2});
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

  enemySide() {
    if(this.state.mySide == "before"){
      return "after";
    }else{
      return "before";
    }
  }

  moveSelct(value:number){
    if(this.state.moveSelct != -1){ //選択中のとき
      if(this.state.squares[value][1] == this.state.mySide){ //選択肢を変えるだけ
        this.setState({moveSelct: value});
      }

      else{ //移動する
        const komaSelect = this.state.squares[this.state.moveSelct];

        if(true){ //そこに駒が置けるか判定する
          if(this.state.squares[value][1] == this.enemySide()){ //相手の駒をとる
            this.MyKomaHaveChange(this.state.myKomaHave, this.state.squares[value][0], 1);
          }
          //ただの移動
          const tmpSquares = this.state.squares;
          tmpSquares[this.state.moveSelct] = ["", ""];
          tmpSquares[value] = [komaSelect[0], this.state.mySide];
          this.setState({squares: tmpSquares});
          console.log(this.state.myKomaHave);
        }
        this.setState({moveSelct: -1}); //無選択状態へ
      }

    }else{ //何も選択していない状態
      if(this.state.squares[value][1] == this.state.mySide){
        this.setState({moveSelct: value});
      }
    }
  }

  MyKomaHaveChange(myKomaHave:any, koma: string, num: number){
      switch (koma){
        case '飛':
          myKomaHave.hisha += num;
          break;
        case '角':
          myKomaHave.kaku += num;
          break;
        case '金':
          myKomaHave.kin += num;
          break;
        case '銀':
          myKomaHave.gin += num;
          break;
        case '桂':
          myKomaHave.kei += num;
          break;
        case '香':
          myKomaHave.kyo += num;
          break;
        case '歩':
          myKomaHave.hu += num;
          break;
      }
      this.setState({myKomaHave: myKomaHave});
  }

  render() {
    const fieldList = this.state.squares.map((output: string[], key) => {
      if(this.state.moveSelct == key){
        return(
          <div className="moveSelct" key = {key.toString()} id = {key.toString()} style={{position: "relative"}} onClick={this.moveSelct.bind(this,key)}>
            <Box koma={output}/>
          </div>
        )
      }
      return(
        <div className="box" key = {key.toString()} id = {key.toString()} style={{position: "relative"}} onClick={this.moveSelct.bind(this,key)}>
          <Box koma={output}/>
        </div>
      )
    });
    return (
        <div>
          <h1 style={{transform: "rotate(180deg)"}}>持ち駒が５個になったら負け将棋</h1>
          {this.state.stage == 0 &&
            <button onClick={this.login}>login</button>
          }
          {this.state.stage >= 1 &&
            <div>
              <div>
                <button onClick={this.logout}>logout</button>
              </div>
            </div>
          }
          {this.state.stage == 1 &&
            <div>
              <div>
                <input id="input_challenge" placeholder="半角数字を入力" onChange={this.input_challenge}/>
                <button onClick={this.submit_challenge}>挑戦状を出す</button>
              </div>
              <div>
                <input id="input_apply" placeholder="半角数字を入力" onChange={this.input_apply}/>
                <button onClick={this.submit_apply}>申し込む</button>
              </div>
            </div>
          }
          {
            this.state.stage >= 3 &&
            <div>{this.state.loginUser.uid} VS {this.state.enemyUser}</div>
          }
          {this.state.stage >= 2 &&
            <div>
              <div className="field">
                {fieldList}
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
