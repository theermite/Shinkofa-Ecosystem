"""
Hybrid LLM Service - Primary/Fallback Provider
Shinkofa Platform - Shizen AI Agent

Provides intelligent fallback between DeepSeek API (primary) and Ollama (fallback)
Maximizes reliability while optimizing costs
"""
import os
import logging
import traceback
from typing import Optional

from app.services.deepseek_service import get_deepseek_service
from app.services.ollama_service import get_ollama_service

logger = logging.getLogger(__name__)


class HybridLLMService:
    """
    Hybrid LLM service with automatic fallback

    Architecture:
    1. PRIMARY: DeepSeek API (reliable, fast, always-on)
       └─> If error (budget, API down, timeout)
    2. FALLBACK: Ollama via Tailscale (free, dependent on Ermite-Game)
       └─> If error (machine off, network issue)
    3. RAISE: Exception with clear error message
    """

    def __init__(self):
        """Initialize Hybrid LLM service"""
        self.primary_provider = os.getenv("PRIMARY_LLM_PROVIDER", "deepseek")  # deepseek or ollama

        self.deepseek = get_deepseek_service()
        self.ollama = get_ollama_service()

        logger.info(f"🔀 Hybrid LLM Service initialized")
        logger.info(f"   Primary: {self.primary_provider.upper()}")
        logger.info(f"   Fallback: {'Ollama' if self.primary_provider == 'deepseek' else 'DeepSeek'}")

    async def generate(
        self,
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> str:
        """
        Generate text with automatic fallback

        Args:
            prompt: User prompt
            system: System prompt (optional)
            temperature: Sampling temperature
            max_tokens: Maximum tokens (DeepSeek only)

        Returns:
            Generated text string

        Raises:
            Exception if all providers fail
        """
        # Determine primary and fallback based on config
        if self.primary_provider == "deepseek":
            primary_service = self.deepseek
            primary_name = "DeepSeek API"
            fallback_service = self.ollama
            fallback_name = "Ollama (Ermite-Game)"
        else:
            primary_service = self.ollama
            primary_name = "Ollama (Ermite-Game)"
            fallback_service = self.deepseek
            fallback_name = "DeepSeek API"

        # Try PRIMARY provider
        try:
            logger.info(f"🎯 Attempting {primary_name} (PRIMARY)...")

            if primary_service == self.deepseek:
                result = await primary_service.generate(
                    prompt=prompt,
                    system=system,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
            else:
                result = await primary_service.generate(
                    prompt=prompt,
                    system=system,
                    temperature=temperature,
                )

            logger.info(f"✅ {primary_name} succeeded")
            return result

        except Exception as primary_error:
            primary_error_msg = f"{type(primary_error).__name__}: {str(primary_error)}"
            logger.warning(f"⚠️ {primary_name} failed: {primary_error_msg}")
            logger.warning(f"   Traceback:\n{traceback.format_exc()}")
            logger.info(f"🔄 Falling back to {fallback_name}...")

            # Try FALLBACK provider
            try:
                if fallback_service == self.deepseek:
                    result = await fallback_service.generate(
                        prompt=prompt,
                        system=system,
                        temperature=temperature,
                        max_tokens=max_tokens,
                    )
                else:
                    result = await fallback_service.generate(
                        prompt=prompt,
                        system=system,
                        temperature=temperature,
                    )

                logger.info(f"✅ {fallback_name} succeeded (FALLBACK)")
                return result

            except Exception as fallback_error:
                fallback_error_msg = f"{type(fallback_error).__name__}: {str(fallback_error)}"
                logger.error(f"❌ {fallback_name} also failed: {fallback_error_msg}")
                logger.error(f"   Traceback:\n{traceback.format_exc()}")
                logger.error(f"❌ ALL LLM providers failed")

                # Raise with combined error message
                raise Exception(
                    f"All LLM providers failed. "
                    f"{primary_name}: {primary_error_msg}. "
                    f"{fallback_name}: {fallback_error_msg}."
                )

    async def is_available(self) -> bool:
        """
        Check if at least one provider is available

        Returns:
            True if any provider is reachable
        """
        deepseek_ok = await self.deepseek.is_available()

        # Ollama check (simple - no dedicated is_available method)
        ollama_ok = False
        try:
            await self.ollama.list_models()
            ollama_ok = True
        except:
            pass

        logger.info(f"📊 Provider availability: DeepSeek={deepseek_ok}, Ollama={ollama_ok}")

        return deepseek_ok or ollama_ok


# Singleton instance
_hybrid_llm_service: Optional[HybridLLMService] = None


def get_hybrid_llm_service() -> HybridLLMService:
    """Get or create Hybrid LLM service singleton"""
    global _hybrid_llm_service
    if _hybrid_llm_service is None:
        _hybrid_llm_service = HybridLLMService()
    return _hybrid_llm_service
