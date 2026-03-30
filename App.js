import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import InventoryScreen from './screens/InventoryScreen';
import KitDetailScreen from './screens/KitDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#13161e' },
          headerTintColor: '#e2e8f0',
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: '#0d0f14' },
        }}
      >
        <Stack.Screen
          name="Inventory"
          component={InventoryScreen}
          options={{ title: 'GundamBase' }}
        />
        <Stack.Screen
          name="KitDetail"
          component={KitDetailScreen}
          options={({ route }) => ({ title: route.params.kit.name })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
