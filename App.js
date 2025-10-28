import React from 'react';
import { View, Text, StyleSheet, Image, Button, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import newimg from './assets/favicon.png'
function App() {

  const handleButtonPress = () => {
    console.log('pressed') 
    Alert.alert('button')
  }
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <View
        // style={{
        //   flex: 1,
        //   flexDirection: 'row',
        //   justifyContent: 'center',
        //   alignItems: 'center',
        // }}
        >
          <View style={styles.box1}>
            <Text>Box1</Text>
          </View>
          <View style={{ backgroundColor: 'blue' }}>
            <Text>box 2</Text>
          </View>
        </View>
        <Image
          style={styles.img}
          source={{
            uri: 'https://th.bing.com/th/id/OIP.UvIl8jMyLHSF79JRYKTJnwHaEU?w=286&h=180&c=7&r=0&o=7&dpr=1.4&pid=1.7&rm=3',
          }}
        />
        <Image source={newimg} style={styles.img} />
        <Button title='CLICK' onPress={handleButtonPress} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default App;

const styles = StyleSheet.create({
  box1: {
    backgroundColor: 'orange',
    width: 100,
    height: 100,
  },
  img: {
    height: 100,
    width: 100,
  },
});
