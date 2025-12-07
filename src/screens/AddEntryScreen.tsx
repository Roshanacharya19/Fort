
import { useNavigation, useRoute } from '@react-navigation/native';
import { RefreshCw } from 'lucide-react-native'; // Icons
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import zxcvbn from 'zxcvbn';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useEntriesStore } from '../store/entriesStore';
import { theme } from '../theme';
import { PasswordGenerator } from '../utils/passwordGenerator';

export const AddEntryScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const entryId = route.params?.entryId;

    const addEntry = useEntriesStore(state => state.addEntry);
    const updateEntry = useEntriesStore(state => state.updateEntry);
    const entries = useEntriesStore(state => state.entries);

    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [url, setUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    // Load existing data if editing
    React.useEffect(() => {
        if (entryId) {
            const entry = entries.find(e => e.id === entryId);
            if (entry) {
                setName(entry.name);
                setUsername(entry.username || '');
                setPassword(entry.password || '');
                setUrl(entry.url || '');
                setNotes(entry.notes || '');
                navigation.setOptions({ title: 'Edit Password' });
            }
        }
    }, [entryId, entries, navigation]);

    // Generator State
    const [genLength, setGenLength] = useState(16);
    // ... other options

    const checkStrength = (pass: string) => {
        if (!pass) return { score: 0 };
        return zxcvbn(pass);
    };
    const strength = checkStrength(password);
    const strengthColors = ['#CF6679', '#FFB74D', '#FFEB3B', '#69F0AE', '#00C853'];

    const handleGenerate = async () => {
        const pass = await PasswordGenerator.generateAsync({
            length: 16,
            useUpper: true,
            useLower: true,
            useNumbers: true,
            useSymbols: true,
            excludeAmbiguous: false
        });
        setPassword(pass);
    };

    const handleSave = async () => {
        if (!name || !password) {
            // Error
            return;
        }
        setLoading(true);
        let success = false;

        if (entryId) {
            const existing = entries.find(e => e.id === entryId);
            if (existing) {
                const passwordChanged = existing.password !== password;
                const newHistory = passwordChanged
                    ? [...(existing.passwordHistory || []), { password: existing.password!, changedAt: Date.now() }]
                    : existing.passwordHistory;

                success = await updateEntry({
                    ...existing,
                    name,
                    username,
                    password,
                    url,
                    notes,
                    passwordHistory: newHistory,
                    modifiedAt: Date.now()
                });
            }
        } else {
            success = await addEntry({
                name,
                username,
                password,
                url,
                notes,
                isFavorite: false,
                categoryId: undefined, // Default
                tags: []
            });
        }

        setLoading(false);
        if (success) {
            navigation.goBack();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Button title="Cancel" onPress={() => navigation.goBack()} variant="ghost" />
                <Text style={styles.title}>{entryId ? 'Edit Password' : 'New Password'}</Text>
                <Button title="Save" onPress={handleSave} loading={loading} disabled={!name || !password} />
            </View>
            <ScrollView style={styles.content}>
                <Input label="Name" value={name} onChangeText={setName} placeholder="e.g. Gmail" />
                <Input label="Username" value={username} onChangeText={setUsername} placeholder="email@example.com" />

                <View style={styles.passwordContainer}>
                    <Input
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={false} // Visible toggling needed
                        containerStyle={{ flex: 1 }}
                    />
                    <TouchableOpacity onPress={handleGenerate} style={styles.genButton}>
                        <RefreshCw color={theme.colors.primary} size={24} />
                    </TouchableOpacity>
                </View>

                {/* Strength Bar */}
                {password.length > 0 && (
                    <View style={{ flexDirection: 'row', height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 16 }}>
                        <View style={{ flex: strength.score + 1, backgroundColor: strengthColors[strength.score] || theme.colors.surfaceVariant }} />
                        <View style={{ flex: 4 - (strength.score), backgroundColor: 'transparent' }} />
                    </View>
                )}

                <Input label="Website" value={url} onChangeText={setUrl} placeholder="https://..." />
                <Input label="Notes" value={notes} onChangeText={setNotes} multiline numberOfLines={3} style={{ height: 100, textAlignVertical: 'top' }} />

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
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.m // Input has margin but we might need wrapper logic
    },
    genButton: {
        padding: 10,
        marginLeft: 8,
        marginBottom: 16 // align with input margin
    }
});
