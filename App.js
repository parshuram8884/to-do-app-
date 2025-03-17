import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import MainNavigator from "./navigation";
import { GoalProvider } from "./context/GoalContext";
import { StatusBar } from "react-native";

export default function App() {
  return (
    <GoalProvider>
      <NavigationContainer>
        <StatusBar />
        <MainNavigator />
      </NavigationContainer>
    </GoalProvider>
  );
}
