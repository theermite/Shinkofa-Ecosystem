"""
SHIZEN Agent Tools
Shinkofa Platform - Shizen AI Chatbot

LangChain tools for SHIZEN agent to interact with user data
"""
from typing import Dict, List, Optional
from langchain.tools import tool
from sqlalchemy import select, desc
from datetime import datetime, timezone
import logging

from app.core.database import AsyncSessionLocal
from app.models import (
    HolisticProfile,
    Task,
    Project,
    DailyJournal,
    ConversationSession,
    Message,
)

logger = logging.getLogger(__name__)


@tool
async def get_user_profile(user_id: str) -> Dict:
    """
    Get user's holistic profile summary

    Args:
        user_id: User ID

    Returns:
        Profile summary with key dimensions
    """
    async with AsyncSessionLocal() as db:
        try:
            # Get most recent holistic profile
            result = await db.execute(
                select(HolisticProfile)
                .where(HolisticProfile.user_id == user_id)
                .order_by(desc(HolisticProfile.generated_at))
                .limit(1)
            )
            profile = result.scalar_one_or_none()

            if not profile:
                return {"error": "No holistic profile found for this user"}

            # Return condensed summary for agent context
            return {
                "design_human": {
                    "type": profile.design_human.get("type"),
                    "authority": profile.design_human.get("authority"),
                    "strategy": profile.design_human.get("strategy"),
                },
                "neurodivergence": {
                    "adhd_score": profile.neurodivergence_analysis.get("adhd", {}).get("score", 0),
                    "hpi_score": profile.neurodivergence_analysis.get("hpi", {}).get("score", 0),
                    "hypersensitivity_score": profile.neurodivergence_analysis.get("hypersensitivity", {}).get("score", 0),
                },
                "psychological": {
                    "mbti": profile.psychological_analysis.get("mbti", {}).get("type"),
                    "enneagram": profile.psychological_analysis.get("enneagram", {}).get("type"),
                    "pcm_dominant": profile.psychological_analysis.get("pcm", {}).get("dominant_type"),
                    "vakog_dominant": profile.psychological_analysis.get("vakog", {}).get("dominant_channel"),
                },
                "shinkofa": {
                    "primary_archetype": profile.shinkofa_analysis.get("archetypes", {}).get("primary"),
                    "life_wheel": profile.shinkofa_analysis.get("life_wheel", {}),
                },
            }

        except Exception as e:
            logger.error(f"Error getting user profile: {e}")
            return {"error": str(e)}


@tool
async def get_active_tasks(user_id: str, limit: int = 10) -> List[Dict]:
    """
    Get user's active tasks

    Args:
        user_id: User ID
        limit: Maximum number of tasks to return

    Returns:
        List of active tasks
    """
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(
                select(Task)
                .where(Task.user_id == user_id)
                .where(Task.status.in_(["todo", "in_progress"]))
                .order_by(desc(Task.priority), Task.due_date)
                .limit(limit)
            )
            tasks = result.scalars().all()

            return [
                {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "status": task.status,
                    "priority": task.priority,
                    "due_date": task.due_date.isoformat() if task.due_date else None,
                    "energy_required": task.energy_required,
                }
                for task in tasks
            ]

        except Exception as e:
            logger.error(f"Error getting active tasks: {e}")
            return []


@tool
async def recommend_tasks_based_on_profile(
    user_id: str,
    current_energy_level: Optional[int] = None,
    time_of_day: Optional[str] = None,
) -> List[Dict]:
    """
    Recommend tasks based on user's holistic profile and current state

    Args:
        user_id: User ID
        current_energy_level: Current energy (1-10)
        time_of_day: morning, afternoon, evening, night

    Returns:
        List of recommended tasks with rationale
    """
    async with AsyncSessionLocal() as db:
        try:
            # Get profile
            profile_result = await db.execute(
                select(HolisticProfile)
                .where(HolisticProfile.user_id == user_id)
                .order_by(desc(HolisticProfile.generated_at))
                .limit(1)
            )
            profile = profile_result.scalar_one_or_none()

            if not profile:
                return [{"error": "No profile found"}]

            # Get active tasks
            tasks_result = await db.execute(
                select(Task)
                .where(Task.user_id == user_id)
                .where(Task.status.in_(["todo", "in_progress"]))
            )
            tasks = tasks_result.scalars().all()

            recommendations = []

            # Filter tasks based on energy level (if provided)
            if current_energy_level:
                suitable_tasks = [
                    t for t in tasks
                    if (t.energy_required or 5) <= current_energy_level + 2
                ]
            else:
                suitable_tasks = tasks

            # Design Human type-specific recommendations
            dh_type = profile.design_human.get("type", "").lower()

            for task in suitable_tasks[:5]:  # Top 5 recommendations
                rationale = []

                # Energy matching
                task_energy = task.energy_required or 5
                if current_energy_level and abs(task_energy - current_energy_level) <= 2:
                    rationale.append(f"Énergie adaptée ({current_energy_level}/10)")

                # Design Human strategy
                if dh_type == "projector":
                    if task.priority == "high":
                        rationale.append("Haute priorité - attends invitation si collaboration")
                elif dh_type == "generator" or dh_type == "manifesting_generator":
                    rationale.append("Répondre au gut feeling avant de démarrer")
                elif dh_type == "manifestor":
                    if task.priority == "high":
                        rationale.append("Informer les autres avant d'initier")

                # ADHD adaptations
                adhd_score = profile.neurodivergence_analysis.get("adhd", {}).get("score", 0)
                if adhd_score > 60:
                    if task.estimated_duration and task.estimated_duration <= 30:
                        rationale.append("Courte durée - adapté TDAH (≤30 min)")

                recommendations.append({
                    "task_id": task.id,
                    "title": task.title,
                    "priority": task.priority,
                    "energy_required": task_energy,
                    "rationale": " | ".join(rationale) if rationale else "Tâche disponible",
                    "estimated_duration": task.estimated_duration,
                })

            return recommendations

        except Exception as e:
            logger.error(f"Error recommending tasks: {e}")
            return [{"error": str(e)}]


