import React, { useState } from 'react';
import { Search, Bell, Settings, Star } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { useToast } from '../hooks/use-toast';

const Header = () => {
  const [telegramToken, setTelegramToken] = useState('');
  const [chatId, setChatId] = useState('');
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleSaveConfig = () => {
    if (!telegramToken || !chatId) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos',
        variant: 'destructive',
      });
      return;
    }

    // Salvar no localStorage por enquanto (mock)
    localStorage.setItem('telegram_token', telegramToken);
    localStorage.setItem('telegram_chat_id', chatId);

    toast({
      title: 'Configuração salva!',
      description: 'Telegram Bot configurado com sucesso',
    });
    setIsOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-[#0a2f35] to-[#0d3d45] border-b border-[#1a4f57] sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-white rounded-lg p-2">
              <span className="text-[#0a2f35] font-bold text-xl">SP</span>
            </div>
            <span className="text-white font-bold text-xl hidden sm:block">SokkerPRO</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Pesquisar jogos, competições, times..."
                className="pl-10 bg-[#0d3d45] border-[#1a4f57] text-white placeholder:text-gray-400 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white hover:bg-[#1a4f57]"
            >
              <Bell className="w-5 h-5" />
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-300 hover:text-white hover:bg-[#1a4f57]"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0a2f35] border-[#1a4f57] text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Configurar Telegram Bot</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Configure seu bot para receber sinais de alta probabilidade
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="token" className="text-white">Token do Bot</Label>
                    <Input
                      id="token"
                      placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                      value={telegramToken}
                      onChange={(e) => setTelegramToken(e.target.value)}
                      className="bg-[#0d3d45] border-[#1a4f57] text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chatId" className="text-white">Chat ID</Label>
                    <Input
                      id="chatId"
                      placeholder="123456789"
                      value={chatId}
                      onChange={(e) => setChatId(e.target.value)}
                      className="bg-[#0d3d45] border-[#1a4f57] text-white placeholder:text-gray-500"
                    />
                  </div>
                  <Button
                    onClick={handleSaveConfig}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Salvar Configuração
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;