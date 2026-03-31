import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CollectionScreen from './screens/CollectionScreen';
import KitDetailScreen  from './screens/KitDetailScreen';
import AddEditScreen    from './screens/AddEditScreen';
import { colors }       from './constants/theme';

const Stack = createNativeStackNavigator();

const screenOpts = {
  headerStyle:       { backgroundColor: colors.bg2 },
  headerTintColor:   colors.text,
  headerTitleStyle:  { fontWeight: '700', fontSize: 18 },
  headerShadowVisible: false,
  contentStyle:      { backgroundColor: colors.bg },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={screenOpts}>
          <Stack.Screen
            name="Collection"
            component={CollectionScreen}
            options={{ title: 'GundamBase' }}
          />
          <Stack.Screen
            name="KitDetail"
            component={KitDetailScreen}
            options={({ route }) => ({ title: route.params.kit.name, headerBackTitle: 'Back' })}
          />
          <Stack.Screen
            name="AddEdit"
            component={AddEditScreen}
            options={({ route }) => ({
              title: route.params.kit ? 'Edit Kit' : 'Add Kit',
              presentation: 'modal',
              headerStyle: { backgroundColor: colors.bg },
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
