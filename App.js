import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import CollectionScreen from './screens/CollectionScreen';
import KitDetailScreen  from './screens/KitDetailScreen';
import AddEditScreen    from './screens/AddEditScreen';
import StatsScreen      from './screens/StatsScreen';
import { colors }       from './constants/theme';

const Stack = createNativeStackNavigator();
const Tabs  = createBottomTabNavigator();

const stackOpts = {
  headerStyle:        { backgroundColor: colors.bg2 },
  headerTintColor:    colors.text,
  headerTitleStyle:   { fontWeight: '700', fontSize: 18 },
  headerShadowVisible: false,
  contentStyle:       { backgroundColor: colors.bg },
};

function CollectionStack() {
  return (
    <Stack.Navigator screenOptions={stackOpts}>
      <Stack.Screen name="Collection" component={CollectionScreen} options={{ title: 'GundamBase' }} />
      <Stack.Screen name="KitDetail"  component={KitDetailScreen}  options={({ route }) => ({ title: route.params.kit.name, headerBackTitle: 'Back' })} />
      <Stack.Screen name="AddEdit"    component={AddEditScreen}    options={({ route }) => ({ title: route.params.kit ? 'Edit Kit' : 'Add Kit', presentation: 'modal', headerStyle: { backgroundColor: colors.bg } })} />
    </Stack.Navigator>
  );
}

function StatsStack() {
  return (
    <Stack.Navigator screenOptions={stackOpts}>
      <Stack.Screen name="Stats" component={StatsScreen} options={{ title: 'Stats' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Tabs.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: colors.bg2,
              borderTopColor: colors.border,
              borderTopWidth: 1,
              paddingBottom: 4,
              height: 60,
            },
            tabBarActiveTintColor:   colors.accent,
            tabBarInactiveTintColor: colors.text3,
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
            tabBarIcon: ({ focused, color }) => {
              const icons = {
                CollectionTab: focused ? 'grid'         : 'grid-outline',
                StatsTab:      focused ? 'bar-chart'    : 'bar-chart-outline',
              };
              return <Ionicons name={icons[route.name]} size={22} color={color} />;
            },
          })}
        >
          <Tabs.Screen name="CollectionTab" component={CollectionStack} options={{ title: 'Collection' }} />
          <Tabs.Screen name="StatsTab"      component={StatsStack}      options={{ title: 'Stats' }} />
        </Tabs.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
