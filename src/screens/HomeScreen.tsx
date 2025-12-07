import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { Copy, Plus, Search, Settings } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { useAuthStore } from '../store/authStore';
import { useEntriesStore } from '../store/entriesStore';
import { theme } from '../theme';

export const HomeScreen = () => {
    // ... (existing hooks)
    const logout = useAuthStore(state => state.logout);
    const { entries, loading, loadData } = useEntriesStore();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const navigation = useNavigation<any>();

    const filteredEntries = entries.filter(e =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.username && e.username.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleCopy = async (password: string) => {
        await Clipboard.setStringAsync(password);
        Alert.alert('Copied', 'Password copied to clipboard');
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('EntryDetail', { entryId: item.id })}>
            <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                    <Text style={{ fontSize: 22 }}>🔑</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    {item.username ? <Text style={styles.cardSubtitle}>{item.username}</Text> : null}
                </View>
                <TouchableOpacity style={styles.copyButton} onPress={() => handleCopy(item.password)}>
                    <Copy size={18} color={theme.colors.primary} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Logo size={32} />
                    <Text style={styles.headerTitle}>Fort</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.iconButton}>
                    <Settings color={theme.colors.textSecondary} size={24} />
                </TouchableOpacity>
            </View>

            {/* Modern Search Bar */}
            <View style={styles.searchContainer}>
                <Search color={theme.colors.textSecondary} size={20} style={{ marginRight: 12 }} />
                <TextInput
                    placeholder="Search your vault..."
                    placeholderTextColor={theme.colors.textSecondary}
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading ? (
                <View style={styles.centerContent}>
                    <Text style={{ color: theme.colors.textSecondary }}>Loading...</Text>
                </View>
            ) : filteredEntries.length === 0 ? (
                <View style={styles.centerContent}>
                    <Text style={styles.emptyText}>{entries.length === 0 ? 'Your vault is empty.' : 'No passwords found.'}</Text>
                    {entries.length === 0 && (
                        <Button
                            title="Add First Password"
                            onPress={() => navigation.navigate('AddEntry')}
                            style={{ marginTop: theme.spacing.l, width: 200 }}
                        />
                    )}
                </View>
            ) : (
                <FlatList
                    data={filteredEntries}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Floating Action Button */}
            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddEntry')}>
                <Plus size={32} color="#FFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingHorizontal: theme.spacing.m,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.m,
        marginBottom: theme.spacing.s,
    },
    headerTitle: {
        ...theme.typography.h2,
        marginLeft: 12,
        fontWeight: 'bold',
    },
    iconButton: {
        padding: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        paddingHorizontal: theme.spacing.m,
        height: 50,
        marginBottom: theme.spacing.l,
    },
    searchInput: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 16,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        ...theme.typography.body,
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    card: {
        marginBottom: theme.spacing.m,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.surfaceVariant,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardTitle: {
        ...theme.typography.body,
        fontWeight: '600',
        color: theme.colors.text,
        fontSize: 17,
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    copyButton: {
        padding: 8,
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: 8,
        marginLeft: 8,
    },
    fab: {
        position: 'absolute',
        bottom: 32,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});
