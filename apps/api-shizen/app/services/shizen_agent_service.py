"""
SHIZEN Agent Service
Shinkofa Platform - Shizen AI Chatbot

LangChain agent orchestrating conversation with Unified LLM (Ollama + DeepSeek fallback) + custom tools
"""
from typing import Dict, List, Optional
from langchain.agents import AgentExecutor, create_react_agent
from langchain.prompts import PromptTemplate
from langchain.memory import ConversationBufferMemory
from sqlalchemy.ext.asyncio import AsyncSession
import logging
import os

from app.services.shizen_tools import SHIZEN_TOOLS
from app.services.llm_langchain_wrapper import get_unified_llm

logger = logging.getLogger(__name__)


class ShizenAgentService:
    """
    SHIZEN AI Agent service

    Conversational agent using:
    - Ollama LLM (qwen2.5:14b-instruct)
    - Custom tools for user profile, tasks, energy analysis
    - Conversation memory and context persistence
    """

    def __init__(self):
        """Initialize SHIZEN agent"""
        # Initialize Unified LLM (with Ollama → DeepSeek fallback)
        self.llm = get_unified_llm(temperature=0.7)
        self.model_name = "unified_llm_with_fallback"

        # SHIZEN agent persona prompt
        self.agent_prompt = PromptTemplate.from_template("""
Tu es SHIZEN, coach holistique IA de la plateforme Shinkofa.

**TON IDENTITÉ** :
- Bienveillant, empathique, authentique
- Expert en Design Humain, neurodiversité (TDAH, HPI, hypersensibilité)
- Guide stratégique basé sur profil holistique de l'utilisateur
- Tu parles français naturel, chaleureux, sans jargon technique excessif

**TON RÔLE** :
1. Écouter et comprendre l'utilisateur (ses défis, objectifs, énergie)
2. Analyser son profil holistique (Design Humain, neurodiversité, psychologie)
3. Recommander actions concrètes et personnalisées
4. Accompagner avec empathie et stratégie

**OUTILS DISPONIBLES** :
{tools}

**NOMS D'OUTILS** : {tool_names}

**FORMAT DE RÉPONSE** :
Thought: [Ton raisonnement interne sur ce que l'utilisateur demande]
Action: [Nom de l'outil à utiliser parmi {tool_names}]
Action Input: [Paramètres de l'outil en JSON]
Observation: [Résultat de l'outil]
... (répète Thought/Action/Action Input/Observation si nécessaire)
Thought: I now know the final answer
Final Answer: [Ta réponse finale à l'utilisateur en français naturel]

**INSTRUCTIONS CRITIQUES** :
- Utilise les outils pour récupérer données réelles (profil, tasks, énergie)
- Base tes recommandations sur le profil Design Humain de l'utilisateur
- Adapte tes conseils selon neurodivergence (TDAH → tasks courtes, HPI → défis intellectuels)
- Sois concis mais chaleureux (2-4 phrases maximum sauf si explication complexe)
- Utilise emojis modérément pour illustrer (pas excessif)

**CONTEXTE CONVERSATION** :
{chat_history}

**QUESTION UTILISATEUR** :
{input}

{agent_scratchpad}
""")

        # Create ReAct agent
        self.agent = create_react_agent(
            llm=self.llm,
            tools=SHIZEN_TOOLS,
            prompt=self.agent_prompt
        )

        # Agent executor
        self.agent_executor = AgentExecutor(
            agent=self.agent,
            tools=SHIZEN_TOOLS,
            verbose=True,  # Log agent reasoning
            max_iterations=5,  # Prevent infinite loops
            handle_parsing_errors=True,
        )

        logger.info("🌟 SHIZEN Agent initialized with Unified LLM (Ollama + DeepSeek fallback)")

    async def process_message(
        self,
        user_message: str,
        user_id: str,
        conversation_id: str,
        db: AsyncSession,
        chat_history: Optional[List[Dict]] = None,
    ) -> Dict:
        """
        Process user message through SHIZEN agent

        Args:
            user_message: User's message
            user_id: User ID
            conversation_id: Conversation session ID
            db: Database session
            chat_history: Previous messages for context

        Returns:
            Agent response with metadata
        """
        try:
            # Format chat history for prompt
            history_str = self._format_chat_history(chat_history or [])

            # Inject database session into tools context
            # (Tools will use this db session when called)
            tool_kwargs = {
                "user_id": user_id,
                "db": db,
            }

            # Run agent
            response = await self.agent_executor.ainvoke(
                {
                    "input": user_message,
                    "chat_history": history_str,
                    "tools": self._format_tools_description(),
                    "agent_scratchpad": "",
                },
                config={"configurable": {"tool_kwargs": tool_kwargs}}
            )

            # Extract output
            output_text = response.get("output", "")

            # Extract metadata (tools used, reasoning steps)
            intermediate_steps = response.get("intermediate_steps", [])
            tools_used = [
                {"tool": step[0].tool, "input": step[0].tool_input}
                for step in intermediate_steps
            ]

            return {
                "message": output_text,
                "tools_used": tools_used,
                "model": self.model_name,
                "reasoning_steps": len(intermediate_steps),
            }

        except Exception as e:
            logger.error(f"❌ SHIZEN agent error: {e}")
            return {
                "message": "Désolé, j'ai rencontré une erreur. Peux-tu reformuler ta question ?",
                "error": str(e),
                "model": self.model_name,
            }

    def _format_chat_history(self, chat_history: List[Dict]) -> str:
        """Format chat history for prompt"""
        if not chat_history:
            return "Pas d'historique (première interaction)"

        formatted = []
        for msg in chat_history[-10:]:  # Last 10 messages
            role = "Utilisateur" if msg["role"] == "user" else "SHIZEN"
            formatted.append(f"{role}: {msg['content']}")

        return "\n".join(formatted)

    def _format_tools_description(self) -> str:
        """Format tools description for prompt"""
        tools_desc = []
        for tool in SHIZEN_TOOLS:
            tools_desc.append(f"- {tool.name}: {tool.description}")
        return "\n".join(tools_desc)


# Singleton instance
_shizen_agent: Optional[ShizenAgentService] = None


def get_shizen_agent() -> ShizenAgentService:
    """Get or create SHIZEN agent singleton"""
    global _shizen_agent
    if _shizen_agent is None:
        _shizen_agent = ShizenAgentService()
    return _shizen_agent
