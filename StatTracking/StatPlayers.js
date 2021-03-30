import React, { Component } from "react";
import {StyleSheet,Text, View,Animated, Alert, Image, TouchableOpacity, ScrollView} from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import app from "../constants/APIKeys.js";
import Images from '../constants/images.js';
import Spinner from 'react-native-loading-spinner-overlay';
const firebase = require('firebase');
require('firebase/firestore');
const firestore = app.firestore();

//returns a team Image
function returnImage(team){

  team = team.replace(/\s+/g, '');

  if(team == 'St.LouisBlues'){
    return(<Image style={styles.logo} source={require('../assets/St.LouisBlues.png')}/>);
  }else if(team == 'MontréalCanadiens'){
    return(<Image style={styles.logo} source={require('../assets/MontrealCanadiens.png')}/>);
  }else{
    return(<Image style={styles.logo} source={Images.logos[team]}/>);
  }

}

//whether or not the confirmation is showing or not
var isHidden = true;

export default class StatPlayers extends Component {
    constructor(props){
        super(props);
        this.state = {
          loading: true,
          players: [],
          currentUser: this.props.route.params.currentUser,
          awayTeam: this.props.route.params.game.teams.away.team.name,
          homeTeam: this.props.route.params.game.teams.home.team.name,
          currentTab: this.props.route.params.game.teams.away.team.name,
          game: this.props.route.params.game,
          hORa: 'away',
          bounceValue: new Animated.Value(100), 
        };
    }

    componentWillUnmount(){
      isHidden = !isHidden;
    }

    _toggleSubview() {

      var toValue = 100;
  
      if(isHidden) {
        toValue = 0;
      }
  
      //This will animate the transalteY of the subview between 0 & 100 depending on its current state
      //100 comes from the style below, which is the height of the subview.
      Animated.spring(
        this.state.bounceValue,
        {
          toValue: toValue,
          velocity: 3,
          tension: 2,
          friction: 8,
          useNativeDriver: true,
        }
      ).start();
  
      isHidden = !isHidden;
    }

    
    loadData = () =>{
      
        var teamID = null;

        
        if(this.state.hORa == 'away'){
            teamID = this.props.route.params.game.teams.away.team.id;
        }else{
            teamID = this.props.route.params.game.teams.home.team.id;
        }


        
        var website = 'https://statsapi.web.nhl.com/api/v1/teams/' + teamID + '?expand=team.roster';
        fetch(website)
            .then(response => {
            return response.json()
            })
            .then(data => {
            this.setState({
                players: data.teams[0].roster.roster,
                loading: false,
            });
            })

            .catch(err => {
              // Do something for an error here
              console.log(err);
            })
     
        


          
      
    }

    //displays alert so user can choose stat to track
    showStatsAlert = (player) =>{

      if(isHidden == false){
        this._toggleSubview();
      }

        var body = 'What type of stat would you like to track?';

        Alert.alert(
            player.person.fullName,
            body,
            [
              {
                text: "Cancel",
                onPress: () => console.log("Cancel Pressed"),
                style: "cancel"
              },
              { text: "Goals", onPress: () => this.addTracker(player, 'Goals') },
              { text: "Assists", onPress: () => this.addTracker(player, 'Assists') },
              { text: "Shots", onPress: () => this.addTracker(player, 'Shots') },
              
            ],
            { cancelable: false }
          );




    }

    //adds player to user's profile
    addTracker = (player, type) =>{

        var docID = player.person.fullName + this.state.game.gamePk + type;

        var team = null;
        var opposingTeam = null;

        if(this.state.hORa == 'away'){
            team = this.props.route.params.game.teams.away.team.name;
            opposingTeam = this.props.route.params.game.teams.home.team.name;
        }else{
            team = this.props.route.params.game.teams.home.team.name;
            opposingTeam = this.props.route.params.game.teams.away.team.name;
        }

        var date = this.props.route.params.game.gameDate;

        


        
        firestore.collection("Users").doc(this.state.currentUser.userID).collection("Tracking").doc(docID).set({
            "gameID": this.state.game.gamePk,
            "playerID": player.person.id,
            "playerName": player.person.fullName,
            "team": team,
            "opposingTeam": opposingTeam,
            "total": 0,
            "type": type,
            "hORa": this.state.hORa,
            "code": 0,
            "expoToken": this.state.currentUser.expoToken,
            "startTime": date,
            "createdAt": Date.now(),
  
          })

        .then(function() {
            this._toggleSubview();
        }.bind(this));



    }



