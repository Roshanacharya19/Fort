import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AddEntryScreen } from '../screens/AddEntryScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SetupScreen } from '../screens/auth/SetupScreen';
import { CategoryManagementScreen } from '../screens/CategoryManagementScreen';
import { EntryDetailScreen } from '../screens/EntryDetailScreen';
import { GeneratorScreen } from '../screens/GeneratorScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useAuthStore } from '../store/authStore';
import { theme } from '../theme';

const Stack = createNativeStackNavigator();

const LoadingScreen = () => (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
);

const AuthenticatedStack = createNativeStackNavigator();

const AuthenticatedNavigator = () => (
    <AuthenticatedStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
        <AuthenticatedStack.Screen name="Home" component={HomeScreen} />
        <AuthenticatedStack.Screen name="Settings" component={SettingsScreen} />
        <AuthenticatedStack.Screen name="CategoryManagement" component={CategoryManagementScreen} />
        <AuthenticatedStack.Screen name="Generator" component={GeneratorScreen} />
        <AuthenticatedStack.Screen name="AddEntry" component={AddEntryScreen} options={{ presentation: 'modal' }} />
        <AuthenticatedStack.Screen name="EntryDetail" component={EntryDetailScreen} />
    </AuthenticatedStack.Navigator>
);

import { useSessionManager } from '../hooks/useSessionManager';

export const RootNavigator = () => {
    useSessionManager();
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const isSetup = useAuthStore(state => state.isSetup);
    const checkSetup = useAuthStore(state => state.checkSetup);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            await checkSetup();
            setIsLoading(false);
        };
        init();
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
            {!isSetup ? (
                <Stack.Screen name="Setup" component={SetupScreen} />
            ) : !isAuthenticated ? (
                <Stack.Screen name="Login" component={LoginScreen} />
            ) : (
                <Stack.Screen name="Main" component={AuthenticatedNavigator} />
            )}
        </Stack.Navigator>
    );
};
