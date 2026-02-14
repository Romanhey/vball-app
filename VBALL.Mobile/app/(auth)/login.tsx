import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useAuthStore } from '../../src/stores/rootStore';
import { VBALL_COLORS } from '../../src/constants/theme';

export default observer(function LoginScreen() {
  const authStore = useAuthStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const validate = (): boolean => {
    setLocalError(null);
    if (!email.trim()) {
      setLocalError('Email обязателен');
      return false;
    }
    if (!email.includes('@')) {
      setLocalError('Некорректный email');
      return false;
    }
    if (!password) {
      setLocalError('Пароль обязателен');
      return false;
    }
    if (password.length < 6) {
      setLocalError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await authStore.login(email, password);
      setLoginSuccess(true);
      router.replace('/(app)/(tabs)');
    } catch {
      setLocalError(authStore.error || 'Ошибка входа');
    }
  };

  if (authStore.isAuthenticated || loginSuccess) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  const error = localError || authStore.error;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Вход</Text>

        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          placeholderTextColor={VBALL_COLORS.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!authStore.isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={VBALL_COLORS.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!authStore.isLoading}
        />

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Pressable
          style={[styles.submitBtn, authStore.isLoading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={authStore.isLoading}
        >
          <Text style={styles.submitText}>
            {authStore.isLoading ? 'Вход...' : 'Войти'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.link}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.linkText}>Нет аккаунта? Зарегистрироваться</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: VBALL_COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: VBALL_COLORS.white,
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: VBALL_COLORS.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: VBALL_COLORS.border,
    borderRadius: 12,
    fontSize: 16,
    color: VBALL_COLORS.text,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: `${VBALL_COLORS.danger}1A`,
    borderWidth: 1,
    borderColor: VBALL_COLORS.danger,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: VBALL_COLORS.danger,
    fontSize: 14,
  },
  submitBtn: {
    width: '100%',
    backgroundColor: VBALL_COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: VBALL_COLORS.white,
    fontSize: 16,
    fontWeight: '500',
  },
  link: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    color: VBALL_COLORS.primary,
    fontSize: 14,
  },
});
