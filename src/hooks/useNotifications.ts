import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  metadata: any;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
      setLoading(false);
    };

    fetchNotifications();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => {
            const updated = [newNotification, ...prev].slice(0, 20);
            setUnreadCount(updated.filter(n => !n.is_read).length);
            return updated;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markRead = async (id: string) => {
    if (!user) return;
    
    // Optimistic update
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n);
      setUnreadCount(updated.filter(n => !n.is_read).length);
      return updated;
    });

    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);
  };

  const markAllRead = async () => {
    if (!user) return;
    
    // Optimistic update
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }));
      setUnreadCount(0);
      return updated;
    });

    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_read', false);
  };

  return {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead
  };
}
