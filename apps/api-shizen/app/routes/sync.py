"""
Sync endpoints

Tier limits enforced:
- MUSHA (free): 2 active projects, 10 active tasks max
- SAMURAI+: Unlimited
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, date, timezone
from typing import List
import uuid
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

from app.core.database import get_db
from app.utils.auth import get_current_user_id
from app.utils.tier_service import get_user_tier
from app.models.task import Task
from app.models.project import Project
from app.models.ritual import Ritual
from app.models.journal import DailyJournal
from app.schemas.sync import (
    SyncRequest,
    SyncResponse,
    TaskSync,
    ProjectSync,
    RitualSync,
    DailyJournalSync,
    AlarmSync
)

router = APIRouter(prefix="/sync", tags=["sync"])


def parse_datetime(dt_str: str | None) -> datetime | None:
    """Parse datetime string to datetime object"""
    if not dt_str:
        return None
    try:
        return datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
    except:
        return None


def parse_date(date_str: str) -> date:
    """Parse date string to date object"""
    try:
        return datetime.fromisoformat(date_str).date()
    except:
        return date.today()


@router.post("/", response_model=SyncResponse)
async def sync_data(
    sync_request: SyncRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Sync user data between client and server
    Server-wins conflict resolution for now (can be improved with timestamps)
    """
    try:
        logger.info(f"🔄 ========== SYNC REQUEST ==========")
        logger.info(f"   👤 User ID: {user_id}")
        logger.info(f"   📦 Tasks: {len(sync_request.tasks)}")
        logger.info(f"   📁 Projects: {len(sync_request.projects)}")
        logger.info(f"   🔄 Rituals: {len(sync_request.rituals)}")
        logger.info(f"   ⏰ Client lastUpdated: {sync_request.lastUpdated}")

        # === TIER VERIFICATION ===
        tier = await get_user_tier(user_id)

        # === CHECK IF CLIENT DATA IS UP-TO-DATE ===
        # Get server's last update timestamp from existing entities
        existing_tasks = db.query(Task).filter(Task.user_id == user_id).all()
        existing_projects = db.query(Project).filter(Project.user_id == user_id).all()

        # Count new entities to be created
        existing_task_ids_set = {t.id for t in existing_tasks}
        existing_project_ids_set = {p.id for p in existing_projects}

        new_tasks_count = sum(1 for t in sync_request.tasks if t.id not in existing_task_ids_set)
        new_projects_count = sum(1 for p in sync_request.projects if p.id not in existing_project_ids_set)

        # Check project limit
        if tier.project_limit is not None:
            current_project_count = len([p for p in existing_projects if p.status != 'archived'])
            if current_project_count + new_projects_count > tier.project_limit:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={
                        "error": "project_limit_reached",
                        "message": f"Limite de projets atteinte ({tier.project_limit} max pour {tier.tier.upper()}). Passez au niveau superieur.",
                        "current": current_project_count,
                        "limit": tier.project_limit,
                        "tier": tier.tier,
                        "upgrade_url": "/pricing"
                    }
                )

        # Check task limit (only for incomplete tasks)
        if tier.task_limit is not None:
            # Count new incomplete tasks from client
            new_incomplete_tasks = sum(
                1 for t in sync_request.tasks
                if t.id not in existing_task_ids_set and not t.completed
            )
            current_task_count = len([t for t in existing_tasks if not t.completed])
            if current_task_count + new_incomplete_tasks > tier.task_limit:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail={
                        "error": "task_limit_reached",
                        "message": f"Limite de taches atteinte ({tier.task_limit} actives max pour {tier.tier.upper()}). Completez des taches ou passez au niveau superieur.",
                        "current": current_task_count,
                        "limit": tier.task_limit,
                        "tier": tier.tier,
                        "upgrade_url": "/pricing"
                    }
                )

        server_timestamps = []
        for task in existing_tasks:
            if task.updated_at:
                server_timestamps.append(task.updated_at)
        for project in existing_projects:
            if project.updated_at:
                server_timestamps.append(project.updated_at)

        server_last_updated = max(server_timestamps) if server_timestamps else datetime.now(timezone.utc)
        client_timestamp = parse_datetime(sync_request.lastUpdated)

        # SERVER-AUTHORITATIVE SYNC
        # Client can only modify data if its timestamp is >= server's last update
        # If client is stale, we ignore ALL its changes and just return server state
        # This is how Google Docs, Notion, etc. work - server is the source of truth
        # Compare as naive datetimes to avoid timezone comparison errors
        server_naive = server_last_updated.replace(tzinfo=None) if server_last_updated.tzinfo else server_last_updated
        client_naive = client_timestamp.replace(tzinfo=None) if (client_timestamp and client_timestamp.tzinfo) else client_timestamp

        if client_naive and client_naive >= server_naive:
            client_is_uptodate = True
            logger.info(f"   ✅ Client is up-to-date - accepting changes (client: {client_timestamp.isoformat()}, server: {server_last_updated.isoformat()})")
        else:
            client_is_uptodate = False
            client_ts = client_timestamp.isoformat() if client_timestamp else "missing"
            logger.info(f"   ⚠️ Client is STALE - ignoring ALL changes, returning server state (client: {client_ts}, server: {server_last_updated.isoformat()})")

        # === SYNC TASKS ===
        # existing_tasks already fetched above for timestamp check
        existing_task_ids = {task.id for task in existing_tasks}
        client_task_ids = {task.id for task in sync_request.tasks}

        # Only accept client changes if client is up-to-date
        if client_is_uptodate:
            # Update or create tasks from client
            for task_data in sync_request.tasks:
                task = db.query(Task).filter(
                    Task.id == task_data.id,
                    Task.user_id == user_id
                ).first()

                if task:
                    # Update existing task
                    task.title = task_data.title
                    task.description = task_data.description
                    task.completed = task_data.completed
                    task.priority = task_data.priority
                    task.due_date = parse_datetime(task_data.dueDate)
                    task.project_id = task_data.projectId
                    task.is_daily_task = task_data.isDailyTask
                    task.difficulty_level = task_data.difficultyLevel
                    task.order = task_data.order
                    task.updated_at = datetime.now(timezone.utc)
                else:
                    # Create new task
                    new_task = Task(
                        id=task_data.id,
                        title=task_data.title,
                        description=task_data.description,
                        completed=task_data.completed,
                        priority=task_data.priority,
                        due_date=parse_datetime(task_data.dueDate),
                        project_id=task_data.projectId,
                        is_daily_task=task_data.isDailyTask,
                        difficulty_level=task_data.difficultyLevel,
                        order=task_data.order,
                        user_id=user_id,
                        created_at=parse_datetime(task_data.createdAt) or datetime.now(timezone.utc),
                    )
                    db.add(new_task)

            # Smart deletion - only if client is up-to-date
            if len(sync_request.tasks) > 0:
                deleted_count = 0
                for task in existing_tasks:
                    if task.id not in client_task_ids:
                        db.delete(task)
                        deleted_count += 1
                if deleted_count > 0:
                    logger.info(f"   🗑️ Deleted {deleted_count} tasks from server")

        # === SYNC PROJECTS ===
        # existing_projects already fetched above for timestamp check
        existing_project_ids = {project.id for project in existing_projects}
        client_project_ids = {project.id for project in sync_request.projects}

        # Only accept client changes if client is up-to-date
        if client_is_uptodate:
            for project_data in sync_request.projects:
                project = db.query(Project).filter(
                    Project.id == project_data.id,
                    Project.user_id == user_id
                ).first()

                if project:
                    # Update existing project
                    project.name = project_data.name
                    project.description = project_data.description
                    project.color = project_data.color
                    project.icon = project_data.icon
                    project.status = project_data.status
                    project.updated_at = datetime.now(timezone.utc)
                else:
                    # Create new project
                    new_project = Project(
                        id=project_data.id,
                        name=project_data.name,
                        description=project_data.description,
                        color=project_data.color,
                        icon=project_data.icon,
                        status=project_data.status,
                        user_id=user_id,
                        created_at=parse_datetime(project_data.createdAt) or datetime.now(timezone.utc),
                    )
                    db.add(new_project)

            # Smart deletion for projects
            if len(sync_request.projects) > 0:
                deleted_count = 0
                for project in existing_projects:
                    if project.id not in client_project_ids:
                        db.delete(project)
                        deleted_count += 1
                if deleted_count > 0:
                    logger.info(f"   🗑️ Deleted {deleted_count} projects from server")

        # === SYNC RITUALS ===
        existing_rituals = db.query(Ritual).filter(Ritual.user_id == user_id).all()
        existing_ritual_ids = {ritual.id for ritual in existing_rituals}
        client_ritual_ids = {ritual.id for ritual in sync_request.rituals}

        # Only accept client changes if client is up-to-date
        if client_is_uptodate:
            for ritual_data in sync_request.rituals:
                ritual = db.query(Ritual).filter(
                    Ritual.id == ritual_data.id,
                    Ritual.user_id == user_id
                ).first()

                if ritual:
                    ritual.label = ritual_data.label
                    ritual.icon = ritual_data.icon
                    ritual.completed = ritual_data.completed
                    ritual.category = ritual_data.category
                    ritual.order = ritual_data.order
                else:
                    new_ritual = Ritual(
                        id=ritual_data.id,
                        label=ritual_data.label,
                        icon=ritual_data.icon,
                        completed=ritual_data.completed,
                        category=ritual_data.category,
                        order=ritual_data.order,
                        user_id=user_id,
                    )
                    db.add(new_ritual)

        # Smart deletion for rituals
        if len(sync_request.rituals) > 0 and client_is_uptodate:
            deleted_count = 0
            for ritual in existing_rituals:
                if ritual.id not in client_ritual_ids:
                    db.delete(ritual)
                    deleted_count += 1
            if deleted_count > 0:
                logger.info(f"   🗑️ Deleted {deleted_count} rituals from server")

        # === SYNC DAILY JOURNAL ===
        # Only accept client changes if client is up-to-date
        if sync_request.dailyJournal and client_is_uptodate:
            journal_data = sync_request.dailyJournal
            journal_date = parse_date(journal_data.date)

            journal = db.query(DailyJournal).filter(
                DailyJournal.user_id == user_id,
                DailyJournal.date == journal_date
            ).first()

            if journal:
                journal.energy_morning = journal_data.energyMorning
                journal.energy_evening = journal_data.energyEvening
                journal.intentions = journal_data.intentions
                journal.gratitudes = journal_data.gratitudes
                journal.successes = journal_data.successes
                journal.learning = journal_data.learning
                journal.adjustments = journal_data.adjustments
            else:
                new_journal = DailyJournal(
                    id=f"journal-{uuid.uuid4()}",
                    date=journal_date,
                    energy_morning=journal_data.energyMorning,
                    energy_evening=journal_data.energyEvening,
                    intentions=journal_data.intentions,
                    gratitudes=journal_data.gratitudes,
                    successes=journal_data.successes,
                    learning=journal_data.learning,
                    adjustments=journal_data.adjustments,
                    user_id=user_id,
                )
                db.add(new_journal)

        # === SYNC ALARMS ===
        # NOTE: Alarms model doesn't exist in current codebase, skipping for now
        # Can be added later when Alarm model is implemented

        # Commit all changes
        db.commit()

        # === RETURN SYNCED DATA ===
        # Fetch all updated data from DB
        all_tasks = db.query(Task).filter(Task.user_id == user_id).all()
        all_projects = db.query(Project).filter(Project.user_id == user_id).all()
        all_rituals = db.query(Ritual).filter(Ritual.user_id == user_id).all()

        # Get today's journal
        today_journal = db.query(DailyJournal).filter(
            DailyJournal.user_id == user_id,
            DailyJournal.date == date.today()
        ).first()

        # Calculate the real lastUpdated based on the most recent entity modification
        # This ensures accurate conflict resolution in multi-device sync
        all_timestamps = []

        # Collect all entity timestamps
        for task in all_tasks:
            if task.updated_at:
                all_timestamps.append(task.updated_at)
        for project in all_projects:
            if project.updated_at:
                all_timestamps.append(project.updated_at)

        # Use the most recent timestamp, or current time if no entities exist
        last_updated = max(all_timestamps).isoformat() if all_timestamps else datetime.now(timezone.utc).isoformat()

        # Format response
        response_data = {
            "tasks": [
                {
                    "id": task.id,
                    "title": task.title,
                    "description": task.description,
                    "completed": task.completed,
                    "priority": task.priority,
                    "dueDate": task.due_date.isoformat() if task.due_date else None,
                    "projectId": task.project_id,
                    "isDailyTask": task.is_daily_task,
                    "difficultyLevel": task.difficulty_level,
                    "order": task.order,
                    "createdAt": task.created_at.isoformat() if task.created_at else None,
                    "updatedAt": task.updated_at.isoformat() if task.updated_at else None,
                }
                for task in all_tasks
            ],
            "projects": [
                {
                    "id": project.id,
                    "name": project.name,
                    "description": project.description,
                    "color": project.color,
                    "icon": project.icon,
                    "status": project.status,
                    "createdAt": project.created_at.isoformat() if project.created_at else None,
                    "updatedAt": project.updated_at.isoformat() if project.updated_at else None,
                }
                for project in all_projects
            ],
            "rituals": [
                {
                    "id": ritual.id,
                    "label": ritual.label,
                    "icon": ritual.icon,
                    "completed": ritual.completed,
                    "category": ritual.category,
                    "order": ritual.order,
                }
                for ritual in all_rituals
            ],
            "dailyJournal": {
                "date": today_journal.date.isoformat() if today_journal else date.today().isoformat(),
                "energyMorning": today_journal.energy_morning if today_journal else 5,
                "energyEvening": today_journal.energy_evening if today_journal else 5,
                "intentions": today_journal.intentions if today_journal else "",
                "gratitudes": today_journal.gratitudes if today_journal else ["", "", ""],
                "successes": today_journal.successes if today_journal else ["", "", ""],
                "learning": today_journal.learning if today_journal else "",
                "adjustments": today_journal.adjustments if today_journal else "",
            },
            "alarms": [],  # Not implemented yet
            "lastUpdated": last_updated,
        }

        logger.info(f"✅ ========== SYNC RESPONSE ==========")
        logger.info(f"   👤 User ID: {user_id}")
        logger.info(f"   📦 Tasks returned: {len(response_data['tasks'])}")
        logger.info(f"   📁 Projects returned: {len(response_data['projects'])}")
        logger.info(f"   🔄 Rituals returned: {len(response_data['rituals'])}")
        logger.info(f"   ⏰ Server lastUpdated: {last_updated}")
        logger.info(f"==========================================")

        return SyncResponse(success=True, data=response_data)

    except Exception as e:
        db.rollback()
        logger.error(f"❌ Sync error: {str(e)}", exc_info=True)
        return SyncResponse(success=False, error=str(e))
