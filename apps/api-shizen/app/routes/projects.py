"""
Projects CRUD endpoints
Shinkofa Platform - Planner

Tier limits enforced:
- MUSHA (free): 2 active projects max
- SAMURAI+: Unlimited projects
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
import uuid

from app.core.database import get_db
from app.models.project import Project
from app.schemas.project import (
    Project as ProjectSchema,
    ProjectCreate,
    ProjectUpdate,
    ProjectSyncRequest,
    ProjectSyncResponse,
)
from app.utils.auth import get_current_user_id
from app.utils.tier_service import verify_project_limit, get_user_tier, get_user_project_count

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=List[ProjectSchema])
def get_projects(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    status_filter: str = None,
):
    """
    Get all projects for current user

    Query params:
    - status_filter: Filter by status (active, completed, archived)
    """
    query = db.query(Project).filter(Project.user_id == user_id)

    if status_filter:
        query = query.filter(Project.status == status_filter)

    return query.order_by(Project.created_at.desc()).all()


@router.get("/{project_id}", response_model=ProjectSchema)
def get_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get a single project by ID"""
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.user_id == user_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found",
        )

    return project


@router.post("", response_model=ProjectSchema, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    user_id: str = Depends(verify_project_limit),  # Verifies tier limit
    db: Session = Depends(get_db),
):
    """
    Create a new project

    Tier limits enforced:
    - MUSHA (free): 2 active projects max
    - SAMURAI+: Unlimited

    Raises 403 if limit reached for MUSHA users
    """
    # Extract data and use client-provided ID if present
    project_dict = project_data.model_dump()
    project_id = project_dict.pop('id', None) or f"project-{uuid.uuid4()}"

    new_project = Project(
        id=project_id,
        user_id=user_id,
        **project_dict,
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return new_project


@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(
    project_id: str,
    project_update: ProjectUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Update an existing project"""
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.user_id == user_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found",
        )

    # Update only provided fields
    update_data = project_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)

    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Delete a project (cascade deletes associated tasks)"""
    project = (
        db.query(Project)
        .filter(Project.id == project_id, Project.user_id == user_id)
        .first()
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {project_id} not found",
        )

    db.delete(project)
    db.commit()

    return None


@router.post("/sync", response_model=ProjectSyncResponse)
async def sync_projects(
    sync_request: ProjectSyncRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Bidirectional sync for projects

    Compares client projects with server projects:
    - Updates server with newer client changes
    - Returns server changes newer than last_sync_at
    - Returns deleted project IDs

    Tier limits enforced for new project creations
    """
    sync_timestamp = datetime.now(timezone.utc)
    updated_on_server = []
    deleted_ids = []

    # Get all server projects for user
    server_projects = db.query(Project).filter(Project.user_id == user_id).all()
    server_project_map = {p.id: p for p in server_projects}

    # Tier verification: count new projects to be created
    tier = await get_user_tier(user_id)
    if tier.project_limit is not None:
        new_project_count = sum(
            1 for p in sync_request.projects
            if not p.deleted and p.id not in server_project_map
        )
        current_count = get_user_project_count(user_id, db)

        if current_count + new_project_count > tier.project_limit:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "project_limit_reached",
                    "message": f"Synchronisation bloquee: {new_project_count} nouveaux projets depasseraient la limite ({tier.project_limit} max pour {tier.tier.upper()})",
                    "current": current_count,
                    "limit": tier.project_limit,
                    "tier": tier.tier,
                    "upgrade_url": "/pricing"
                }
            )

    # Process client projects
    for client_project in sync_request.projects:
        if client_project.deleted:
            # Client deleted this project
            if client_project.id in server_project_map:
                db.delete(server_project_map[client_project.id])
                updated_on_server.append(client_project.id)
            continue

        if client_project.id in server_project_map:
            # Project exists on server - compare timestamps
            server_proj = server_project_map[client_project.id]
            # Make timestamps offset-aware for comparison
            client_updated = client_project.updated_at
            server_updated = server_proj.updated_at
            if server_updated.tzinfo is None:
                server_updated = server_updated.replace(tzinfo=timezone.utc)
            if client_updated.tzinfo is None:
                client_updated = client_updated.replace(tzinfo=timezone.utc)

            if client_updated > server_updated:
                # Client is newer - update server
                server_proj.name = client_project.name
                server_proj.description = client_project.description
                server_proj.color = client_project.color
                server_proj.icon = client_project.icon
                server_proj.status = client_project.status
                server_proj.updated_at = client_updated
                updated_on_server.append(client_project.id)
        else:
            # New project from client - create on server
            new_project = Project(
                id=client_project.id,
                user_id=user_id,
                name=client_project.name,
                description=client_project.description,
                color=client_project.color,
                icon=client_project.icon,
                status=client_project.status,
                created_at=client_project.created_at,
                updated_at=client_project.updated_at,
            )
            db.add(new_project)
            updated_on_server.append(client_project.id)

    db.commit()

    # Get server changes newer than last_sync
    server_changes = []
    refreshed_projects = db.query(Project).filter(Project.user_id == user_id).all()

    for proj in refreshed_projects:
        proj_updated = proj.updated_at
        if proj_updated.tzinfo is None:
            proj_updated = proj_updated.replace(tzinfo=timezone.utc)

        if sync_request.last_sync_at:
            last_sync = sync_request.last_sync_at
            if last_sync.tzinfo is None:
                last_sync = last_sync.replace(tzinfo=timezone.utc)
            if proj_updated > last_sync and proj.id not in updated_on_server:
                server_changes.append(proj)
        else:
            # First sync - return all server projects
            if proj.id not in updated_on_server:
                server_changes.append(proj)

    return ProjectSyncResponse(
        updated_on_server=updated_on_server,
        server_changes=server_changes,
        deleted_ids=deleted_ids,
        sync_timestamp=sync_timestamp,
    )
