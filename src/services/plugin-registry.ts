/**
 * Plugin Registry Service.
 * Manages plugin registration, lifecycle hooks, and inter-plugin communication.
 * @see Requirements 13.1, 13.2, 13.6, 13.7
 */

import type {
  PluginDefinition,
  PluginRegistry,
  PluginStatus,
  PluginLoadResult,
  EventHandler,
  Unsubscribe,
} from '@/types/plugin';

/** Internal plugin entry with status tracking */
interface PluginEntry {
  readonly plugin: PluginDefinition;
  status: PluginStatus;
}

/**
 * Creates the plugin registry singleton.
 * Provides registration, lifecycle management, event bus, and dynamic loading.
 */
function createPluginRegistry(): PluginRegistry & {
  readonly activate: (pluginId: string) => Promise<void>;
  readonly deactivate: (pluginId: string) => Promise<void>;
  readonly getStatus: (pluginId: string) => PluginStatus | undefined;
  readonly getActivePlugins: () => readonly PluginDefinition[];
  readonly isRegistered: (pluginId: string) => boolean;
  readonly loadPlugin: (loader: () => Promise<PluginDefinition>) => Promise<PluginLoadResult>;
} {
  const plugins = new Map<string, PluginEntry>();
  const eventHandlers = new Map<string, Set<EventHandler>>();

  /**
   * Register a plugin. Calls onInit lifecycle hook.
   */
  const register = (plugin: PluginDefinition): void => {
    if (plugins.has(plugin.id)) {
      throw new Error(`Plugin "${plugin.id}" is already registered.`);
    }

    // Check dependencies
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!plugins.has(dep)) {
          throw new Error(
            `Plugin "${plugin.id}" depends on "${dep}" which is not registered.`
          );
        }
      }
    }

    plugins.set(plugin.id, { plugin, status: 'registered' });

    // Fire onInit lifecycle hook asynchronously
    void plugin.lifecycle.onInit().then(() => {
      const entry = plugins.get(plugin.id);
      if (entry) {
        entry.status = 'active';
        plugin.lifecycle.onActivate();
        emit('plugin:registered', { pluginId: plugin.id });
      }
    }).catch(() => {
      const entry = plugins.get(plugin.id);
      if (entry) {
        entry.status = 'error';
      }
    });
  };

  /**
   * Unregister a plugin. Calls onDeactivate and onDestroy lifecycle hooks.
   */
  const unregister = (pluginId: string): void => {
    const entry = plugins.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin "${pluginId}" is not registered.`);
    }

    // Prevent unregistering if other plugins depend on it
    for (const [id, other] of plugins) {
      if (id !== pluginId && other.plugin.dependencies?.includes(pluginId)) {
        throw new Error(
          `Cannot unregister "${pluginId}": plugin "${id}" depends on it.`
        );
      }
    }

    if (entry.status === 'active') {
      entry.plugin.lifecycle.onDeactivate();
    }

    void entry.plugin.lifecycle.onDestroy().finally(() => {
      plugins.delete(pluginId);
      emit('plugin:unregistered', { pluginId });
    });
  };

  /**
   * Get a plugin definition by ID.
   */
  const getPlugin = (pluginId: string): PluginDefinition | undefined => {
    return plugins.get(pluginId)?.plugin;
  };

  /**
   * Get all registered plugins.
   */
  const getAllPlugins = (): readonly PluginDefinition[] => {
    return Array.from(plugins.values()).map((entry) => entry.plugin);
  };

  /**
   * Get all active plugins.
   */
  const getActivePlugins = (): readonly PluginDefinition[] => {
    return Array.from(plugins.values())
      .filter((entry) => entry.status === 'active')
      .map((entry) => entry.plugin);
  };

  /**
   * Check if a plugin is registered.
   */
  const isRegistered = (pluginId: string): boolean => {
    return plugins.has(pluginId);
  };

  /**
   * Get plugin status.
   */
  const getStatus = (pluginId: string): PluginStatus | undefined => {
    return plugins.get(pluginId)?.status;
  };

  /**
   * Activate a registered plugin.
   */
  const activate = async (pluginId: string): Promise<void> => {
    const entry = plugins.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin "${pluginId}" is not registered.`);
    }
    if (entry.status === 'active') return;

    await entry.plugin.lifecycle.onInit();
    entry.status = 'active';
    entry.plugin.lifecycle.onActivate();
    emit('plugin:activated', { pluginId });
  };

  /**
   * Deactivate a plugin without destroying it.
   */
  const deactivate = async (pluginId: string): Promise<void> => {
    const entry = plugins.get(pluginId);
    if (!entry) {
      throw new Error(`Plugin "${pluginId}" is not registered.`);
    }
    if (entry.status !== 'active') return;

    entry.plugin.lifecycle.onDeactivate();
    entry.status = 'inactive';
    emit('plugin:deactivated', { pluginId });
  };

  // --- Event Bus ---

  /**
   * Emit an event to all subscribed handlers.
   */
  const emit = (event: string, payload: unknown): void => {
    const handlers = eventHandlers.get(event);
    if (!handlers) return;
    for (const handler of handlers) {
      try {
        handler(payload);
      } catch {
        // Silently catch handler errors to prevent cascade failures
      }
    }
  };

  /**
   * Subscribe to an event. Returns an unsubscribe function.
   */
  const on = (event: string, handler: EventHandler): Unsubscribe => {
    if (!eventHandlers.has(event)) {
      eventHandlers.set(event, new Set());
    }
    eventHandlers.get(event)!.add(handler);

    return () => {
      const handlers = eventHandlers.get(event);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          eventHandlers.delete(event);
        }
      }
    };
  };

  // --- Dynamic Module Loading ---

  /**
   * Dynamically load a plugin from an async loader function.
   */
  const loadPlugin = async (
    loader: () => Promise<PluginDefinition>
  ): Promise<PluginLoadResult> => {
    try {
      const plugin = await loader();
      register(plugin);
      return { status: 'loaded', plugin };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { status: 'failed', error: message, pluginId: 'unknown' };
    }
  };

  return {
    register,
    unregister,
    getPlugin,
    getAllPlugins,
    getActivePlugins,
    isRegistered,
    getStatus,
    activate,
    deactivate,
    emit,
    on,
    loadPlugin,
  };
}

/** Singleton plugin registry instance */
export const pluginRegistry = createPluginRegistry();
