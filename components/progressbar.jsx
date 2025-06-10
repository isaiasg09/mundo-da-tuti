// ProgressBar.js
import React from "react";
import { View, StyleSheet } from "react-native";

export default function ProgressBar({ step, totalSteps, style }) {
  const widthPercent = (step / totalSteps) * 100;

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.progress, { width: `${widthPercent}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 10,
    width: "80%",
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    // marginTop: 40,
    overflow: "hidden",
  },
  progress: {
    height: "100%",
    backgroundColor: "#ff4db8",
  },
});
