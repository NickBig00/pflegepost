import { CircleAlert } from 'lucide-react-native';
import { useId, useState } from 'react';
import { Platform, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '../theme';
import { fontFamily, typography } from '../tokens';
import { Icon } from './Icon';
import { Text } from './Text';

export type TextFieldProps = Omit<TextInputProps, 'style' | 'placeholderTextColor'> & {
  label: string;
  helper?: string;
  /** Friendly, solution-oriented message ("Bitte gib eine E-Mail-Adresse ein."). Shown in terracotta, not red. */
  error?: string;
};

export function TextField({ label, helper, error, multiline, onFocus, onBlur, ...rest }: TextFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const id = useId();

  const border = error ? 'border-accent' : focused ? 'border-focus' : 'border-border-strong';

  return (
    <View className="gap-2">
      <Text variant="calloutStrong" nativeID={id}>
        {label}
      </Text>
      <View
        className={`rounded-md border-[1.5px] bg-surface px-4 ${border} ${
          multiline ? 'min-h-[112px] py-3' : 'min-h-[52px] justify-center'
        }`}
      >
        <TextInput
          accessibilityLabel={label}
          accessibilityLabelledBy={id}
          accessibilityHint={error ?? helper}
          placeholderTextColor={colors.fgSubtle}
          selectionColor={colors.primary}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          maxFontSizeMultiplier={typography.body.maxScale}
          style={[
            {
              color: colors.fg,
              fontFamily: fontFamily.regular,
              fontSize: typography.body.size,
              lineHeight: multiline ? typography.body.lineHeight : undefined,
              paddingVertical: multiline ? 0 : 12,
            },
            // The surrounding border shows focus; hide the browser outline.
            Platform.OS === 'web' ? ({ outlineWidth: 0 } as object) : null,
          ]}
          {...rest}
        />
      </View>
      {error ? (
        <View className="flex-row items-center gap-1.5" accessibilityLiveRegion="polite">
          <Icon icon={CircleAlert} size={16} color="accent" />
          <Text variant="callout" tone="accent" className="flex-1">
            {error}
          </Text>
        </View>
      ) : helper ? (
        <Text variant="callout" tone="muted">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
