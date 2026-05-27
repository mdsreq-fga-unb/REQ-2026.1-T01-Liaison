import React from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';

const KeyboardAwareScrollView: React.FC<ScrollViewProps> = (props) => {
  return <ScrollView {...props} />;
};

export { KeyboardAwareScrollView };
export default KeyboardAwareScrollView;
