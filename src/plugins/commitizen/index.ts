import { timerify } from '../../util/Performance.js';
import { hasDependency, load } from '../../util/plugin.js';
import type { PluginConfig } from './types.js';
import type { IsPluginEnabledCallback, GenericPluginCallback } from '../../types/plugins.js';

// https://github.com/commitizen/cz-cli

export const NAME = 'Commitizen';

/** @public */
export const ENABLERS = ['commitizen'];

export const PACKAGE_JSON_PATH = 'config.commitizen';

export const isEnabled: IsPluginEnabledCallback = ({ dependencies }) => hasDependency(dependencies, ENABLERS);

export const CONFIG_FILE_PATTERNS = ['.czrc', '.cz.json', 'package.json'];

const findPluginDependencies: GenericPluginCallback = async (configFilePath, { manifest, isProduction }) => {
  if (isProduction) return [];
  const config: PluginConfig = configFilePath.endsWith('package.json')
    ? manifest.config?.commitizen
    : await load(configFilePath);
  const path = config?.path;
  return path === undefined ? [] : [path];
};

export const findDependencies = timerify(findPluginDependencies);
