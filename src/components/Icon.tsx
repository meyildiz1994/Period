import { SvgXml } from 'react-native-svg';

import { color as colors, type ColorToken } from '../theme/tokens';
import { ICONS, type IconName } from '../theme/icons';

type Props = {
  name: IconName;
  /** Always a token. Inside buttons pass the label colour; on dark surfaces use text/on-brand. */
  color?: ColorToken;
  size?: number;
};

export function Icon({ name, color = 'text/primary', size = 24 }: Props) {
  const filled = name.endsWith('-fill');
  const attrs = filled
    ? 'fill="currentColor" stroke="none"'
    : 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ${attrs}>${ICONS[name]}</svg>`;
  return <SvgXml xml={xml} width={size} height={size} color={colors[color]} />;
}
