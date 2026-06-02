import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { colors } from '../theme';

const { width, height } = Dimensions.get('window');

export default function EntradaScreen({ onFim }) {
  const opacidade = useRef(new Animated.Value(0)).current;
  const escala   = useRef(new Animated.Value(1.06)).current;

  useEffect(() => {
    // 1) fade-in + leve zoom-out (Ken Burns suave)
    Animated.parallel([
      Animated.timing(opacidade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(escala, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: true,
      }),
    ]).start();

    // 2) depois de 2.4s, fade-out e chama onFim
    const t = setTimeout(() => {
      Animated.timing(opacidade, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => onFim());
    }, 2400);

    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Animated.Image
        source={require('../../assets/menuentrada.jpg')}
        style={[styles.imagem, { opacity: opacidade, transform: [{ scale: escala }] }]}
        resizeMode="cover"
      />
      {/* Overlay com logo + nome do app na base */}
      <Animated.View style={[styles.overlay, { opacity: opacidade }]}>
        <Image
          source={require('../../assets/recife-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  imagem: {
    width,
    height,
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  logo: {
    width: 90,
    height: 90,
  },
});
