import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

/**
 * The warm cream the brand mark is drawn on (`brand/geometry.js`).
 *
 * Deliberately not a theme colour. It belongs to the logo rather than to the
 * screen, and it has to stay cream in dark mode - see below.
 */
const BRAND_CREAM = '#FBEDC8';

interface BrandMarkProps {
  /** Rendered width in points. The mark keeps its own 146:94 aspect ratio. */
  width?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * The OffersOffer mark, as it appears in a screen header.
 *
 * ## Why it sits on a cream chip
 *
 * The asset is transparent, and on a light screen that is exactly right. In
 * dark mode it was not: the mark is ink on the left and gold on the right, and
 * against a near-black background the ink ring vanished - half the logo simply
 * disappeared, which no light-mode screenshot would ever have shown.
 *
 * The fix is the ground, not the artwork. The mark is drawn for warm cream and
 * its palette is matched to the reference the owner supplied, so recolouring
 * the ink ring for dark mode would be redrawing someone else's logo to work
 * around a background we chose. Giving it the cream it was designed on keeps it
 * exactly as drawn and legible on either theme.
 *
 * ## Why this is a component rather than a snippet
 *
 * It appears in five tab headers. Copied five times, the dark-mode rule above
 * survives only as long as everyone who touches a header remembers it - and the
 * failure is invisible in light mode, which is where most of the looking
 * happens.
 */
export function BrandMark({ width = 34, style }: BrandMarkProps) {
  // 146 x 94 is the mark's geometry; deriving the height keeps it undistorted
  // at any width a caller picks.
  const height = Math.round((width * 94) / 146);

  return (
    <View
      style={[
        {
          // Never stretch. In a row the cross axis is vertical so this was
          // moot, but dropped into a plain column - the guest gate does exactly
          // that - the chip filled the width and read as a cream banner with a
          // logo stuck to one end. Belongs here rather than at each call site:
          // a caller should be able to place the mark anywhere without knowing
          // which axis its parent happens to lay out on.
          alignSelf: 'flex-start',
          backgroundColor: BRAND_CREAM,
          borderRadius: Math.round(width / 3.8),
          paddingHorizontal: 5,
          paddingVertical: 4,
        },
        style,
      ]}
    >
      <Image
        source={require('../../assets/logo-header.png')}
        style={{ width, height }}
        contentFit="contain"
        accessibilityRole="image"
        accessibilityLabel="OffersOffer"
      />
    </View>
  );
}
