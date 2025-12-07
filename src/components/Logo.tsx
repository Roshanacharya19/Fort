import React from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { theme } from '../theme';

interface LogoProps {
    size?: number;
}

export const Logo: React.FC<LogoProps> = ({ size = 40 }) => {
    return (
        <View style={{ width: size, height: size }}>
            <Svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
                <Defs>
                    <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor={theme.colors.primary} />
                        <Stop offset="100%" stopColor={theme.colors.secondary} />
                    </LinearGradient>
                </Defs>
                {/* Shield Shape */}
                <Path
                    d="M50 5 L15 20 V50 C15 75 50 95 50 95 C50 95 85 75 85 50 V20 L50 5 Z"
                    fill="url(#grad)"
                    stroke={theme.colors.background}
                    strokeWidth="4"
                />
                {/* Keyhole */}
                <Path
                    d="M50 35 C54 35 57 38 57 42 C57 44 56 46 54 47 L56 60 H44 L46 47 C44 46 43 44 43 42 C43 38 46 35 50 35 Z"
                    fill={theme.colors.background}
                />
            </Svg>
        </View>
    );
};
