import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

interface AIApiKey {
  id: string;
  name: string;
  provider: string;
  key: string;
  is_active: boolean;
  is_primary: boolean;
  is_fallback: boolean;
  usage_count: number;
}

export class AIKeyManager {
  private supabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabaseClient = createClient(supabaseUrl, supabaseKey);
  }

  async getActiveKey(provider: string): Promise<string | null> {
    try {
      // First try to get the primary key for this provider
      const { data: primaryKey, error: primaryError } = await this.supabaseClient
        .from('ai_api_keys')
        .select('*')
        .eq('provider', provider)
        .eq('is_active', true)
        .eq('is_primary', true)
        .maybeSingle();

      if (primaryKey && !primaryError) {
        await this.trackUsage(primaryKey.id);
        return primaryKey.key;
      }

      // If no primary key, try fallback
      const { data: fallbackKey, error: fallbackError } = await this.supabaseClient
        .from('ai_api_keys')
        .select('*')
        .eq('provider', provider)
        .eq('is_active', true)
        .eq('is_fallback', true)
        .maybeSingle();

      if (fallbackKey && !fallbackError) {
        await this.trackUsage(fallbackKey.id);
        console.log(`[AI Key Manager] Using fallback key for ${provider}`);
        return fallbackKey.key;
      }

      // If still no key, try any active key for this provider
      const { data: anyKey, error: anyError } = await this.supabaseClient
        .from('ai_api_keys')
        .select('*')
        .eq('provider', provider)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (anyKey && !anyError) {
        await this.trackUsage(anyKey.id);
        console.log(`[AI Key Manager] Using any available key for ${provider}`);
        return anyKey.key;
      }

      console.error(`[AI Key Manager] No active key found for provider: ${provider}`);
      return null;
    } catch (error) {
      console.error('[AI Key Manager] Error getting active key:', error);
      return null;
    }
  }

  private async trackUsage(keyId: string): Promise<void> {
    try {
      await this.supabaseClient
        .from('ai_api_keys')
        .update({ 
          usage_count: await this.getUsageCount(keyId) + 1,
          last_used: new Date().toISOString()
        })
        .eq('id', keyId);
    } catch (error) {
      console.error('[AI Key Manager] Error tracking usage:', error);
    }
  }

  private async getUsageCount(keyId: string): Promise<number> {
    try {
      const { data } = await this.supabaseClient
        .from('ai_api_keys')
        .select('usage_count')
        .eq('id', keyId)
        .single();
      return data?.usage_count || 0;
    } catch {
      return 0;
    }
  }

  async getFallbackKey(provider: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from('ai_api_keys')
        .select('*')
        .eq('provider', provider)
        .eq('is_active', true)
        .eq('is_fallback', true)
        .maybeSingle();

      if (data && !error) {
        await this.trackUsage(data.id);
        return data.key;
      }

      return null;
    } catch (error) {
      console.error('[AI Key Manager] Error getting fallback key:', error);
      return null;
    }
  }
}
