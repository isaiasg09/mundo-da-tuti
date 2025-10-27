import React from "react";
import {
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const { width, height } = Dimensions.get("window");

const AchievementModal = ({ visible, achievement, onClose }) => {
  if (!achievement) return null;

  const formatDate = (timestamp) => {
    if (!timestamp) return "Não desbloqueada";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>🏆 CONQUISTA</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Achievement Image */}
            <View style={styles.imageContainer}>
              <View style={styles.imageBorder}>
                <Image
                  source={achievement.image}
                  style={styles.achievementImage}
                  resizeMode="contain"
                />
              </View>

              {/* Status Badge */}
              <View
                style={[
                  styles.statusBadge,
                  achievement.unlocked ? styles.unlockedBadge : styles.lockedBadge,
                ]}
              >
                <Text style={styles.statusText}>
                  {achievement.unlocked ? "DESBLOQUEADA" : "BLOQUEADA"}
                </Text>
              </View>
            </View>

            {/* Achievement Info */}
            <View style={styles.infoContainer}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>

              <Text style={styles.achievementDescription}>{achievement.description}</Text>

              {/* Date Info */}
              <View style={styles.dateContainer}>
                <Text style={styles.dateLabel}>
                  {achievement.unlocked ? "Desbloqueada em:" : "Status:"}
                </Text>
                <Text style={styles.dateText}>{formatDate(achievement.unlocked_at)}</Text>
              </View>

              {/* Progress hint for locked achievements */}
              {!achievement.unlocked && (
                <View style={styles.hintContainer}>
                  <Text style={styles.hintText}>
                    Continue jogando para desbloquear esta conquista!
                  </Text>
                </View>
              )}
            </View>

            {/* Action Button */}
            <TouchableOpacity style={styles.actionButton} onPress={onClose}>
              <Text style={styles.actionButtonText}>ENTENDI</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: scale(20),
  },
  modalContainer: {
    backgroundColor: "#FFF8DC",
    borderRadius: scale(20),
    width: "100%",
    maxWidth: scale(350),
    maxHeight: height * 0.8,
    borderWidth: 3,
    borderColor: "#FFD700",
  },
  scrollContent: {
    padding: scale(20),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  headerTitle: {
    fontSize: moderateScale(20, 0.5),
    fontFamily: "TTMilksCasualPie",
    color: "#8B4513",
  },
  closeButton: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: moderateScale(16, 0.5),
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: verticalScale(20),
  },
  imageBorder: {
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFA500",
    marginBottom: verticalScale(10),
  },
  achievementImage: {
    width: scale(100),
    height: scale(100),
  },
  statusBadge: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
    borderRadius: scale(12),
  },
  unlockedBadge: {
    backgroundColor: "#4CAF50",
  },
  lockedBadge: {
    backgroundColor: "#9E9E9E",
  },
  statusText: {
    fontSize: moderateScale(12, 0.5),
    fontFamily: "TTMilksCasualPie",
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  infoContainer: {
    marginBottom: verticalScale(20),
  },
  achievementTitle: {
    fontSize: moderateScale(22, 0.5),
    fontFamily: "TTMilksCasualPie",
    color: "#8B4513",
    textAlign: "center",
    marginBottom: verticalScale(8),
  },
  achievementDescription: {
    fontSize: moderateScale(16, 0.5),
    fontFamily: "TTMilksCasualPie",
    color: "#A0522D",
    textAlign: "center",
    lineHeight: moderateScale(22, 0.5),
    marginBottom: verticalScale(16),
  },
  dateContainer: {
    backgroundColor: "#F5F5DC",
    padding: scale(12),
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: "#DDD",
  },
  dateLabel: {
    fontSize: moderateScale(14, 0.5),
    fontFamily: "TTMilksCasualPie",
    color: "#8B4513",
    marginBottom: verticalScale(4),
  },
  dateText: {
    fontSize: moderateScale(14, 0.5),
    fontFamily: "TTMilksCasualPie",
    color: "#A0522D",
  },
  hintContainer: {
    backgroundColor: "#E3F2FD",
    padding: scale(12),
    borderRadius: scale(10),
    marginTop: verticalScale(12),
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  hintText: {
    fontSize: moderateScale(14, 0.5),
    fontFamily: "TTMilksCasualPie",
    color: "#1976D2",
    textAlign: "center",
    fontStyle: "italic",
  },
  actionButton: {
    backgroundColor: "#FF69B4",
    paddingVertical: verticalScale(12),
    borderRadius: scale(25),
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: moderateScale(16, 0.5),
    fontFamily: "TTMilksCasualPie",
    color: "#FFFFFF",
  },
});

export default AchievementModal;
