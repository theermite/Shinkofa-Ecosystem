"""
Ollama Service - Interface with local Ollama instance
Shinkofa Platform - Shizen AI Agent

Connects to Ollama running on Dell-Ermite (or localhost for dev)
Models: qwen2.5:14b-instruct-q4_K_M (general), qwen2.5-coder:14b (code)
"""
import httpx
import os
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)


class OllamaService:
    """Service to interact with Ollama API"""

    def __init__(self):
        # Ollama API URL from environment (default to localhost)
        self.base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

        # Model selection
        self.general_model = os.getenv("OLLAMA_MODEL_GENERAL", "qwen2.5:14b-instruct-q4_K_M")
        self.code_model = os.getenv("OLLAMA_MODEL_CODE", "qwen2.5-coder:14b")

        # HTTP client with timeout (V5.0: increased for comprehensive synthesis)
        self.client = httpx.AsyncClient(timeout=300.0)  # 5 min timeout for complex LLM operations (matches DeepSeek)

        logger.info(f"🤖 Ollama Service initialized: {self.base_url}")
        logger.info(f"   General Model: {self.general_model}")
        logger.info(f"   Code Model: {self.code_model}")

    async def chat(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        system: Optional[str] = None,
        temperature: float = 0.7,
        stream: bool = False,
    ) -> Dict:
        """
        Send chat messages to Ollama

        Args:
            messages: List of message dicts with 'role' and 'content'
            model: Model to use (default: general_model)
            system: System prompt (optional)
            temperature: Sampling temperature (0.0-1.0)
            stream: Whether to stream response

        Returns:
            Response dict with 'message' key containing assistant response

        Example:
            messages = [
                {"role": "user", "content": "Bonjour Shizen!"}
            ]
            response = await ollama.chat(messages)
            print(response["message"]["content"])
        """
        selected_model = model or self.general_model

        payload = {
            "model": selected_model,
            "messages": messages,
            "stream": stream,
            "options": {
                "temperature": temperature,
            },
        }

        if system:
            payload["system"] = system

        try:
            logger.info(f"📤 Sending chat request to Ollama (model: {selected_model})")

            response = await self.client.post(
                f"{self.base_url}/api/chat",
                json=payload,
            )
            response.raise_for_status()

            result = response.json()
            logger.info(f"✅ Ollama response received")

            return result

        except httpx.HTTPError as e:
            logger.error(f"❌ Ollama HTTP error: {e}")
            raise Exception(f"Ollama API error: {str(e)}")

    async def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        system: Optional[str] = None,
        temperature: float = 0.7,
    ) -> str:
        """
        Generate text from a single prompt (simpler interface)

        Args:
            prompt: User prompt
            model: Model to use (default: general_model)
            system: System prompt (optional)
            temperature: Sampling temperature

        Returns:
            Generated text string
        """
        selected_model = model or self.general_model

        payload = {
            "model": selected_model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
            },
        }

        if system:
            payload["system"] = system

        try:
            response = await self.client.post(
                f"{self.base_url}/api/generate",
                json=payload,
            )
            response.raise_for_status()

            result = response.json()
            return result.get("response", "")

        except httpx.HTTPError as e:
            logger.error(f"❌ Ollama generate error: {e}")
            raise Exception(f"Ollama generate error: {str(e)}")

    async def list_models(self) -> List[str]:
        """
        List available models in Ollama

        Returns:
            List of model names
        """
        try:
            response = await self.client.get(f"{self.base_url}/api/tags")
            response.raise_for_status()

            result = response.json()
            models = [model["name"] for model in result.get("models", [])]

            logger.info(f"📋 Available models: {models}")
            return models

        except httpx.HTTPError as e:
            logger.error(f"❌ Failed to list models: {e}")
            return []

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()


# Singleton instance
_ollama_service: Optional[OllamaService] = None


def get_ollama_service() -> OllamaService:
    """Get or create Ollama service singleton"""
    global _ollama_service
    if _ollama_service is None:
        _ollama_service = OllamaService()
    return _ollama_service
