import React, { useState } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { theme, Text, Button, Input } from '@qarmo/ui';
import { useTranslation, i18n } from '@qarmo/i18n';
import { APP_VERSION } from '@qarmo/core';

export default function App() {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [lang, setLang] = useState<'en' | 'ml'>('en');

  const toggleLanguage = () => {
    const next = lang === 'en' ? 'ml' : 'en';
    i18n.changeLanguage(next);
    setLang(next);
  };

  const handleContinue = () => {
    // TODO: trigger OTP send to phone number
    alert(`Sending OTP to ${phone}`);
  };

  const isValid = phone.replace(/\D/g, '').length >= 10;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="title" color={theme.colors.primary} style={styles.appTitle}>
            Qarmo Partner
          </Text>
          <Text variant="body" color={theme.colors.mutedText} style={styles.subtitle}>
            Drive &amp; Earn
          </Text>
        </View>

        {/* Phone entry */}
        <View style={styles.form}>
          <Input
            label={t('auth.phone')}
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            autoComplete="tel"
            returnKeyType="done"
          />
        </View>

        {/* Footer — sticky Continue + language toggle */}
        <View style={styles.footer}>
          <Button
            label={t('common.ok')}
            variant="primary"
            disabled={!isValid}
            onPress={handleContinue}
            style={styles.continueBtn}
          />

          <Button
            label={lang === 'en' ? 'മലയാളം' : 'English'}
            variant="ghost"
            onPress={toggleLanguage}
          />

          <Text variant="caption" color={theme.colors.mutedText} style={styles.version}>
            v{APP_VERSION}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  kav: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'space-between',
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  appTitle: {
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: 'center',
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  continueBtn: {
    width: '100%',
  },
  version: {
    marginTop: theme.spacing.xs,
  },
});
