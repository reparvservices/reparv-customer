import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import AgentWidget from './AgentWidget';
import {getFocusedRouteName} from '../../navigation/navigationState';

const HIDDEN_ROUTES = new Set([
  'Splash',
  'Onboarding',
  'Login',
  'CompleteProfile',
  'Calculator',
  'PropertyMap',
]);

export default function AgentWidgetHost() {
  const navigation = useNavigation();
  const [routeName, setRouteName] = useState(() =>
    getFocusedRouteName(navigation.getState()),
  );

  useEffect(() => {
    const syncRoute = () => {
      setRouteName(getFocusedRouteName(navigation.getState()));
    };

    syncRoute();
    const unsubscribe = navigation.addListener('state', syncRoute);
    return unsubscribe;
  }, [navigation]);

  if (!routeName || HIDDEN_ROUTES.has(routeName)) {
    return null;
  }

  return <AgentWidget />;
}
