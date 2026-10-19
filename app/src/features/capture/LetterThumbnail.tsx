import { View } from 'react-native';

import { useTheme } from '@/ui';

/** A letter seen from afar: blocks and lines instead of text. Decorative. */
export function LetterThumbnail({ width }: { width: number }) {
  const { colors, shadows } = useTheme();
  const pad = width * 0.09;
  const line = (w: `${number}%`, strong = false) => (
    <View
      style={{
        width: w,
        height: Math.max(3, width * 0.022),
        borderRadius: 2,
        backgroundColor: strong ? colors.paperInkMuted : colors.paperLine,
      }}
    />
  );
  return (
    <View
      aria-hidden
      style={{
        width,
        height: width * 1.414,
        padding: pad,
        gap: width * 0.03,
        borderRadius: 6,
        backgroundColor: colors.paper,
        boxShadow: shadows.raised,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: width * 0.05 }}>
        <View style={{ gap: width * 0.02, width: '45%' }}>
          {line('70%')}
          {line('100%')}
          {line('85%')}
        </View>
        <View
          style={{
            width: width * 0.16,
            height: width * 0.08,
            borderRadius: 2,
            backgroundColor: colors.paperAccent,
          }}
        />
      </View>
      {line('40%')}
      {line('35%')}
      {line('38%')}
      <View style={{ height: width * 0.05 }} />
      {line('75%', true)}
      <View style={{ height: width * 0.02 }} />
      {line('100%')}
      {line('96%')}
      {line('100%')}
      {line('60%')}
      <View style={{ height: width * 0.02 }} />
      {line('100%')}
      {line('92%')}
      {line('80%')}
    </View>
  );
}
