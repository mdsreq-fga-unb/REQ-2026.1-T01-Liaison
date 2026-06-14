import React from 'react';
import { Text } from 'react-native';

interface MockIconProps {
  name: string;
  size?: number;
  color?: string;
}

const createMockIcon = () => {
  const MockIcon: React.FC<MockIconProps> = ({ name, size, color, ...props }) => (
    <Text {...(props as any)}>{`[icon:${name}]`}</Text>
  );
  return MockIcon;
};

export const Ionicons = createMockIcon();
export const MaterialIcons = createMockIcon();
export const FontAwesome = createMockIcon();
