"""
Conversation Management Service
Shinkofa Platform - Shizen AI Chatbot

Manages conversation sessions and message history
"""
from typing import Dict, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from datetime import datetime, timezone
import uuid
import logging

from app.models import (
    ConversationSession,
    ConversationStatus,
    Message,
    MessageRole,
)

logger = logging.getLogger(__name__)


class ConversationService:
    """
    Conversation management service

    Handles:
    - Creating new conversation sessions
    - Saving messages with metadata
    - Retrieving conversation history
    - Managing conversation context
    - Archiving/deleting conversations
    """

    async def create_conversation(
        self,
        user_id: str,
        title: Optional[str] = None,
        initial_context: Optional[Dict] = None,
        db: AsyncSession = None,
    ) -> ConversationSession:
        """
        Create new conversation session

        Args:
            user_id: User ID
            title: Optional conversation title (auto-generated if None)
            initial_context: Optional initial context
            db: Database session

        Returns:
            Created ConversationSession
        """
        try:
            # Generate title if not provided
            if not title:
                title = f"Conversation du {datetime.now(timezone.utc).strftime('%d/%m/%Y à %H:%M')}"

            # Create conversation
            conversation = ConversationSession(
                id=str(uuid.uuid4()),
                user_id=user_id,
                title=title,
                status=ConversationStatus.ACTIVE,
                context=initial_context or {},
                meta={
                    "tags": [],
                    "topics_discussed": [],
                    "total_messages": 0,
                },
            )

            db.add(conversation)
            await db.commit()
            await db.refresh(conversation)

            logger.info(f"✅ Conversation created: {conversation.id} for user {user_id}")
            return conversation

        except Exception as e:
            logger.error(f"❌ Error creating conversation: {e}")
            await db.rollback()
            raise Exception(f"Failed to create conversation: {str(e)}")

    async def add_message(
        self,
        conversation_id: str,
        role: MessageRole,
        content: str,
        meta: Optional[Dict] = None,
        db: AsyncSession = None,
    ) -> Message:
        """
        Add message to conversation

        Args:
            conversation_id: Conversation session ID
            role: Message role (user, assistant, system)
            content: Message content
            meta: Optional message metadata
            db: Database session

        Returns:
            Created Message
        """
        try:
            # Create message
            message = Message(
                id=str(uuid.uuid4()),
                conversation_id=conversation_id,
                role=role,
                content=content,
                meta=meta or {},
            )

            db.add(message)

            # Update conversation last_message_at and total_messages count
            conv_result = await db.execute(
                select(ConversationSession)
                .where(ConversationSession.id == conversation_id)
            )
            conversation = conv_result.scalar_one()

            conversation.last_message_at = datetime.now(timezone.utc)

            # Increment total messages count
            current_meta = conversation.meta or {}
            current_meta["total_messages"] = current_meta.get("total_messages", 0) + 1
            conversation.meta = current_meta

            await db.commit()
            await db.refresh(message)

            logger.info(f"✅ Message added to conversation {conversation_id}")
            return message

        except Exception as e:
            logger.error(f"❌ Error adding message: {e}")
            await db.rollback()
            raise Exception(f"Failed to add message: {str(e)}")

    async def get_conversation(
        self,
        conversation_id: str,
        db: AsyncSession,
    ) -> Optional[ConversationSession]:
        """
        Get conversation session

        Args:
            conversation_id: Conversation ID
            db: Database session

        Returns:
            ConversationSession or None
        """
        try:
            result = await db.execute(
                select(ConversationSession)
                .where(ConversationSession.id == conversation_id)
            )
            return result.scalar_one_or_none()

        except Exception as e:
            logger.error(f"❌ Error getting conversation: {e}")
            return None

    async def get_conversation_history(
        self,
        conversation_id: str,
        db: AsyncSession,
        limit: Optional[int] = None,
        offset: int = 0,
    ) -> List[Message]:
        """
        Get conversation message history

        Args:
            conversation_id: Conversation ID
            db: Database session
            limit: Maximum number of messages (None = all)
            offset: Offset for pagination

        Returns:
            List of messages in chronological order
        """
        try:
            query = (
                select(Message)
                .where(Message.conversation_id == conversation_id)
                .order_by(Message.created_at)
                .offset(offset)
            )

            if limit:
                query = query.limit(limit)

            result = await db.execute(query)
            return list(result.scalars().all())

        except Exception as e:
            logger.error(f"❌ Error getting conversation history: {e}")
            return []

    async def get_user_conversations(
        self,
        user_id: str,
        db: AsyncSession,
        status: Optional[ConversationStatus] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> List[ConversationSession]:
        """
        Get user's conversations

        Args:
            user_id: User ID
            db: Database session
            status: Optional filter by status
            limit: Maximum conversations
            offset: Offset for pagination

        Returns:
            List of conversations ordered by last activity
        """
        try:
            query = (
                select(ConversationSession)
                .where(ConversationSession.user_id == user_id)
            )

            if status:
                query = query.where(ConversationSession.status == status)

            query = (
                query
                .order_by(desc(ConversationSession.last_message_at))
                .limit(limit)
                .offset(offset)
            )

            result = await db.execute(query)
            return list(result.scalars().all())

        except Exception as e:
            logger.error(f"❌ Error getting user conversations: {e}")
            return []

    async def update_conversation_context(
        self,
        conversation_id: str,
        context_updates: Dict,
        db: AsyncSession,
    ) -> bool:
        """
        Update conversation context (merge with existing)

        Args:
            conversation_id: Conversation ID
            context_updates: Context updates to merge
            db: Database session

        Returns:
            Success status
        """
        try:
            conv_result = await db.execute(
                select(ConversationSession)
                .where(ConversationSession.id == conversation_id)
            )
            conversation = conv_result.scalar_one()

            # Merge context
            current_context = conversation.context or {}
            current_context.update(context_updates)
            conversation.context = current_context

            await db.commit()

            logger.info(f"✅ Context updated for conversation {conversation_id}")
            return True

        except Exception as e:
            logger.error(f"❌ Error updating conversation context: {e}")
            await db.rollback()
            return False

    async def update_conversation_meta(
        self,
        conversation_id: str,
        meta_updates: Dict,
        db: AsyncSession,
    ) -> bool:
        """
        Update conversation metadata (merge with existing)

        Args:
            conversation_id: Conversation ID
            meta_updates: Metadata updates to merge
            db: Database session

        Returns:
            Success status
        """
        try:
            conv_result = await db.execute(
                select(ConversationSession)
                .where(ConversationSession.id == conversation_id)
            )
            conversation = conv_result.scalar_one()

            # Merge meta
            current_meta = conversation.meta or {}
            current_meta.update(meta_updates)
            conversation.meta = current_meta

            await db.commit()

            logger.info(f"✅ Metadata updated for conversation {conversation_id}")
            return True

        except Exception as e:
            logger.error(f"❌ Error updating conversation meta: {e}")
            await db.rollback()
            return False

    async def archive_conversation(
        self,
        conversation_id: str,
        db: AsyncSession,
    ) -> bool:
        """
        Archive conversation

        Args:
            conversation_id: Conversation ID
            db: Database session

        Returns:
            Success status
        """
        try:
            conv_result = await db.execute(
                select(ConversationSession)
                .where(ConversationSession.id == conversation_id)
            )
            conversation = conv_result.scalar_one()

            conversation.status = ConversationStatus.ARCHIVED
            conversation.archived_at = datetime.now(timezone.utc)

            await db.commit()

            logger.info(f"✅ Conversation archived: {conversation_id}")
            return True

        except Exception as e:
            logger.error(f"❌ Error archiving conversation: {e}")
            await db.rollback()
            return False

    async def delete_conversation(
        self,
        conversation_id: str,
        db: AsyncSession,
    ) -> bool:
        """
        Soft delete conversation (mark as deleted, keep in DB)

        Args:
            conversation_id: Conversation ID
            db: Database session

        Returns:
            Success status
        """
        try:
            conv_result = await db.execute(
                select(ConversationSession)
                .where(ConversationSession.id == conversation_id)
            )
            conversation = conv_result.scalar_one()

            conversation.status = ConversationStatus.DELETED

            await db.commit()

            logger.info(f"✅ Conversation deleted (soft): {conversation_id}")
            return True

        except Exception as e:
            logger.error(f"❌ Error deleting conversation: {e}")
            await db.rollback()
            return False

    async def search_conversations(
        self,
        user_id: str,
        db: AsyncSession,
        query: Optional[str] = None,
        tags: Optional[List[str]] = None,
        limit: int = 20,
    ) -> List[ConversationSession]:
        """
        Search user's conversations by query or tags

        Args:
            user_id: User ID
            db: Database session
            query: Search query (matches title)
            tags: Filter by tags
            limit: Maximum results

        Returns:
            Matching conversations
        """
        try:
            sql_query = (
                select(ConversationSession)
                .where(ConversationSession.user_id == user_id)
                .where(ConversationSession.status != ConversationStatus.DELETED)
            )

            # Filter by title query
            if query:
                sql_query = sql_query.where(
                    ConversationSession.title.ilike(f"%{query}%")
                )

            # Filter by tags (JSON containment)
            # Note: This is PostgreSQL-specific
            if tags:
                for tag in tags:
                    sql_query = sql_query.where(
                        ConversationSession.meta["tags"].astext.contains(tag)
                    )

            sql_query = (
                sql_query
                .order_by(desc(ConversationSession.last_message_at))
                .limit(limit)
            )

            result = await db.execute(sql_query)
            return list(result.scalars().all())

        except Exception as e:
            logger.error(f"❌ Error searching conversations: {e}")
            return []


# Singleton instance
_conversation_service: Optional[ConversationService] = None


def get_conversation_service() -> ConversationService:
    """Get or create Conversation service singleton"""
    global _conversation_service
    if _conversation_service is None:
        _conversation_service = ConversationService()
    return _conversation_service
