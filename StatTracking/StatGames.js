import React, { Component } from "react";
import {StyleSheet,Text, View, Image, TouchableOpacity, ScrollView} from 'react-native';
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

export default class StatGames extends Component {
    constructor(props){
        super(props);
        this.state = {
          loading: true,
          games: [],
          currentUser: this.props.route.params.currentUser,
        };
    }

    //loads today's NHL games then sets it to games in state

    loadData = () =>{

        const { currentUser } = firebase.auth();
      
        var website = 'https://statsapi.web.nhl.com/api/v1/schedule';

        fetch(website)
            .then(response => {
              return response.json()
            })
            .then(data => {

            this.setState({
                games: data.dates[0].games,
                loading: false,
            });

            })
            .catch(err => {
            
              console.log(err);
            })
     
        


          
      
    }


    
    returnView = () =>{

      //returns all of today's games if there is any
      if(this.state.games.length > 0){
        return (
          <ScrollView contentContainerStyle={{ paddingBottom: 20,paddingTop:10,}}>
    
            {this.state.games.map((users) => (
              this.returnLeague(users)
            ))}
          </ScrollView>

        );
      }else{

        //Displays a message telling the user that there is no games today
        return (

          <ScrollView contentContainerStyle={{ paddingBottom: 20,paddingTop:10,}}>
    
    
            
            <View style={styles.menuSectionBlank}>

                <Text style={styles.blankText}>No Games Today</Text>
    
              </View>
            
        
          </ScrollView>
        );
      }
      
        



    }


    


    returnLeague = (league) =>{
    
    //Displays the games that aren't postponed or Finished
    if(league.status.detailedState != 'Postponed' || league.status.detailedState != 'Final'){

        return(

            <TouchableOpacity onPress={() => this.goToPlayerView(league)}>

            <View style={styles.menuSectionBlank}>
    
                <View style={{height: '100%',width: '80%', flexDirection: 'column', justifyContent: 'space-around',alignItems: 'center'}}>
    
                  <View style={{width: '100%',flexDirection: 'row',justifyContent: 'flex-start',alignItems:'center'}}>
                    {returnImage(league.teams.away.team.name)}
                    <Text style={styles.teamText}>{league.teams.away.team.name}</Text>
                  </View>
    
                  <View style={{width: '100%',flexDirection: 'row',justifyContent: 'flex-start',alignItems:'center'}}>
                    {returnImage(league.teams.home.team.name)}
                    <Text style={styles.teamText}>{league.teams.home.team.name}</Text>
                  </View>
    
                </View>
    
                <View style={{height: '100%',width: '20%', flexDirection: 'column', justifyContent: 'space-around',alignItems: 'center'}}>
            
                  <Text style={styles.timeText}>{this.returnTime(league)}</Text>
               
                </View>
    
    
            </View>

            </TouchableOpacity>
        );
    }
      
    }


    //using the time stamp the NHL gives us, changes it to ex. '12:00pm' 
    returnTime = (game) =>{

     var time1 = game.gameDate;

     var date = new Date(time1);

     var hours = date.getHours();
     if(hours > 12){
       hours = hours - 12;

       var minutes = date.getMinutes();
       if(minutes == 0){
         minutes = "00";
       }
       var time = hours + ":" + minutes + " PM";

       return time;

     }else if(hours == 12){

       var minutes = date.getMinutes();
       if(minutes == 0){
         minutes = "00";
       }
       var time = hours + ":" + minutes + " PM";

       return time;


     }else{
       
       var minutes = date.getMinutes();
       if(minutes == 0){
         minutes = "00";
       }
       var time = hours + ":" + minutes + " AM";

       return time;
     }

    }

    //once a user selects a game it will go to next page where they can pick a player to track

    goToPlayerView = (game) =>{
        
        const {navigate} = this.props.navigation;
        navigate('StatPlayers',{navigation: this.props.navigation, currentUser: this.state.currentUser, game: game});
    
    }
    


    

    
   


  render() {
    
    return (
      <View style={styles.containerView} behavior="padding">


        <View style={styles.header}>
      
            <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                <Image style={styles.backButton} source={require('../assets/whiteBack.png')} />
            </TouchableOpacity>

            <Text style={styles.menuText}>Choose Game</Text>

        </View>
          
        
        <Spinner
          visible={this.state.loading}
          textContent={'Loading...'} 
          textStyle={styles.spinnerTextStyle}
        />
        
        
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
  backButton: {
    height: 30,
    width: 30,
  },
  
  logo: {
    height: 30,
    width: 30,
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
  
  menuSectionBlank:{
    height: 120,
    width: '90%',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '5%',
    padding:20,
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
  blankText:{
    color: 'black',
    fontSize: 20,
    fontFamily: 'System',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  teamText:{
    color: 'black',
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  timeText:{
    color: 'black',
    fontSize: 12,
    fontFamily: 'System',
    fontWeight: 'bold',
    textAlign: 'center'
  },


  



});
