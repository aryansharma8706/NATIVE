// import React from 'react';
// import { View, Text, StyleSheet, Image, Button, Alert } from 'react-native';
// import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
// import newimg from './assets/favicon.png'
// function App() {

//   const handleButtonPress = () => {
//     console.log('pressed')
//     Alert.alert('button')
//   }
//   return (
//     <SafeAreaProvider>
//       <SafeAreaView style={{ flex: 1 }}>
//         <View
//         // style={{
//         //   flex: 1,
//         //   flexDirection: 'row',
//         //   justifyContent: 'center',
//         //   alignItems: 'center',
//         // }}
//         >
//           <View style={styles.box1}>
//             <Text>Box1</Text>
//           </View>
//           <View style={{ backgroundColor: 'blue' }}>
//             <Text>box 2</Text>
//           </View>
//         </View>
//         <Image
//           style={styles.img}
//           source={{
//             uri: 'https://th.bing.com/th/id/OIP.UvIl8jMyLHSF79JRYKTJnwHaEU?w=286&h=180&c=7&r=0&o=7&dpr=1.4&pid=1.7&rm=3',
//           }}
//         />
//         <Image source={newimg} style={styles.img} />
//         <Button title='CLICK' onPress={handleButtonPress} />
//       </SafeAreaView>
//     </SafeAreaProvider>
//   );
// }

// export default App;

// const styles = StyleSheet.create({
//   box1: {
//     backgroundColor: 'orange',
//     width: 100,
//     height: 100,
//   },
//   img: {
//     height: 100,
//     width: 100,
//   },
// });

import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import {useEffect , useState} from 'react'
const App = () => {
  const [todo , setTodo] = useState(null)
  const [loading , setLoading] = useState(true)
  useEffect(()=>{
    setLoading(true)
    axios.get('https://jsonplaceholder.typicode.com/todos').then((res)=>{
      setTodo(res.data)
    }).catch((err)=>{
      console.log(err)
    }).finally(()=>{
      setLoading(false)
    })
  })
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <View>
          <Text>App</Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({});
//shorthand for creating native component rnfes