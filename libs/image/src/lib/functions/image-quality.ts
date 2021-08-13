import { ImageQualityNetwork, NavigatorConnection } from '@ng-easy/image-config';

export function getQuality(configQuality: number | ImageQualityNetwork): number {
  if (typeof configQuality === 'number') {
    return configQuality;
  }

  if (!('connection' in window.navigator)) {
    return configQuality.default;
  }

  const connection: NavigatorConnection = (window.navigator as any).connection;

  if (connection.saveData) {
    return configQuality.saveData;
  }

  switch (connection.effectiveType) {
    case 'slow-2g':
      return configQuality['slow-2g'];
    case '2g':
      return configQuality['2g'];
    case '3g':
      return configQuality['3g'];
    case '4g':
      return configQuality['4g'];
  }
}
