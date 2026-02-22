import requests
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


class TelegramService:
    """Service para enviar mensagens via Telegram Bot API"""

    @staticmethod
    def send_message(token: str, chat_id: str, text: str, parse_mode: str = "HTML") -> Dict[str, Any]:
        """
        Envia mensagem via Telegram Bot API
        
        Args:
            token: Bot token do Telegram
            chat_id: ID do chat/usuário
            text: Texto da mensagem
            parse_mode: Modo de formatação (HTML ou Markdown)
            
        Returns:
            Dict com resultado da operação
        """
        try:
            url = f"https://api.telegram.org/bot{token}/sendMessage"
            
            payload = {
                "chat_id": chat_id,
                "text": text,
                "parse_mode": parse_mode
            }
            
            response = requests.post(url, json=payload, timeout=10)
            
            if response.status_code == 200:
                logger.info(f"Mensagem enviada com sucesso para chat_id: {chat_id}")
                return {
                    "success": True,
                    "message": "Mensagem enviada com sucesso!",
                    "data": response.json()
                }
            else:
                error_msg = response.json().get("description", "Erro desconhecido")
                logger.error(f"Erro ao enviar mensagem: {error_msg}")
                return {
                    "success": False,
                    "message": f"Erro ao enviar mensagem: {error_msg}"
                }
                
        except requests.exceptions.Timeout:
            logger.error("Timeout ao enviar mensagem para Telegram")
            return {
                "success": False,
                "message": "Timeout: Telegram não respondeu a tempo"
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"Erro de conexão com Telegram: {str(e)}")
            return {
                "success": False,
                "message": f"Erro de conexão: {str(e)}"
            }
        except Exception as e:
            logger.error(f"Erro inesperado ao enviar mensagem: {str(e)}")
            return {
                "success": False,
                "message": f"Erro inesperado: {str(e)}"
            }

    @staticmethod
    def format_signal_message(signal: Dict[str, Any]) -> str:
        """
        Formata uma mensagem de sinal para envio ao Telegram
        
        Args:
            signal: Dicionário com dados do sinal
            
        Returns:
            String formatada em HTML
        """
        probability_emoji = "🔥" if signal["probability"] >= 80 else "⚡"
        
        message = f"""
{probability_emoji} <b>SINAL DE ALTA PROBABILIDADE</b> {probability_emoji}

⚽ <b>Jogo:</b> {signal['homeTeam']} vs {signal['awayTeam']}
🏆 <b>Liga:</b> {signal['league']}
📊 <b>Probabilidade:</b> {signal['probability']}%
🎲 <b>Previsão:</b> {signal['prediction']}

✅ <b>Análise:</b>
{signal['reason']}

⏰ Gerado em {signal['timestamp']}
        """.strip()
        
        return message

    @staticmethod
    def test_connection(token: str, chat_id: str) -> Dict[str, Any]:
        """
        Testa a conexão com o Telegram enviando mensagem de teste
        
        Args:
            token: Bot token do Telegram
            chat_id: ID do chat/usuário
            
        Returns:
            Dict com resultado do teste
        """
        test_message = "✅ <b>Configuração realizada com sucesso!</b>\n\nSeu bot está pronto para receber sinais de alta probabilidade."
        return TelegramService.send_message(token, chat_id, test_message)
