import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

// Pede permissão e devolve a localização atual do usuário.
// status: 'pending' | 'granted' | 'denied'
export default function useUserLocation() {
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const { status: permissao } = await Location.requestForegroundPermissionsAsync();
        if (!ativo) return;
        if (permissao !== 'granted') {
          setStatus('denied');
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        if (!ativo) return;
        setLocation(loc.coords);
        setStatus('granted');
      } catch (e) {
        if (ativo) setStatus('denied');
      }
    })();
    return () => {
      ativo = false;
    };
  }, []);

  return { location, status };
}
