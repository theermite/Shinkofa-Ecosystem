"""
LLM Service - Unified LLM Interface with Fallback
Shinkofa Platform - Shizen AI Agent

Orchestrates LLM providers with automatic fallback:
1. Primary: Ollama (Ermite-Game via Tailscale) - GPU-powered, free
2. Fallback: DeepSeek API - Cloud-based, reliable

Architecture:
- Ollama timeout: 10 seconds
- Automatic failover to DeepSeek on Ollama failure
- Transparent for consumers (unified interface)
- Monitoring & logging of provider used
"""
import os
import logging
from typing import List, Dict, Optional
from enum import Enum

from app.services.ollama_service import OllamaService, get_ollama_service
from app.services.deepseek_service import DeepSeekService, get_deepseek_service

logger = logging.getLogger(__name__)


class LLMProvider(str, Enum):
    """LLM Provider types"""
    OLLAMA = "ollama"
    DEEPSEEK = "deepseek"


class LLMService:
    """
    Unified LLM service with automatic fallback

    Features:
    - Tries Ollama first (local GPU via Tailscale)
    - Falls back to DeepSeek API on failure
    - Unified interface for consumers
    - Detailed logging of provider switches
    """

    def __init__(self):
        """Initialize LLM service with fallback chain"""
        self.ollama = get_ollama_service()
        self.deepseek = get_deepseek_service()

        # Configuration
        self.ollama_timeout = float(os.getenv("OLLAMA_TIMEOUT", "10.0"))
        self.enable_fallback = os.getenv("ENABLE_DEEPSEEK_FALLBACK", "true").lower() == "true"

        # Stats (for monitoring)
        self.stats = {
            "ollama_success": 0,
            "ollama_failure": 0,
            "deepseek_used": 0,
        }

        logger.info("🧠 LLM Service initialized with fallback chain")
        logger.info(f"   Primary: Ollama ({self.ollama.base_url})")
        logger.info(f"   Fallback: DeepSeek API ({'enabled' if self.enable_fallback else 'disabled'})")
        logger.info(f"   Ollama timeout: {self.ollama_timeout}s")

    async def chat(
        self,
        messages: List[Dict[str, str]],
        system: Optional[str] = None,
        temperature: float = 0.7,
        force_provider: Optional[LLMProvider] = None,
    ) -> Dict:
        """
        Send chat request with automatic fallback

        Args:
            messages: List of message dicts with 'role' and 'content'
            system: System prompt (optional)
            temperature: Sampling temperature (0.0-1.0)
            force_provider: Force specific provider (skip fallback logic)

        Returns:
            Response dict with 'message', 'model', 'provider' keys

        Example:
            messages = [{"role": "user", "content": "Bonjour!"}]
            response = await llm.chat(messages, system="Tu es un coach...")
            print(response["message"]["content"])
            print(f"Provider used: {response['provider']}")
        """
        # If provider forced, use it directly
        if force_provider == LLMProvider.OLLAMA:
            return await self._chat_ollama(messages, system, temperature)
        elif force_provider == LLMProvider.DEEPSEEK:
            return await self._chat_deepseek(messages, system, temperature)

        # Otherwise, try Ollama first with fallback
        try:
            logger.info("🔄 Attempting Ollama (primary)...")
            response = await self._chat_ollama(messages, system, temperature)
            self.stats["ollama_success"] += 1
            logger.info("✅ Ollama success")
            return response

        except Exception as ollama_error:
            logger.warning(f"⚠️ Ollama failed: {ollama_error}")
            self.stats["ollama_failure"] += 1

            # Fallback to DeepSeek
            if not self.enable_fallback:
                logger.error("❌ Fallback disabled - no DeepSeek fallback")
                raise Exception(f"Ollama failed and fallback disabled: {ollama_error}")

            try:
                logger.info("🔄 Falling back to DeepSeek API...")
                response = await self._chat_deepseek(messages, system, temperature)
                self.stats["deepseek_used"] += 1
                logger.info("✅ DeepSeek fallback success")
                return response

            except Exception as deepseek_error:
                logger.error(f"❌ DeepSeek fallback also failed: {deepseek_error}")
                raise Exception(
                    f"Both LLM providers failed. "
                    f"Ollama: {ollama_error}. DeepSeek: {deepseek_error}"
                )

    async def _chat_ollama(
        self,
        messages: List[Dict[str, str]],
        system: Optional[str],
        temperature: float,
    ) -> Dict:
        """
        Send chat request to Ollama

        Returns response with 'provider' key added
        """
        # Inject system prompt as first message if provided
        formatted_messages = messages.copy()
        if system:
            formatted_messages.insert(0, {"role": "system", "content": system})

        # Call Ollama with timeout
        response = await self.ollama.chat(
            messages=formatted_messages,
            temperature=temperature,
            stream=False,
        )

        # Add provider metadata
        response["provider"] = LLMProvider.OLLAMA
        return response

    async def _chat_deepseek(
        self,
        messages: List[Dict[str, str]],
        system: Optional[str],
        temperature: float,
    ) -> Dict:
        """
        Send chat request to DeepSeek API

        Returns response with 'provider' key added
        """
        # Inject system prompt as first message if provided
        formatted_messages = messages.copy()
        if system:
            formatted_messages.insert(0, {"role": "system", "content": system})

        # Call DeepSeek API
        response = await self.deepseek.chat(
            messages=formatted_messages,
            temperature=temperature,
        )

        # Add provider metadata
        response["provider"] = LLMProvider.DEEPSEEK
        return response

    async def health_check(self) -> Dict:
        """
        Check health of all LLM providers

        Returns:
            Status dict with provider availability
        """
        ollama_available = False
        deepseek_available = False

        # Check Ollama
        try:
            models = await self.ollama.list_models()
            ollama_available = len(models) > 0
        except Exception as e:
            logger.warning(f"⚠️ Ollama health check failed: {e}")

        # Check DeepSeek
        try:
            deepseek_available = await self.deepseek.is_available()
        except Exception as e:
            logger.warning(f"⚠️ DeepSeek health check failed: {e}")

        return {
            "ollama": {
                "available": ollama_available,
                "url": self.ollama.base_url,
                "model": self.ollama.general_model,
            },
            "deepseek": {
                "available": deepseek_available,
                "model": self.deepseek.model,
            },
            "fallback_enabled": self.enable_fallback,
            "stats": self.stats,
        }

    def get_stats(self) -> Dict:
        """Get usage statistics"""
        total_requests = (
            self.stats["ollama_success"] +
            self.stats["ollama_failure"]
        )

        return {
            **self.stats,
            "total_requests": total_requests,
            "ollama_success_rate": (
                self.stats["ollama_success"] / total_requests * 100
                if total_requests > 0 else 0
            ),
        }

    async def close(self):
        """Close all HTTP clients"""
        await self.ollama.close()
        await self.deepseek.close()


# Singleton instance
_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    """Get or create LLM service singleton"""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
