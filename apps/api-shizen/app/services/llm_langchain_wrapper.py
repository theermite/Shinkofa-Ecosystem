"""
LangChain LLM Wrapper - Custom LLM with Fallback
Shinkofa Platform - Shizen AI Agent

Wraps our unified LLM service (Ollama + DeepSeek fallback)
to be compatible with LangChain agents
"""
from typing import Any, List, Optional, Mapping
from langchain.llms.base import LLM
from langchain.callbacks.manager import CallbackManagerForLLMRun
import logging

from app.services.llm_service import get_llm_service, LLMProvider

logger = logging.getLogger(__name__)


class UnifiedLLM(LLM):
    """
    Custom LangChain LLM that wraps our unified LLM service

    Features:
    - Compatible with LangChain agents (ReAct, etc.)
    - Automatic Ollama → DeepSeek fallback
    - Transparent for LangChain consumers
    """

    temperature: float = 0.7
    """Sampling temperature"""

    force_provider: Optional[LLMProvider] = None
    """Force specific provider (for testing)"""

    @property
    def _llm_type(self) -> str:
        """Return identifier for this LLM type"""
        return "unified_llm_with_fallback"

    @property
    def _identifying_params(self) -> Mapping[str, Any]:
        """Get identifying parameters"""
        return {
            "temperature": self.temperature,
            "force_provider": self.force_provider,
        }

    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> str:
        """
        Call the LLM with prompt (synchronous wrapper)

        Args:
            prompt: Input prompt
            stop: Stop sequences (not used currently)
            run_manager: LangChain callback manager
            **kwargs: Additional arguments

        Returns:
            Generated text
        """
        # Note: LangChain expects sync method, but we need async
        # This is handled by LangChain's async adapter
        raise NotImplementedError("Use async method _acall instead")

    async def _acall(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> str:
        """
        Call the LLM with prompt (asynchronous)

        Args:
            prompt: Input prompt
            stop: Stop sequences (not used currently)
            run_manager: LangChain callback manager
            **kwargs: Additional arguments

        Returns:
            Generated text
        """
        try:
            # Get unified LLM service
            llm_service = get_llm_service()

            # Format as chat message (most LLMs expect chat format)
            messages = [{"role": "user", "content": prompt}]

            # Call with fallback
            response = await llm_service.chat(
                messages=messages,
                temperature=self.temperature,
                force_provider=self.force_provider,
            )

            # Extract text from response
            content = response.get("message", {}).get("content", "")
            provider = response.get("provider", "unknown")

            # Log provider used (helpful for monitoring)
            logger.debug(f"🧠 LLM response from {provider}")

            # Fire callback if provided
            if run_manager:
                run_manager.on_llm_end(response)

            return content

        except Exception as e:
            logger.error(f"❌ Unified LLM error: {e}")
            if run_manager:
                run_manager.on_llm_error(e)
            raise


def get_unified_llm(temperature: float = 0.7) -> UnifiedLLM:
    """
    Get UnifiedLLM instance for LangChain agents

    Args:
        temperature: Sampling temperature (0.0-1.0)

    Returns:
        UnifiedLLM instance ready for LangChain
    """
    return UnifiedLLM(temperature=temperature)
