/**
 * Plugin architecture types for modular extensibility.
 * Enables dynamic module loading, registration, and inter-plugin communication.
 * @see Requirements 13.1, 13.2, 13.6, 13.7
 */

import type { NavigationItem } from './config';
import type { Permission } from './rbac';

/** Route definition for plugin-registered routes */
export interface RouteDefinition {
  readonly path: string;
  readonly component: React.ComponentType;
  readonly layout?: 'default' | 'full' | 'minimal';
  readonly guards?: readonly string[];
  readonly preload?: boolean;
}

/** Settings panel contribution from a plugin */
export interface SettingsPanel {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
  readonly component: React.ComponentType;
  readonly order: number;
}

/** Dashboard widget contribution from a plugin */
export interface DashboardWidget {
  readonly id: string;
  readonly title: string;
  readonly component: React.ComponentType;
  readonly size: 'sm' | 'md' | 'lg' | 'xl';
  readonly roles: readonly string[];
  readonly order: number;
}

/**
 * Plugin lifecycle hooks.
 * Called at appropriate points during plugin registration and teardown.
 */
export interface PluginLifecycle {
  readonly onInit: () => Promise<void>;
  readonly onDestroy: () => Promise<void>;
  readonly onActivate: () => void;
  readonly onDeactivate: () => void;
}

/** Plugin status in the registry */
export type PluginStatus = 'registered' | 'active' | 'inactive' | 'error';

/**
 * Complete plugin definition.
 * Plugins register routes, navigation items, permissions, and optional contributions.
 */
export interface PluginDefinition {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly routes: readonly RouteDefinition[];
  readonly navigation: readonly NavigationItem[];
  readonly permissions: readonly Permission[];
  readonly settingsPanels?: readonly SettingsPanel[];
  readonly dashboardWidgets?: readonly DashboardWidget[];
  readonly lifecycle: PluginLifecycle;
  readonly dependencies?: readonly string[];
}

/** Event handler type for the plugin event bus */
export type EventHandler = (payload: unknown) => void;

/** Unsubscribe function returned by event listener registration */
export type Unsubscribe = () => void;

/**
 * Plugin registry managing all registered plugins.
 * Provides registration, lifecycle management, and event-based communication.
 */
export interface PluginRegistry {
  readonly register: (plugin: PluginDefinition) => void;
  readonly unregister: (pluginId: string) => void;
  readonly getPlugin: (pluginId: string) => PluginDefinition | undefined;
  readonly getAllPlugins: () => readonly PluginDefinition[];
  readonly getActivePlugins: () => readonly PluginDefinition[];
  readonly isRegistered: (pluginId: string) => boolean;
  readonly emit: (event: string, payload: unknown) => void;
  readonly on: (event: string, handler: EventHandler) => Unsubscribe;
}

/** Plugin load result for dynamic module loading */
export type PluginLoadResult =
  | { readonly status: 'loaded'; readonly plugin: PluginDefinition }
  | { readonly status: 'failed'; readonly error: string; readonly pluginId: string };
