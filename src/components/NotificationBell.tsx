import { Bell } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useDesignMode } from '@/hooks/useDesignMode';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

export const NotificationBell = () => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const { isNeoBrutalism } = useDesignMode();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    markRead(notification.id);
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  if (isNeoBrutalism) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative rounded-full border-2 border-foreground h-9 w-9">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full border-2 border-foreground shadow-[1px_1px_0px_0px_hsl(var(--foreground))]"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-80 border-3 border-foreground rounded-none shadow-[4px_4px_0px_0px_hsl(var(--foreground))] p-0"
        >
          <div className="flex items-center justify-between p-3 border-b-2 border-foreground bg-muted/30">
            <h3 className="font-bold text-sm uppercase tracking-wide">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={(e) => { e.preventDefault(); markAllRead(); }}
                className="text-xs h-7 rounded-none border border-foreground hover:bg-muted font-bold"
              >
                Mark all read
              </Button>
            )}
          </div>
          <ScrollArea className="h-[300px]">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground font-medium">
                No notifications
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex flex-col p-3 border-b border-foreground/20 cursor-pointer hover:bg-muted/50 transition-colors ${
                      !notification.is_read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className={`text-sm ${!notification.is_read ? 'font-bold' : 'font-medium'}`}>
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    {notification.body && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {notification.body}
                      </p>
                    )}
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full h-8 w-8 text-foreground/80 hover:text-foreground">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[9px] rounded-full bg-destructive text-destructive-foreground border-none"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 z-50 rounded-xl border border-border/50 shadow-lg bg-background/95 backdrop-blur-xl p-0 overflow-hidden"
      >
        <div className="flex items-center justify-between p-3 border-b border-border/50 bg-muted/20">
          <h3 className="font-medium text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => { e.preventDefault(); markAllRead(); }}
              className="text-xs h-7 text-muted-foreground hover:text-foreground"
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              You're all caught up!
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex flex-col p-3 border-b border-border/30 cursor-pointer hover:bg-muted/50 transition-colors last:border-b-0 ${
                    !notification.is_read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className={`text-sm ${!notification.is_read ? 'font-medium text-foreground' : 'text-foreground/80'}`}>
                      {notification.title}
                    </h4>
                    {!notification.is_read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  {notification.body && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">
                      {notification.body}
                    </p>
                  )}
                  <span className="text-[10px] text-muted-foreground/70">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
