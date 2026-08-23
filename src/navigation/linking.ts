import * as Linking from 'expo-linking';
import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/**
 * Routes an incoming deep link to the screen it names.
 *
 * `Share` on an offer and on a shop already hand out `offersapp://offer/:id`
 * and `offersapp://shop/:id` (see `utils/links.ts`), and `app.json` registers
 * the scheme - but without this config React Navigation had nothing to match
 * those URLs against, so tapping a shared link only opened the app at whatever
 * screen it was last on.
 *
 * Only the two paths that are actually generated are mapped; anything else
 * falls through and lands on the default screen as before.
 *
 * `Linking.createURL('/')` covers the `exp://` host the app is reached on in
 * development, where the custom scheme is not registered.
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'offersapp://'],
  config: {
    screens: {
      // The id arrives as a string; OfferDetail's param is typed as a number
      // and is handed straight to the offer query.
      OfferDetail: { path: 'offer/:offerId', parse: { offerId: Number } },
      // ShopDetail accepts an id or a slug, so the raw string is what it wants.
      ShopDetail: { path: 'shop/:shopId' },
    },
  },
};
