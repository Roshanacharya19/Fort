
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard'; // For export (copy to clipboard for MVP)
import { ChevronRight, Clock, Download, LogOut, Shield } from 'lucide-react-native';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/authStore';
import { useEntriesStore } from '../store/entriesStore';
import { useSettingsStore } from '../store/settingsStore';
import { theme } from '../theme';

export const SettingsScreen = () => {
    const navigation = useNavigation<any>();
    const logout = useAuthStore(state => state.logout);
    const { biometricsEnabled, autoLockTimeout, toggleBiometrics, setAutoLockTimeout } = useSettingsStore();
    const entries = useEntriesStore(state => state.entries);

    const handleExport = () => {
        // Security risk! But requested as feature.
        Alert.alert('Export Vault', 'This will export your vault as unencrypted JSON. Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Copy to Clipboard', onPress: async () => {
                    const exportData = JSON.stringify(entries, null, 2);
                    await Clipboard.setStringAsync(exportData);
                    Alert.alert('Success', 'Vault data copied to clipboard. Paste it somewhere safe immediately.');
                }
            }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Security</Text>

                    <View style={styles.row}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Shield color={theme.colors.text} size={20} style={{ marginRight: 12 }} />
                            <Text style={styles.rowLabel}>Biometric Unlock</Text>
                        </View>
                        <Switch
                            value={biometricsEnabled}
                            onValueChange={toggleBiometrics}
                            trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Clock color={theme.colors.text} size={20} style={{ marginRight: 12 }} />
                            <Text style={styles.rowLabel}>Auto-lock Timeout</Text>
                        </View>
                        <TouchableOpacity onPress={() => {
                            // Cycle through options for MVP: 1m, 2m, 5m, Never
                            const options = [60, 120, 300, 0];
                            const idx = options.indexOf(autoLockTimeout);
                            const next = options[(idx + 1) % options.length];
                            setAutoLockTimeout(next);
                        }}>
                            <Text style={{ color: theme.colors.primary }}>
                                {autoLockTimeout === 0 ? 'Never' : `${autoLockTimeout / 60} min`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Data</Text>

                    <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('CategoryManagement')}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.rowLabel}>Manage Categories</Text>
                        </View>
                        <ChevronRight color={theme.colors.textSecondary} size={20} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.row} onPress={handleExport}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Download color={theme.colors.text} size={20} style={{ marginRight: 12 }} />
                            <Text style={styles.rowLabel}>Export Data (JSON)</Text>
                        </View>
                        <ChevronRight color={theme.colors.textSecondary} size={20} />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>

                    <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={logout}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <LogOut color={theme.colors.error} size={20} style={{ marginRight: 12 }} />
                            <Text style={[styles.rowLabel, { color: theme.colors.error }]}>Log Out</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Version 1.0.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    title: {
        ...theme.typography.h2,
        color: theme.colors.text,
    },
    content: {
        padding: theme.spacing.m,
    },
    section: {
        marginBottom: theme.spacing.xl,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.m,
        overflow: 'hidden',
    },
    sectionTitle: {
        ...theme.typography.caption,
        color: theme.colors.textSecondary,
        marginLeft: 16,
        marginTop: 16,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    rowLabel: {
        ...theme.typography.body,
        color: theme.colors.text,
    }
});
