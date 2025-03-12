import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import CompletedTasks from './screens/CompletedTasks';
import IncompleteTasks from './screens/IncompleteTasks';
import Performance from './screens/Performance';
import GoalsScreen from './screens/GoalScreen';
import SubGoalsScreen from './screens/SubGoalsScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TaskTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Completed') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          } else if (route.name === 'Incomplete') {
            iconName = focused ? 'timer' : 'timer-outline';
          } else if (route.name === 'Performance') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Completed" component={CompletedTasks} />
      <Tab.Screen name="Incomplete" component={IncompleteTasks} />
      <Tab.Screen name="Performance" component={Performance} />
    </Tab.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Stack.Navigator initialRouteName="TaskTabs">
      <Stack.Screen 
        name="TaskTabs" 
        component={TaskTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="SubGoals" component={SubGoalsScreen} />
    </Stack.Navigator>
  );
}