    returnView = () =>{

      //Displays the Teams players
      if(this.state.players.length > 0){
        return (
          <ScrollView contentContainerStyle={{ paddingBottom: 20,paddingTop:10,}}>
    
            {this.state.players.map((users) => (
              this.returnLeague(users)
            ))}
          </ScrollView>

        );
      }else{
        return (

          <ScrollView contentContainerStyle={{ paddingBottom: 20,paddingTop:10,}}>
    
    
            
            <View style={styles.playerView}>

                <Text style={{color: 'black',fontSize: 20,fontFamily: 'System',fontWeight: 'bold',textAlign: 'center'}}>Unable to load Players</Text>
    
              </View>
            
        
          </ScrollView>
        );
      }
      
        



    }


    

    //returns player only if they are not a goalie
    returnLeague = (player) =>{
    
        if(player.position.code != 'G'){
            return(

                <TouchableOpacity onPress={() => this.showStatsAlert(player)} key={player.person.fullName}>
    
                <View style={styles.playerView}>
        
                    <View style={{height: '100%',width: '80%', flexDirection: 'column', justifyContent: 'space-around',alignItems: 'center'}}>
        
                    <View style={{width: '100%',flexDirection: 'row',justifyContent: 'flex-start',alignItems:'center'}}>
                        {returnImage(this.props.route.params.game.teams[this.state.hORa].team.name)}
                        <Text style={{color: 'black',fontSize: 16,fontFamily: 'System',fontWeight: 'bold',textAlign: 'center'}}>{player.person.fullName}</Text>
                    </View>
        
                    </View>
        
                    
        
        
                </View>
    
                </TouchableOpacity>
            );
        }
        
      
    }



    


    tabStyle = function(options) {
        if(options == this.state.currentTab){
          return {
            fontSize: 14,
            color: 'black',
            fontFamily: 'System',
          }
        }else{
          return {
            fontSize: 14,
            color: '#AFB0B0',
            fontFamily: 'System',
          }
        }
    
     }
     
     viewStyle = function(options) {

      if(options == this.state.currentTab){
        return {
          backgroundColor: 'white',
          alignItems: 'center',
          justifyContent: 'center',
          height: 50,
          width: '50%',
          borderRadius: 2,
          borderBottomWidth: 4,
          borderColor: '#18314f',
        }
      }else{
        return {
          backgroundColor: 'white',
          alignItems: 'center',
          justifyContent: 'center',
          height: 50,
          width: '50%',
          paddingBottom: 4,
        }
      }
    
    }
  
    changeTab = (tab) => {
        var hORa = null;

        if(this.state.hORa == 'away'){
            hORa = 'home';
        }else{
            hORa = 'away';
        }

        this.setState({
          currentTab: tab,
          loading: true,
          hORa: hORa,

        });
      }
    


    

    
   


  render() {
    
    return (
      <View style={styles.containerView} behavior="padding">


        <View style={styles.header}>
      
            <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                <Image style={styles.backButton} source={require('../assets/whiteBack.png')} />
            </TouchableOpacity>

            <Text style={styles.menuText}>Choose a Player</Text>

            
        </View>


        <View style={styles.tabBar}>

            <TouchableOpacity style={this.viewStyle(this.state.awayTeam)} onPress={() => this.changeTab(this.state.awayTeam)}>
                <Text style={this.tabStyle(this.state.awayTeam)}>{this.state.awayTeam}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={this.viewStyle(this.state.homeTeam)} onPress={() => this.changeTab(this.state.homeTeam)}>
                <Text style={this.tabStyle(this.state.homeTeam)}>{this.state.homeTeam}</Text>
            </TouchableOpacity>
                
        </View>
          
        
        <Spinner
          visible={this.state.loading}
          textContent={'Loading...'} 
          textStyle={styles.spinnerTextStyle}
        />
        
        
        {this.state.loading ? this.loadData() : this.returnView()}



        <Animated.View
            style={[styles.subView,
              {transform: [{translateY: this.state.bounceValue}]}]}
          >
            <Text style={styles.subviewText}>Player Added!</Text>
        </Animated.View>

        
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
  backButton: {
    height: 30,
    width: 30,
  },
  
  logo: {
    height: 50,
    width: 50,
    resizeMode: 'contain',
    marginRight: 20,
  },

  spinnerTextStyle: {
    color: '#FFF'
  },
  
  menuText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'System',
    fontWeight: 'bold',
    
    
  },
 
  playerView:{
    height: 100,
    width: '90%',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '5%',
    borderRadius: 8,
    backgroundColor: 'white',
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5, 
    

    
  },

  subView: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#18314f",
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',

  },

  subviewText: {
    fontSize: 16,
    color: 'white',

    fontFamily: 'System',
    fontWeight: 'bold'
  },


  



});
