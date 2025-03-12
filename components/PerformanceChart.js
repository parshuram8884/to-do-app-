import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function PerformanceChart({ completed, total }) {
  const percentage = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Performance</Text>
      <Text style={styles.text}>Completed: {completed} / {total}</Text>
      <Text style={styles.text}>Performance: {percentage}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center", borderWidth: 1, borderRadius: 5 },
  title: { fontSize: 18, fontWeight: "bold" },
  text: { fontSize: 16, marginTop: 5 }
});
