import { compact } from '../../util/array.js';
import { timerify } from '../../util/Performance.js';
import { hasDependency, load } from '../../util/plugin.js';
import { getEnvPackageName, getExternalReporters } from './helpers.js';
import type { VitestConfig, VitestWorkspaceConfig } from './types.js';
import type { IsPluginEnabledCallback, GenericPluginCallback } from '../../types/plugins.js';

// https://vitest.dev/config/

export const NAME = 'Vitest';

/** @public */
export const ENABLERS = ['vitest'];

export const isEnabled: IsPluginEnabledCallback = ({ dependencies }) => hasDependency(dependencies, ENABLERS);

export const CONFIG_FILE_PATTERNS = ['vitest.config.ts', 'vitest.{workspace,projects}.{ts,js,json}'];

// `TEST_FILE_PATTERNS` in src/constants.ts are already included by default
export const ENTRY_FILE_PATTERNS = [];

export const findVitestDeps = (config: VitestConfig) => {
  if (!config || !config.test) return [];
  const cfg = config.test;
  const environments = cfg.environment ? [getEnvPackageName(cfg.environment)] : [];
  const reporters = getExternalReporters(cfg.reporters);
  const coverage = cfg.coverage ? [`@vitest/coverage-${cfg.coverage.provider ?? 'v8'}`] : [];
  const setupFiles = cfg.setupFiles ? [cfg.setupFiles].flat() : [];
  const globalSetup = cfg.globalSetup ? [cfg.globalSetup].flat() : [];
  return compact([...environments, ...reporters, ...coverage, ...setupFiles, ...globalSetup]);
};

const findVitestWorkspaceDeps = (config: VitestWorkspaceConfig) => {
  let deps: string[] = [];
  for (const cfg of config) {
    if (typeof cfg === 'string') continue;
    deps = [...deps, ...findVitestDeps(cfg)];
  }
  return compact(deps);
};

const findVitestDependencies: GenericPluginCallback = async configFilePath => {
  const config: VitestConfig | VitestWorkspaceConfig = await load(configFilePath);
  if (Array.isArray(config)) {
    return findVitestWorkspaceDeps(config);
  }
  return findVitestDeps(config);
};

export const findDependencies = timerify(findVitestDependencies);
