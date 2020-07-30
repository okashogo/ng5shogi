import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';

import "firebase/auth";
import "firebase/firebase-firestore";
import firebase from "firebase";

const ou = "王";
const hisha = "飛"; // 1
const kaku = "角"; // 2
const kin = "金"; // 3
const gin = "銀"; // 4
const kei = "桂"; // 5
const kyo = "香"; // 6
const hu = "歩"; // 7
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
  loginUser : string;
  enemyUser : string;
  myNickname : string;
  enemyNickname : string;
  stage: number;
  challengeId : number;
  applyId: number;
  squares: any[];
  mySide: string;
  moveSelect: number;
  myKomaHave: any[];
  enemyKomaHave: any[];
  nextTurn: boolean,
  playing: boolean,
  countdown: number;
}

const komaList = [
  hisha,
  kaku,
  kin,
  gin,
  kei,
  kyo,
  hu,
]

class Root extends React.Component<{}, IState> {
  constructor(props : string[]) {
    super(props);
    this.state = {
      loginUser: "",
      enemyUser: "",
      myNickname : "",
      enemyNickname : "",
      stage: 0,
      challengeId : 0,
      applyId : 0,
      squares: Array(9*9).fill(["",""]),
      mySide: "",
      moveSelect: -1,
      nextTurn: false,
      myKomaHave: [
        0, //hisha
        0, //kaku
        0, //kin
        0, //gin
        0, //kei
        0, //kyo
        0, //hu
      ],
      enemyKomaHave: [0, 0, 0, 0, 0, 0, 0],
      playing: true,
      countdown: -1,
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
          this.setState({loginUser: user.uid});
          this.setState({stage: 1});
          console.log(this.state.loginUser);
        }
      });
  }

  logout(){
    console.log("logout");
    auth.signInAnonymously();
    this.setState({loginUser: ""});
    this.setState({stage: 0});
  }

  //常に動いている関数
  componentDidMount  = async () =>{

    setInterval(() => {
        this.countDown();
      }, 1000);

    //申し込みを受けた時
    collection_challenge.onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'modified' && this.state.challengeId == change.doc.data().pass && this.state.loginUser == change.doc.data().userId && change.doc.data().enemyId != "nobody") {
          console.log('applyed!!!');
          this.setState({stage: 3});
          this.setState({enemyUser: change.doc.data().enemyId});
          this.setState({mySide: change.doc.data().challengeSide});
          this.setState({enemyNickname: change.doc.data().applyNickname});
          if(change.doc.data().challengeSide == "before"){
            this.setState({nextTurn: true});
            this.setState({countdown: 30});
          }
        }
      })
    });

    // 相手が指した時
    collection_record.onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added' && this.state.enemyUser == change.doc.data().userId) {
          const gradeUpFlag = change.doc.data().gradeUp;
          const beforeValue = change.doc.data().beforeValue;
          const afterValue = change.doc.data().afterValue;
          const tmpSquares = this.state.squares;
          const tmpEnemyKomaHave = this.state.enemyKomaHave;
          var moveKoma: any;
          if(beforeValue >= 100){
            moveKoma = komaList[beforeValue - 100];
            tmpEnemyKomaHave[beforeValue - 100] -= 1;
          }else{
            moveKoma = this.state.squares[beforeValue][0];
          }
          if(tmpSquares[afterValue][0] != ""){
            if(tmpSquares[afterValue][0] == ou){
              alert('あなたの負けです。');
              this.setState({playing: false}); //この後に指すことができないようにする。
            }
            this.MyKomaHaveChange(tmpEnemyKomaHave, tmpSquares[afterValue][0], 0)

            var enemyKomaHaveTotal:number = 0;
            for (let enemyKomaHave_i = 0; enemyKomaHave_i < tmpEnemyKomaHave.length; enemyKomaHave_i++) {
                enemyKomaHaveTotal += tmpEnemyKomaHave[enemyKomaHave_i];
            }
            if(enemyKomaHaveTotal >= 5){
              alert('相手の持ち駒が５個になったので、あなたの勝ちです。');
              this.setState({playing: false});
            }

            this.setState({enemyKomaHave: tmpEnemyKomaHave});
          }
          tmpSquares[beforeValue] = ["", ""];
          if(gradeUpFlag){
            tmpSquares[afterValue] = [this.gradeUp(moveKoma), this.enemySide()];
          }else{
            tmpSquares[afterValue] = [moveKoma, this.enemySide()];
          }
          this.setState({squares: tmpSquares});
          this.setState({nextTurn: true});
          this.setState({countdown: 30});
        }
      })
    });
  }

  // 挑戦状のinputの値を取得
  input_nickname = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value:string = event.target.value;
      this.setState({myNickname: value});
  }

  // 挑戦状のinputの値を取得
  input_challenge = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value:number = Number(event.target.value);
      this.setState({challengeId: value});
  }

  //挑戦状を出した時
  submit_challenge(){
    if(this.state.challengeId != 0){
      var challengeSide:string;
      if(Math.floor(Math.random() * 2)){
        challengeSide = "before";
      }else{
        challengeSide = "after";
      }
      collection_challenge.add({
            userId: this.state.loginUser,
            pass: this.state.challengeId,
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            enemyId: "nobody",
            challengeSide: challengeSide,
            challengeNickname: this.state.myNickname,
          })
          .then(doc => {
            console.log(doc.id + ' added!');
            this.setState({stage: 2});
          })
          .catch(error => {
            console.log(error);
          })
    }
    else{
      alert("0以外の半角数字を入力して下さい");
    }
  }

  // 申し込みのinputの値を取得
  input_apply = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value:number = Number(event.target.value);
      this.setState({applyId: value});
  }

  //申し込みをしたとき
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
                enemyId: this.state.loginUser,
                challengeSide: doc.data().challengeSide,
                challengeNickname: doc.data().challengeNickname,
                applyNickname: this.state.myNickname,
              })
              .then(snapshot => {
                console.log(snapshot)
                this.setState({enemyUser: doc.data().userId});
                this.setState({stage: 3});
                this.setState({mySide: doc.data().challengeSide});
                this.setState({mySide: this.enemySide()});
                this.setState({enemyNickname: doc.data().challengeNickname})
                if(this.state.mySide == "before"){
                  this.setState({nextTurn: true});
                  this.setState({countdown: 30});
                }
              })
              .catch(err => {
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
  }

  // 相手の先手後手を取得
  enemySide() {
    if(this.state.mySide == "before"){
      return "after";
    }else{
      return "before";
    }
  }

  // コマを置く or 選択する
  moveSelect(value:number){
    if(this.state.nextTurn && this.state.playing){
      if(value >= 100){// 持ち駒を選択した時
        this.setState({moveSelect: value});
        return;
      }

      if(this.state.moveSelect != -1){ //選択中のとき
        if(this.state.squares[value][1] == this.state.mySide){ //選択肢を変えるだけ
          this.setState({moveSelect: value});
        }

        else{
          if(this.state.moveSelect >= 100){
            // 二歩の判定
            if(this.state.moveSelect == 106){
              var base2hu = value % 9;
              for (let base2hu_i = 0; base2hu_i < 9; base2hu_i++) {
                if(this.state.squares[base2hu + base2hu_i*9][0] == hu && this.state.squares[base2hu + base2hu_i*9][1] == this.state.mySide){
                  alert("二歩です。");
                  this.setState({moveSelect: -1}); //無選択状態へ
                  return;
                }
              }
            }
            if(this.state.squares[value][0] == ""){
              const tmpSquares = this.state.squares;
              const tmpMyKomaHave = this.state.myKomaHave;

              tmpSquares[value] = [komaList[this.state.moveSelect - 100], this.state.mySide];
              tmpMyKomaHave[this.state.moveSelect - 100] -= 1;
              this.setState({squares: tmpSquares});
              this.setState({myKomaHave: tmpMyKomaHave});
              this.addRecord(this.state.moveSelect,value, false);
              this.setState({countdown: -1});
            }
          }else{
            var komaSelect = this.state.squares[this.state.moveSelect][0];
            var gradeUpFlag: boolean = false;

            if(this.ablePut(value, this.state.squares[this.state.moveSelect][0], this.state.moveSelect)){ //そこに駒が置けるか判定する
              if(this.gradupJude(value, this.state.squares[this.state.moveSelect][0], this.state.moveSelect)){
                if(window.confirm("成りますか？")) { // 成るかどうかのconfirm
                  komaSelect = this.gradeUp(this.state.squares[this.state.moveSelect][0]);
                  gradeUpFlag = true;
                }
              }
              if(this.state.squares[value][1] == this.enemySide()){ //相手の駒をとる
                // ここの3行は詰み関数が完成すると消す
                if(this.state.squares[value][0] == ou){
                  alert('あなたの勝ちです。');
                  this.setState({playing: false});
                }
                this.MyKomaHaveChange(this.state.myKomaHave, this.state.squares[value][0], 1);
              }
              //ただの移動
              const tmpSquares = this.state.squares;
              tmpSquares[this.state.moveSelect] = ["", ""];
              tmpSquares[value] = [komaSelect, this.state.mySide];
              this.setState({squares: tmpSquares});
              this.addRecord(this.state.moveSelect,value,gradeUpFlag);
              this.setState({countdown: -1});
            }
          }
          this.setState({moveSelect: -1}); //無選択状態へ
        }

      }else{ //何も選択していない状態
        if(this.state.squares[value][1] == this.state.mySide){
          this.setState({moveSelect: value});
        }
      }
    }
  }

  // 持ち駒の数を変更
  MyKomaHaveChange(myKomaHave:any, koma: string, who: number){
    for (let komaList_i = 0; komaList_i < komaList.length; komaList_i++) {
        if(komaList[komaList_i] == koma){
          myKomaHave[komaList_i] += 1;
        }
    }
    switch(koma){
      case ryu:
        myKomaHave[0] += 1;
        break;
      case uma:
        myKomaHave[1] += 1;
        break;
      case nariGin:
        myKomaHave[3] += 1;
        break;
      case nariKei:
        myKomaHave[4] += 1;
        break;
      case nariKyo:
        myKomaHave[5] += 1;
        break;
      case tokin:
        myKomaHave[6] += 1;
        break;

      default:
        break;
    }
    this.setState({myKomaHave: myKomaHave});
    var myKomaHaveTotal:number = 0;
    for (let myKomaHave_i = 0; myKomaHave_i < this.state.myKomaHave.length; myKomaHave_i++) {
        myKomaHaveTotal += this.state.myKomaHave[myKomaHave_i];
    }
    if(myKomaHaveTotal >= 5){
      if(who == 1){
        alert('持ち駒が５個になったので、あなたのmoveSelectけです。')
      }else{
        alert('相手の持ち駒が５個になったので、あなたの勝ちです。')
      }
      this.setState({playing: false});
    }
  }

  addRecord(beforeValue:number,afterValue:number, gradeUp: boolean){
    collection_record.add({
          userId: this.state.loginUser,
          beforeValue: beforeValue,
          created_at: firebase.firestore.FieldValue.serverTimestamp(),
          afterValue: afterValue,
          gradeUp: gradeUp,
        })
        .then(doc => {
          console.log(doc.id + ' added!');
        })
        .catch(error => {
          console.log(error);
        })

    this.setState({nextTurn: false});
  }

  //そこにコマがおけるか判定
  ablePut(value: number, koma:string, moveSelect:number){
    var direct:number;
    if(this.state.mySide == "before"){
      direct = -1;
    }else{
      direct = 1;
    }

    //持ち駒からコマを置く場合

    switch (koma) { // 盤上のコマを動かす場合
      case hu:
        if(value == moveSelect + 9*direct){
          return true;
        }
        break;
      case kei:
        if(value == moveSelect + 18*direct + 1 || value == moveSelect + 18*direct - 1){
          return true;
        }
      case gin:
        if(value == moveSelect + 9*direct || value == moveSelect + 9*direct - 1 || value == moveSelect + 9*direct + 1 || value == moveSelect - 9*direct - 1|| value == moveSelect - 9*direct + 1){
          return true;
        }
      case ou:
        if(value == moveSelect + 9*direct || value == moveSelect + 9*direct - 1 || value == moveSelect + 9*direct + 1 || value == moveSelect - 9*direct|| value == moveSelect - 1|| value == moveSelect + 1 || value == moveSelect - 9*direct - 1|| value == moveSelect - 9*direct + 1){
          return true;
        }
      case kyo:
        var shiftCell:number = Math.abs(Math.floor((moveSelect - value)/9));
        if((moveSelect - value) % 9 == 0 && shiftCell > 0){
          for (let shiftCell_i = 1; shiftCell_i <= shiftCell; shiftCell_i++) {
            if(moveSelect + shiftCell_i * 9 * direct == value){
              return true;
            }
            if(this.state.squares[moveSelect + shiftCell_i * 9 * direct][0] != ""){
              return false;
            }
          }
          return true;
        }

      case kaku:
        if(this.hishakakuMove(moveSelect, value, 10)){
          return true;
        }
        if(this.hishakakuMove(moveSelect, value, 8)){
          return true;
        }
        return false;

      case hisha:
        if(this.hishakakuMove(moveSelect, value, 9)){
          return true;
        }
        if(this.hishakakuMove(moveSelect, value, 1)){
          return true;
        }
        return false;

      case kin:
        return this.kinMove(value, moveSelect, direct);
      case tokin:
        return this.kinMove(value, moveSelect, direct);
      case nariGin:
        return this.kinMove(value, moveSelect, direct);
      case nariKei:
        return this.kinMove(value, moveSelect, direct);
      case nariKyo:
        return this.kinMove(value, moveSelect, direct);

      case ryu:
        if(this.hishakakuMove(moveSelect, value, 9)){
          return true;
        }
        if(this.hishakakuMove(moveSelect, value, 1)){
          return true;
        }
        if(value == moveSelect + 10 || value == moveSelect - 10|| value == moveSelect - 8|| value == moveSelect + 8){
          return true;
        }
        return false;
      case uma:
        if(this.hishakakuMove(moveSelect, value, 10)){
          return true;
        }
        if(this.hishakakuMove(moveSelect, value, 8)){
          return true;
        }
        if(value == moveSelect + 9 || value == moveSelect - 9|| value == moveSelect - 1|| value == moveSelect + 1){
          return true;
        }
        return false;

      default:
        break;
    }
    return false;
  }

  //金の動き
  kinMove(value:number, moveSelect:number, direct:number){
    if(value == moveSelect + 9*direct || value == moveSelect + 9*direct - 1 || value == moveSelect + 9*direct + 1 || value == moveSelect - 9*direct|| value == moveSelect - 1|| value == moveSelect + 1){
      return true;
    }
  }

  //飛車 or 角の動き
  hishakakuMove(moveSelect:number, value:number, shiftNum:number){
    var direct;
    var shiftCount;
    if((moveSelect - value) > 0){
      direct = -1
    }else{
      direct = 1
    }
    if((moveSelect - value) % shiftNum == 0){
      if(shiftNum == 1 && Math.floor(moveSelect / 9) != Math.floor(value / 9)) {
          return false;
      }
      shiftCount = Math.abs(Math.floor((moveSelect - value)/shiftNum));
      for (let shiftCell_i = 1; shiftCell_i <= shiftCount; shiftCell_i++) {
        if(this.state.squares[moveSelect + shiftCell_i * shiftNum * direct][0] != ""){
          if(moveSelect + shiftCell_i * shiftNum * direct == value && this.state.squares[moveSelect + shiftCell_i * shiftNum * direct][1] == this.enemySide()){
            return true;
          }
          return false;
        }
      }
      return true;
    }
  }

  // コマの成れるか判定
  gradupJude(value: number, koma:string, moveSelect:number){
    let gradeCanKomaList = [
      hisha,
      kaku,
      gin,
      kei,
      kyo,
      hu,
    ]
    if(gradeCanKomaList.includes(koma)){
      if(this.state.mySide == "before"){
        if(value <= 26){
          return true;
        }
        if(moveSelect <= 26){
          return true;
        }
      }
      if(this.state.mySide == "after"){
        if(value >= 54){
          return true;
        }
        if(moveSelect >= 54){
          return true;
        }
      }
    }
    return false;
  }

  //コマがどのコマに成るか
  gradeUp(koma:string){
    switch (koma) {
      case hisha:
        return ryu;
      case kaku:
        return uma;
      case gin:
        return nariGin;
      case kei:
        return nariKei;
      case kyo:
        return nariKyo;
      case hu:
        return tokin;

      default:
        break;
    }
  }

  countDown(){
    if(this.state.countdown > 0){
      this.setState({countdown: this.state.countdown - 1});
      if(this.state.countdown == 0){
        alert('あなたの負けです。');
        this.setState({playing: false}); //この後に指すことができないようにする。
      }
    }
  }

  render() {
    const fieldList = this.state.squares.map((output: string[], key) => {
      if(this.state.moveSelect == key){
        return(
          <div className="moveSelect" key = {key.toString()} id = {key.toString()} style={{position: "relative"}} onClick={this.moveSelect.bind(this,key)}>
            <Box koma={output}/>
          </div>
        )
      }
      return(
        <div className="box" key = {key.toString()} id = {key.toString()} style={{position: "relative"}} onClick={this.moveSelect.bind(this,key)}>
          <Box koma={output}/>
        </div>
      )
    });

    const myHavefield = komaList.map((output: string, key) => {
      if(this.state.myKomaHave[key] != 0){
        if(this.state.moveSelect == key + 100){
          return <h3 style={{display: "flex"}}><div className="moveSelect" onClick={this.moveSelect.bind(this,key+100)}>{output}</div>×{this.state.myKomaHave[key]}</h3>;
        }
        return <h3 style={{display: "flex"}}><div onClick={this.moveSelect.bind(this,key+100)}>{output}</div>×{this.state.myKomaHave[key]}</h3>;
      }
    });

    const enemyHavefield = komaList.map((output: string, key) => {
      if(this.state.enemyKomaHave[key] != 0){
        return <h3 style={{display: "flex"}}><div>{output}</div>×{this.state.enemyKomaHave[key]}</h3>;
      }
    });


    return (
        <div>
          <h1>持ち駒が５個になったら負け将棋</h1>
          {this.state.stage == 0 &&
            <div>
              <input id="input_nickname" placeholder="ニックネームを入力" onChange={this.input_nickname}/>
              <button onClick={this.login}>login</button>
            </div>
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
            this.state.stage == 2 &&
            <div>
              <div>ようこそ、{this.state.myNickname}さん</div>
              <div>対戦相手を探しています。。。</div>
            </div>
          }
          {
            this.state.stage >= 3 && this.state.enemyUser != "" &&
            <div>
              {this.state.myNickname} VS {this.state.enemyNickname}
              <br />
              { this.state.countdown > 0 &&
                <h3>残り {this.state.countdown} 秒</h3>
              }
              {this.state.nextTurn == true &&
                <h2>あなたの番です</h2>
              }
              {this.state.nextTurn == false &&
                <h2>相手の番です</h2>
              }
            </div>
          }
          {this.state.stage >= 3 &&
            <div style={{display: "flex"}}>
              <div style={{transform: "rotate(180deg)"}}>
                {this.state.mySide == "before" &&
                  <div>後手</div>
                }
                {this.state.mySide == "after" &&
                  <div>先手</div>
                }
                {enemyHavefield}
              </div>

              {this.state.mySide == "before" &&
                <div className="field">
                  {fieldList}
                </div>
              }
              {this.state.mySide == "after" &&
                <div className="field" style={{transform: "rotate(180deg)"}}>
                  {fieldList}
                </div>
              }

              <div>
                {this.state.mySide == "before" &&
                  <div>先手</div>
                }
                {this.state.mySide == "after" &&
                  <div>後手</div>
                }
                {myHavefield}
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
