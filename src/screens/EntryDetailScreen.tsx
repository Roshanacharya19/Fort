
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import * as LocalAuthentication from 'expo-local-authentication';
import { ChevronLeft, Copy, Edit2, Eye, EyeOff, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { useEntriesStore } from '../store/entriesStore';
import { theme } from '../theme';

export const EntryDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { entryId } = route.params;
    const entries = useEntriesStore(state => state.entries);
    const deleteEntry = useEntriesStore(state => state.deleteEntry);

    const entry = entries.find(e => e.id === entryId);

    const [showPassword, setShowPassword] = useState(false);

    if (!entry) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={{ color: theme.colors.text }}>Entry not found.</Text>
                <Button title="Back" onPress={() => navigation.goBack()} />
            </SafeAreaView>
        );
    }

    const copyToClipboard = async (text: string, label: string) => {
        if (!text) return;
        await Clipboard.setStringAsync(text);
        // Toast ideally
        Alert.alert('Copied', `${label} copied to clipboard`);
    };

    const handleDelete = () => {
        Alert.alert('Delete Entry', 'Are you sure you want to delete this password?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await deleteEntry(entry.id);
                    navigation.goBack();
                }
            }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <ChevronLeft color={theme.colors.primary} size={28} />
                        <Text style={{ color: theme.colors.primary, fontSize: 17, marginLeft: -4 }}>Back</Text>
                    </View>
                </TouchableOpacity>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={() => navigation.navigate('AddEntry', { entryId: entry.id })} style={{ marginRight: 16 }}>
                        <Edit2 color={theme.colors.primary} size={24} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete}>
                        <Trash2 color={theme.colors.error} size={24} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.titleBlock}>
                    <View style={styles.iconPlaceholder}>
                        <Text style={{ fontSize: 32 }}>🔑</Text>
                    </View>
                    <Text style={styles.title}>{entry.name}</Text>
                    {entry.url ? <Text style={styles.subtitle}>{entry.url}</Text> : null}
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Username</Text>
                    <View style={styles.fieldRow}>
                        <Text style={styles.value}>{entry.username || '—'}</Text>
                        <TouchableOpacity onPress={() => copyToClipboard(entry.username!, 'Username')}>
                            <Copy color={theme.colors.primary} size={20} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.fieldRow}>
                        <Text style={styles.value}>
                            {showPassword ? entry.password : '••••••••••••'}
                        </Text>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity
                                onPress={async () => {
                                    if (!showPassword) {
                                        // Require ID to show
                                        try {
                                            const result = await LocalAuthentication.authenticateAsync({
                                                promptMessage: 'Authenticate to view password',
                                                fallbackLabel: 'Use Passcode'
                                            });
                                            if (result.success) {
                                                setShowPassword(true);
                                            } else {
                                                Alert.alert('Authentication Failed', 'Could not verify identity.');
                                            }
                                        } catch (error) {
                                            console.error('Biometric error', error);
                                            Alert.alert('Error', 'Biometric authentication unavailable.');
                                        }
                                    } else {
                                        // Hide immediately without auth
                                        setShowPassword(false);
                                    }
                                }}
                                style={{ marginRight: 16 }}
                            >
                                {showPassword ? <EyeOff color={theme.colors.textSecondary} size={20} /> : <Eye color={theme.colors.textSecondary} size={20} />}
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => copyToClipboard(entry.password!, 'Password')}>
                                <Copy color={theme.colors.primary} size={20} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* Password History could go here */}
                </View>

                {entry.notes ? (
                    <View style={styles.section}>
                        <Text style={styles.label}>Notes</Text>
                        <Text style={styles.value}>{entry.notes}</Text>
                    </View>
                ) : null}

                <View style={styles.section}>
                    <Text style={styles.label}>Modified</Text>
                    <Text style={{ color: theme.colors.textSecondary }}>{new Date(entry.modifiedAt).toLocaleString()}</Text>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.m,
        paddingTop: theme.spacing.m,
        paddingBottom: theme.spacing.s,
    },
    headerButton: {
        padding: 8,
    },
    backText: {
        color: theme.colors.primary,
        fontSize: 17,
        fontWeight: '600',
    },
    content: {
        padding: theme.spacing.m,
    },
    titleBlock: {
        alignItems: 'center',
        marginTop: theme.spacing.l,
        marginBottom: theme.spacing.xxl,
    },
    iconPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 24, // Squircle-ish
        backgroundColor: theme.colors.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.primary,
        textAlign: 'center',
    },
    section: {
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 16,
        marginBottom: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    label: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    fieldRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    value: {
        fontSize: 17,
        color: theme.colors.text,
        flex: 1,
        marginRight: 16,
        fontWeight: '500',
    },
    actionButton: {
        padding: 8,
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: 8,
        marginLeft: 12,
    }
});
