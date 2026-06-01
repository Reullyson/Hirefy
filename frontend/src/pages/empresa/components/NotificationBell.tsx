import React, { useState } from "react";
import { Bell, CheckCircle2, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Notification {
  id: number;
  title: string;
  message: string;
  time: Date;
  type: "info" | "success" | "warning";
  read: boolean;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "Nova Candidatura",
      message: "João Aluno de Teste se candidatou para a vaga 'Desenvolvedor Full Stack'.",
      time: new Date(),
      type: "success",
      read: false,
    },
    {
      id: 2,
      title: "Vaga expirando",
      message: "A vaga 'Estágio QA' expira em 2 dias.",
      time: new Date(Date.now() - 3600000 * 5),
      type: "info",
      read: true,
    }
  ]);

  const actualUnreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/10">
          <Bell className="w-5 h-5" />
          {actualUnreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
              {actualUnreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-border flex justify-between items-center bg-primary/5">
          <h3 className="font-bold text-sm">Notificações</h3>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
            {actualUnreadCount} novas
          </span>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer relative ${!n.read ? 'bg-primary/5' : ''}`}
                onClick={() => markAsRead(n.id)}
              >
                {!n.read && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />}
                <div className="flex gap-3">
                  <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    n.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {n.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                      {formatDistanceToNow(n.time, { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Nenhuma notificação por enquanto.</p>
            </div>
          )}
        </div>
        <div className="p-3 text-center border-t border-border">
          <button className="text-xs text-primary font-bold hover:underline">
            Ver todas as notificações
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