@tool
async def analyze_energy_patterns(user_id: str, days: int = 7) -> Dict:
    """
    Analyze user's energy patterns from journal entries

    Args:
        user_id: User ID
        days: Number of days to analyze

    Returns:
        Energy pattern analysis
    """
    async with AsyncSessionLocal() as db:
        try:
            # Get recent journal entries
            result = await db.execute(
                select(DailyJournal)
                .where(DailyJournal.user_id == user_id)
                .order_by(desc(DailyJournal.entry_date))
                .limit(days)
            )
            journals = result.scalars().all()

            if not journals:
                return {"error": "No journal entries found"}

            # Extract energy levels
            energy_levels = [
                j.energy_level for j in journals
                if j.energy_level is not None
            ]

            if not energy_levels:
                return {"error": "No energy data in journals"}

            # Calculate patterns
            avg_energy = sum(energy_levels) / len(energy_levels)
            max_energy = max(energy_levels)
            min_energy = min(energy_levels)

            # Detect trends
            if len(energy_levels) >= 3:
                recent_avg = sum(energy_levels[:3]) / 3
                older_avg = sum(energy_levels[3:]) / len(energy_levels[3:]) if len(energy_levels) > 3 else avg_energy
                trend = "increasing" if recent_avg > older_avg else "decreasing" if recent_avg < older_avg else "stable"
            else:
                trend = "insufficient_data"

            return {
                "days_analyzed": len(journals),
                "average_energy": round(avg_energy, 1),
                "max_energy": max_energy,
                "min_energy": min_energy,
                "trend": trend,
                "recommendation": _get_energy_recommendation(avg_energy, trend),
            }

        except Exception as e:
            logger.error(f"Error analyzing energy patterns: {e}")
            return {"error": str(e)}


@tool
async def get_conversation_context(conversation_id: str, last_n: int = 10) -> Dict:
    """
    Get recent conversation context

    Args:
        conversation_id: Conversation session ID
        last_n: Number of recent messages to retrieve

    Returns:
        Conversation context with recent messages
    """
    async with AsyncSessionLocal() as db:
        try:
            # Get conversation session
            conv_result = await db.execute(
                select(ConversationSession)
                .where(ConversationSession.id == conversation_id)
            )
            conversation = conv_result.scalar_one_or_none()

            if not conversation:
                return {"error": "Conversation not found"}

            # Get recent messages
            msg_result = await db.execute(
                select(Message)
                .where(Message.conversation_id == conversation_id)
                .order_by(desc(Message.created_at))
                .limit(last_n)
            )
            messages = msg_result.scalars().all()

            # Reverse to chronological order
            messages = list(reversed(messages))

            return {
                "conversation_id": conversation_id,
                "status": conversation.status,
                "context": conversation.context or {},
                "meta": conversation.meta or {},
                "recent_messages": [
                    {
                        "role": msg.role,
                        "content": msg.content,
                        "created_at": msg.created_at.isoformat(),
                    }
                    for msg in messages
                ],
            }

        except Exception as e:
            logger.error(f"Error getting conversation context: {e}")
            return {"error": str(e)}


def _get_energy_recommendation(avg_energy: float, trend: str) -> str:
    """Generate energy recommendation based on patterns"""
    if avg_energy < 4:
        return "Énergie faible - Priorise repos et tâches légères. Consulte profil Design Humain pour stratégie."
    elif avg_energy < 6:
        if trend == "decreasing":
            return "Énergie en baisse - Anticipe pause récup. Tasks moyennes énergie uniquement."
        else:
            return "Énergie modérée - Alterne tasks moyennes et pauses régulières."
    elif avg_energy < 8:
        return "Bonne énergie - Profite pour tasks prioritaires. Attention à ne pas surcharger."
    else:
        if trend == "stable":
            return "Excellente énergie stable - Moments parfaits pour challenges et créativité."
        else:
            return "Pic d'énergie - Capitalise tout en préservant équilibre long terme."


# Tool registry for LangChain agent
SHIZEN_TOOLS = [
    get_user_profile,
    get_active_tasks,
    recommend_tasks_based_on_profile,
    analyze_energy_patterns,
    get_conversation_context,
]
