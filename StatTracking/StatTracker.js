import React, { Component } from "react";
import {StyleSheet,Text, View,RefreshControl, Image, TouchableOpacity, ScrollView} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import app from "../constants/APIKeys.js";
import TrackerCard from './TrackerCard.js';
import Spinner from 'react-native-loading-spinner-overlay';
const firebase = require('firebase');
require('firebase/firestore');
const firestore = app.firestore();



export default class StatTracker extends Component {
    constructor(props){
        super(props);
        this.state = {
          loading: true,
          players: [],
          currentUser: null,
        };
    }

    //refreshes the page and loads data again
    setRefresh = () =>{
      this.setState({loading: true,players: []});
    }

    /*when the page is first loaded its loads the user's data, 
    then calls the function to load the user's saved players*/

    loadData = () =>{

        const { currentUser } = firebase.auth();
      
        var docRef = firestore.collection("Users").doc(currentUser.uid);
    
        docRef.get().then(function(doc) {
            if (doc.exists) {
              var profileInfo = doc.data();
              
              this.setState({ currentUser: profileInfo});
              this.getPlayers();
              
              return null;
            } else {
                // doc.data() will be undefined in this case
                
                return null;
            }
        }.bind(this)).catch(function(error) {
            console.log("Error getting document:", error);
            return null;
        });
     
        


          
      
    }

    getPlayers = () =>{

      const { currentUser } = firebase.auth();

      var docRef1 = firestore.collection("Users").doc(currentUser.uid).collection("Tracking").orderBy('createdAt', 'desc'); 
    
    
        let observer1 = docRef1
          .onSnapshot(querySnapshot => {
              var array = [];
              
              querySnapshot.forEach(function(doc) {
                  // doc.data() is never undefined for query doc snapshots
                  //console.log(doc.id, " => ", doc.data());
                  var docData = doc.data();
                  array.push(docData);
                  
              });
         
              this.setState({players: array,loading: false})
              
          });


    }



    returnView = () =>{

      //tests to see if users has at least one player saved and displays them

      if(this.state.players.length > 0){

        return (
          <ScrollView contentContainerStyle={{ paddingBottom: 20}}
          refreshControl={
            <RefreshControl
              refreshing={this.state.loading}
              onRefresh={this.setRefresh}
            />
          }
          >
            
            

            {this.state.players.map((player) => (
              this.returnPlayer(player)
            ))}
          </ScrollView>

        );
      }else{

        //if the user doesn't have any players saved it will display this view
        return (

          <ScrollView contentContainerStyle={{ paddingBottom: 20}}
          refreshControl={
            <RefreshControl
              refreshing={this.state.loading}
              onRefresh={this.setRefresh}
            />
          }>
    
    
            
            <View style={styles.noPlayerSection}>

                <Text style={{color: 'black',fontSize: 20,fontFamily: 'System',fontWeight: 'bold',textAlign: 'center'}}>To add a player to track press the plus button in the top right corner!</Text>
    
              </View>
            
        
          </ScrollView>
        );
      }
      
        



    }


    


    returnPlayer = (player) =>{
      
      return(
        <TrackerCard nav={this.props.navigation} player={player}  currentUser={this.state.currentUser} key={player.playerID}/>
      );

    }

    //Moves the User to next page where they can choose a league

    goToLeagues = () =>{

        const {navigate} = this.props.navigation;
        navigate('StatLeagues',{navigation: this.props.navigation, currentUser: this.state.currentUser});

    }
    


    

    
   


  render() {
    
    return (
      <View style={styles.containerView} behavior="padding">


        <View style={styles.header}>
      
            <Image style={styles.logo} source={require('../assets/logo.png')} />


            <TouchableOpacity onPress={() => this.goToLeagues()}>

              <Image style={styles.whitePlus} source={require('../assets/whiteplus.png')} />

            </TouchableOpacity>

        </View>
          
        
        <Spinner
          visible={this.state.loading}
          textContent={'Loading...'} 
          textStyle={styles.spinnerTextStyle}
        />

        
        <View style={styles.headingView}>
          <Text style={styles.headingText}>Players</Text>
        </View>

        {this.state.loading ? this.loadData() : this.returnView()}
        
      </View>
    );
  }

  




}






const styles = StyleSheet.create({

  containerView: {
    flex: 1,
    backgroundColor: 'white',
    
  },
  header:{
    height: 90,
    width: '100%',
    backgroundColor: '#18314f',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingTop: getStatusBarHeight(),
    paddingRight: 10,
    paddingLeft: 10,
    borderBottomWidth: .2,
    borderBottomColor: 'black',
  },
  logo: {
    height: 50,
    width: 60,
  },
  whitePlus: {
    height: 30,
    width: 30,
  },
  spinnerTextStyle: {
    color: '#FFF'
  },
  rankText: {
    color: '#303030',
    fontSize: 25,
    fontFamily: 'System',
    marginRight: 20,
    marginBottom: 30,
    
    
  },
  nameText: {
    color: '#303030',
    fontSize: 18,
    fontFamily: 'System',
  },
  
  menuSection:{
    height: 200,
    width: '90%',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: '5%',
    paddingRight: 20,
    paddingLeft: 0,
    borderRadius: 8,
    backgroundColor: 'white',
    marginTop: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5, 
    

    
  },

  noPlayerSection:{
    width: '90%',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '5%',
    padding:40,
    borderRadius: 8,
    backgroundColor: 'white',
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5, 
    

    
  },

  headingView:{

    justifyContent:'flex-start',
    alignItems: 'flex-start',
    paddingLeft: 10,
    marginBottom: 10,
    paddingTop:10,

  },
  headingText:{

    color: '#18314f',
    fontSize: 30,
    fontFamily: 'System',
    fontWeight: 'bold',
    textAlign: 'center',

  },


  



});
