import { forwardRef, useState } from 'react';
import { Platform, TextInput, View } from 'react-native';

import { fontFamily, typography } from '../tokens';
import { Text } from './Text';

export type CodeFieldProps = {
  value: string;
  onChangeText: (code: string) => void;
  /** Called once all digits are entered. */
  onComplete?: (code: string) => void;
  length?: number;
  /** Shows the boxes in terracotta; the message itself is rendered by the screen. */
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  accessibilityLabel?: string;
};

/**
 * One-time code input: large separate boxes over a single invisible text input,
 * so system autofill ("Code aus Mail"), paste and screen readers work as usual.
 */
export const CodeField = forwardRef<TextInput, CodeFieldProps>(function CodeField(
  {
    value,
    onChangeText,
    onComplete,
    length = 6,
    invalid = false,
    disabled = false,
    autoFocus = false,
    accessibilityLabel = `Code mit ${length} Ziffern`,
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const half = Math.ceil(length / 2);

  const change = (text: string) => {
    // Pasted codes may contain spaces ("123 456").
    const digits = text.replace(/\D/g, '').slice(0, length);
    onChangeText(digits);
    if (digits.length === length && digits !== value) onComplete?.(digits);
  };

  return (
    <View className="w-full max-w-[400px] self-center">
      <View
        className="flex-row items-center gap-2"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {Array.from({ length }, (_, i) => {
          const active = focused && !disabled && i === Math.min(value.length, length - 1);
          const border = invalid ? 'border-accent' : active ? 'border-focus' : 'border-border-strong';
          return (
            <View key={i} className={`flex-1 flex-row ${i === half ? 'ml-2' : ''}`}>
              <View
                className={`min-h-[60px] flex-1 items-center justify-center rounded-md border-[1.5px] bg-surface ${border} ${
                  active ? 'border-2' : ''
                }`}
              >
                <Text variant="title1" tone={disabled ? 'subtle' : 'default'}>
                  {value[i] ?? ''}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={change}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={!disabled}
        autoFocus={autoFocus}
        maxLength={length + 2}
        keyboardType="number-pad"
        inputMode="numeric"
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        caretHidden
        contextMenuHidden={false}
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={{ text: value ? value.split('').join(' ') : 'leer' }}
        accessibilityState={{ disabled }}
        maxFontSizeMultiplier={typography.title1.maxScale}
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0,
            fontFamily: fontFamily.regular,
          },
          Platform.OS === 'web' ? ({ outlineWidth: 0 } as object) : null,
        ]}
      />
    </View>
  );
});
