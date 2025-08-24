import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ShareCardProps {
	appName?: string;
	currentStreak: number;
	dailyGoalMinutes: number;
	todayUsageMinutes: number;
}

const formatTime = (minutes: number) => {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	if (hours > 0) {
		return `${hours}h ${mins}m`;
	}
	return `${mins}m`;
};

export const ShareCard: React.FC<ShareCardProps> = ({
	appName = 'ScreenStreak',
	currentStreak,
	dailyGoalMinutes,
	todayUsageMinutes,
}) => {
	return (
		<View style={styles.card}>
			<View style={styles.headerRow}>
				{/* Replace with a real logo asset when available */}
				<View style={styles.logoBadge}>
					<Text style={styles.logoText}>SS</Text>
				</View>
				<Text style={styles.brandTitle}>{appName}</Text>
			</View>

			<View style={styles.statsRow}>
				<View style={styles.statBox}>
					<Text style={styles.statLabel}>Current Streak</Text>
					<Text style={styles.statValue}>{currentStreak} days</Text>
				</View>
				<View style={styles.statBox}>
					<Text style={styles.statLabel}>Daily Goal</Text>
					<Text style={styles.statValue}>{formatTime(dailyGoalMinutes)}</Text>
				</View>
				<View style={styles.statBox}>
					<Text style={styles.statLabel}>Today</Text>
					<Text style={styles.statValue}>{formatTime(todayUsageMinutes)}</Text>
				</View>
			</View>

			<View style={styles.footer}>
				<Text style={styles.tagline}>Tapering unproductive screen time, one day at a time.</Text>
				<Text style={styles.disclaimer}>
					Reducing screentime is at your discretion. High usage for learning is OK. This focuses on unproductive habits.
				</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		width: 1080,
		height: 1350,
		backgroundColor: '#0b1220',
		borderRadius: 48,
		padding: 64,
		justifyContent: 'space-between',
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 24,
	},
	logoBadge: {
		width: 120,
		height: 120,
		borderRadius: 28,
		backgroundColor: '#1f2a44',
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 2,
		borderColor: '#60a5fa',
	},
	logoText: {
		color: '#60a5fa',
		fontSize: 54,
		fontWeight: '800',
		letterSpacing: 2,
	},
	brandTitle: {
		color: '#e5e7eb',
		fontSize: 72,
		fontWeight: '800',
	},
	statsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 24,
	},
	statBox: {
		flex: 1,
		backgroundColor: '#111827',
		padding: 48,
		borderRadius: 32,
		borderWidth: 2,
		borderColor: '#1f2937',
	},
	statLabel: {
		color: '#9ca3af',
		fontSize: 36,
		marginBottom: 16,
	},
	statValue: {
		color: '#f3f4f6',
		fontSize: 72,
		fontWeight: '800',
	},
	footer: {
		gap: 16,
	},
	tagline: {
		color: '#93c5fd',
		fontSize: 40,
		fontWeight: '700',
	},
	disclaimer: {
		color: '#9ca3af',
		fontSize: 32,
		lineHeight: 42,
	},
});

export default ShareCard;

