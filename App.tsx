import { NavigationContainer } from '@react-navigation/native';
import * as ScreenCapture from 'expo-screen-capture';
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { theme } from './src/theme';

export default function App() {
    useEffect(() => {
        // Prevent screen capture for security
        ScreenCapture.preventScreenCaptureAsync();
    }, []);

    return (
        <SafeAreaProvider style={{ backgroundColor: theme.colors.background }}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
            <NavigationContainer>
                <RootNavigator />
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
