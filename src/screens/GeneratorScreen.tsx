
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { Check, Copy, RefreshCw } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/Button';
import { theme } from '../theme';
import { PasswordGenerator } from '../utils/passwordGenerator';

export const GeneratorScreen = () => {
    const navigation = useNavigation();
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [useUpper, setUseUpper] = useState(true);
    const [useLower, setUseLower] = useState(true);
    const [useNumbers, setUseNumbers] = useState(true);
    const [useSymbols, setUseSymbols] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        generate();
    }, [length, useUpper, useLower, useNumbers, useSymbols]);

    const generate = async () => {
        // Prevent empty config
        if (!useUpper && !useLower && !useNumbers && !useSymbols) return;

        const pass = await PasswordGenerator.generateAsync({
            length,
            useUpper,
            useLower,
            useNumbers,
            useSymbols,
            excludeAmbiguous: false
        });
        setPassword(pass);
        setCopied(false);
    };

    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const adjustLength = (val: number) => {
        const newLen = Math.max(8, Math.min(64, length + val));
        setLength(newLen);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ color: theme.colors.primary }}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Generator</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.outputContainer}>
                    <Text style={styles.passwordOutput}>{password}</Text>
                    <View style={styles.actions}>
                        <TouchableOpacity onPress={generate} style={styles.iconBtn}>
                            <RefreshCw color={theme.colors.primary} size={24} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={copyToClipboard} style={styles.iconBtn}>
                            {copied ? <Check color={theme.colors.success} size={24} /> : <Copy color={theme.colors.text} size={24} />}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Length: {length}</Text>
                    <View style={styles.lengthControls}>
                        <Button title="-" onPress={() => adjustLength(-1)} style={{ width: 40, paddingHorizontal: 0 }} />
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            {/* Slider could go here, specific UI needed? Simpler buttons for now */}
                            <Text style={{ color: theme.colors.textSecondary }}>{length} Characters</Text>
                        </View>
                        <Button title="+" onPress={() => adjustLength(1)} style={{ width: 40, paddingHorizontal: 0 }} />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Uppercase (A-Z)</Text>
                        <Switch value={useUpper} onValueChange={setUseUpper} trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }} />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Lowercase (a-z)</Text>
                        <Switch value={useLower} onValueChange={setUseLower} trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }} />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Numbers (0-9)</Text>
                        <Switch value={useNumbers} onValueChange={setUseNumbers} trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }} />
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.rowLabel}>Symbols (!@#...)</Text>
                        <Switch value={useSymbols} onValueChange={setUseSymbols} trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }} />
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', padding: theme.spacing.m, alignItems: 'center' },
    title: { ...theme.typography.h2, color: theme.colors.text },
    content: { padding: theme.spacing.m },
    outputContainer: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.l,
        borderRadius: theme.borderRadius.m,
        marginBottom: theme.spacing.xl,
        alignItems: 'center'
    },
    passwordOutput: {
        ...theme.typography.h2,
        color: theme.colors.primary,
        textAlign: 'center',
        marginBottom: theme.spacing.m,
        fontFamily: 'monospace' // System monospace
    },
    actions: { flexDirection: 'row', justifyContent: 'center', gap: 24 },
    iconBtn: { padding: 8 },
    section: { marginBottom: theme.spacing.xl },
    label: { ...theme.typography.caption, color: theme.colors.textSecondary, marginBottom: 8 },
    lengthControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceVariant },
    rowLabel: { ...theme.typography.body, color: theme.colors.text }
});
