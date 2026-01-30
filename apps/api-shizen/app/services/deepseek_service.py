"""
DeepSeek API Service - Fallback LLM Provider
Shinkofa Platform - Shizen AI Agent

Provides fallback LLM capabilities when Ollama is unavailable
Using DeepSeek API (https://platform.deepseek.com)
"""
import httpx
import os
from typing import List, Dict, Optional
import logging
import traceback

logger = logging.getLogger(__name__)


class DeepSeekService:
    """Service to interact with DeepSeek API as fallback LLM"""

    def __init__(self):
        """Initialize DeepSeek service"""
        self.api_key = os.getenv("DEEPSEEK_API_KEY", "")
        self.base_url = os.getenv("DEEPSEEK_API_URL", "https://api.deepseek.com/v1")
        self.model = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")

        if not self.api_key:
            logger.warning("⚠️ DEEPSEEK_API_KEY not configured - fallback unavailable")

        # HTTP client with extended timeout for complex analysis (holistic synthesis can take 60-120s)
        self.client = httpx.AsyncClient(
            timeout=300.0,  # 5 minutes timeout for complex LLM operations
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }
        )

        logger.info(f"🌊 DeepSeek Service initialized: {self.base_url}")
        logger.info(f"   Model: {self.model}")

    async def chat(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> Dict:
        """
        Send chat messages to DeepSeek API

        Args:
            messages: List of message dicts with 'role' and 'content'
            temperature: Sampling temperature (0.0-1.0)
            max_tokens: Maximum tokens in response

        Returns:
            Response dict compatible with Ollama format

        Example:
            messages = [
                {"role": "system", "content": "Tu es un coach holistique..."},
                {"role": "user", "content": "Bonjour!"}
            ]
            response = await deepseek.chat(messages)
        """
        if not self.api_key:
            raise Exception("DeepSeek API key not configured")

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False,
        }

        try:
            logger.info(f"📤 Sending chat request to DeepSeek API (model: {self.model})")

            response = await self.client.post(
                f"{self.base_url}/chat/completions",
                json=payload,
            )
            response.raise_for_status()

            result = response.json()

            # Extract content from OpenAI-compatible format
            assistant_message = result["choices"][0]["message"]["content"]

            logger.info(f"✅ DeepSeek API response received ({result['usage']['total_tokens']} tokens)")

            # Return in Ollama-compatible format
            return {
                "message": {
                    "role": "assistant",
                    "content": assistant_message,
                },
                "model": self.model,
                "done": True,
                "usage": result.get("usage", {}),
            }

        except httpx.HTTPStatusError as e:
            error_msg = f"HTTP {e.response.status_code}: {e.response.text}"
            logger.error(f"❌ DeepSeek API HTTP error: {error_msg}")
            logger.error(f"   Traceback:\n{traceback.format_exc()}")
            raise Exception(f"DeepSeek API error: {error_msg}")

        except httpx.RequestError as e:
            error_msg = f"Request error: {type(e).__name__} - {str(e)}"
            logger.error(f"❌ DeepSeek API request error: {error_msg}")
            logger.error(f"   Traceback:\n{traceback.format_exc()}")
            raise Exception(f"DeepSeek API connection error: {error_msg}")

        except Exception as e:
            error_msg = f"Unexpected error: {type(e).__name__} - {str(e)}"
            logger.error(f"❌ DeepSeek API unexpected error: {error_msg}")
            logger.error(f"   Traceback:\n{traceback.format_exc()}")
            raise Exception(f"DeepSeek API error: {error_msg}")

    async def generate(
        self,
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> str:
        """
        Generate text from a single prompt (compatible with Ollama interface)

        Args:
            prompt: User prompt
            system: System prompt (optional)
            temperature: Sampling temperature
            max_tokens: Maximum tokens in response

        Returns:
            Generated text string
        """
        messages = []

        if system:
            messages.append({"role": "system", "content": system})

        messages.append({"role": "user", "content": prompt})

        try:
            result = await self.chat(
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            return result["message"]["content"]

        except Exception as e:
            error_msg = f"{type(e).__name__}: {str(e)}"
            logger.error(f"❌ DeepSeek generate error: {error_msg}")
            logger.error(f"   Traceback:\n{traceback.format_exc()}")
            raise Exception(f"DeepSeek generate failed: {error_msg}")

    async def is_available(self) -> bool:
        """
        Check if DeepSeek API is available

        Returns:
            True if API is reachable and configured
        """
        if not self.api_key:
            return False

        try:
            # Simple test request
            response = await self.client.get(
                f"{self.base_url}/models",
                timeout=5.0,
            )
            response.raise_for_status()
            return True

        except Exception as e:
            logger.warning(f"⚠️ DeepSeek API unavailable: {e}")
            return False

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()


# Singleton instance
_deepseek_service: Optional[DeepSeekService] = None


def get_deepseek_service() -> DeepSeekService:
    """Get or create DeepSeek service singleton"""
    global _deepseek_service
    if _deepseek_service is None:
        _deepseek_service = DeepSeekService()
    return _deepseek_service
