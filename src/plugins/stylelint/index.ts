import { isInternal } from '../../util/path.js';
import { timerify } from '../../util/Performance.js';
import { hasDependency, load } from '../../util/plugin.js';
import type { PluginConfig } from './types.js';
import type { IsPluginEnabledCallback, GenericPluginCallback } from '../../types/plugins.js';

// https://stylelint.io/user-guide/configure/

export const NAME = 'Stylelint';

/** @public */
export const ENABLERS = ['stylelint'];

export const isEnabled: IsPluginEnabledCallback = ({ dependencies }) => hasDependency(dependencies, ENABLERS);

export const CONFIG_FILE_PATTERNS = [
  '.stylelintrc',
  '.stylelintrc.{cjs,js,json,yaml,yml}',
  'stylelint.config.{cjs,mjs,js}',
];

const findPluginDependencies: GenericPluginCallback = async (configFilePath, { manifest, isProduction }) => {
  if (isProduction) return [];

  const config: PluginConfig = configFilePath.endsWith('package.json')
    ? manifest.stylelint
    : await load(configFilePath);

  if (!config) return [];

  const extend = config.extends ? [config.extends].flat().filter(extend => !isInternal(extend)) : [];
  const plugins = config.plugins ? [config.plugins].flat().filter(plugin => !isInternal(plugin)) : [];

  return [...extend, ...plugins];
};

export const findDependencies = timerify(findPluginDependencies);
