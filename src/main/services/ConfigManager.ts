import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export interface AppConfig {
  ddDriverDllPath: string | null;
  wegameExePath: string | null;
  flowConfig: Record<string, number> | null;
}

export class ConfigManager {
  private configPath: string;
  private currentConfig: AppConfig;

  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'settings.json');
    this.currentConfig = this.loadConfig();
  }

  private loadConfig(): AppConfig {
    if (!fs.existsSync(this.configPath)) {
      return { ddDriverDllPath: null, wegameExePath: null, flowConfig: null };
    }
    try {
      const raw = fs.readFileSync(this.configPath, 'utf-8');
      const parsed = JSON.parse(raw);
      // 做一层默认值垫底兼容旧设置文件
      return {
        ddDriverDllPath: parsed.ddDriverDllPath || null,
        wegameExePath: parsed.wegameExePath || null,
        flowConfig: parsed.flowConfig || null
      } as AppConfig;
    } catch (e) {
      console.error('Failed to load config, returning default.', e);
      return { ddDriverDllPath: null, wegameExePath: null, flowConfig: null };
    }
  }

  private saveConfig() {
    fs.writeFileSync(this.configPath, JSON.stringify(this.currentConfig, null, 2), 'utf-8');
  }

  public get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.currentConfig[key];
  }

  public set<K extends keyof AppConfig>(key: K, value: AppConfig[K]) {
    this.currentConfig[key] = value;
    this.saveConfig();
  }
}

export const configManager = new ConfigManager();
