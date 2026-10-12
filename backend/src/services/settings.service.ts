import { Settings, ISettings } from '../models/settings.model';

export class SettingsService {
  public static async getSettings(): Promise<ISettings> {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    return settings;
  }

  public static async updateSettings(data: Partial<ISettings>): Promise<ISettings> {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(data);
    } else {
      Object.assign(settings, data);
      await settings.save();
    }
    return settings;
  }
}