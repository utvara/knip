import { _getDependenciesFromScripts } from '../../binaries/index.js';
import { timerify } from '../../util/Performance.js';
import { hasDependency, load } from '../../util/plugin.js';
import type { LintStagedConfig } from './types.js';
import type { IsPluginEnabledCallback, GenericPluginCallback } from '../../types/plugins.js';

// https://github.com/okonet/lint-staged

export const NAME = 'lint-staged';

/** @public */
export const ENABLERS = ['lint-staged'];

export const PACKAGE_JSON_PATH = 'lint-staged';

export const isEnabled: IsPluginEnabledCallback = ({ dependencies }) => hasDependency(dependencies, ENABLERS);

export const CONFIG_FILE_PATTERNS = [
  '.lintstagedrc',
  '.lintstagedrc.json',
  '.lintstagedrc.{yml,yaml}',
  '.lintstagedrc.{js,mjs,cjs}',
  'lint-staged.config.{js,mjs,cjs}',
  'package.json',
];

const findLintStagedDependencies: GenericPluginCallback = async (configFilePath, { cwd, manifest, isProduction }) => {
  if (isProduction) return [];

  let config: LintStagedConfig = configFilePath.endsWith('package.json')
    ? manifest['lint-staged']
    : await load(configFilePath);

  if (!config) return [];

  if (typeof config === 'function') {
    config = config();
  }

  const dependencies: Set<string> = new Set();

  for (const entry of Object.values(config).flat()) {
    const scripts = [typeof entry === 'function' ? await entry([]) : entry].flat();
    const options = { cwd, manifest };
    _getDependenciesFromScripts(scripts, options).forEach(identifier => dependencies.add(identifier));
  }

  return Array.from(dependencies);
};

export const findDependencies = timerify(findLintStagedDependencies);
