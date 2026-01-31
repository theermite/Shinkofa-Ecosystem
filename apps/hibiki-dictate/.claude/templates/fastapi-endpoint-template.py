#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FastAPI CRUD Endpoint Template

Provides complete CRUD operations for Resource with:
- Authentication JWT required
- Authorization by roles
- Pagination support
- Input validation
- Error handling
- Logging
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizentials
from pydantic import BaseModel, Field, EmailStr, validator
from sqlalchemy.orm import Session
import logging
from datetime import datetime

# Initialize
router = APIRouter(prefix="/api/resources", tags=["resources"])
logger = logging.getLogger(__name__)
security = HTTPBearer()

# ============================================================================
# MODELS & SCHEMAS
# ============================================================================

class ResourceBase(BaseModel):
    """Base schema for Resource"""
    name: str = Field(..., min_length=1, max_length=100, description="Resource name")
    description: Optional[str] = Field(None, max_length=500, description="Optional description")
    status: str = Field(default="active", pattern="^(active|inactive|pending)$")

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Example Resource",
                "description": "This is an example",
                "status": "active"
            }
        }

class ResourceCreate(ResourceBase):
    """Schema for creating Resource"""
    pass

class ResourceUpdate(BaseModel):
    """Schema for updating Resource (partial update)"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = Field(None, pattern="^(active|inactive|pending)$")

class ResourceResponse(ResourceBase):
    """Schema for Resource response"""
    id: int
    created_at: datetime
    updated_at: datetime
    created_by: int

    class Config:
        from_attributes = True

class ResourceList(BaseModel):
    """Schema for paginated Resource list"""
    items: List[ResourceResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

# ============================================================================
# DEPENDENCIES
# ============================================================================

async def get_current_user(credentials: HTTPAuthorizentials = Depends(security)) -> dict:
    """
    Verify JWT token and return current user.

    Raises:
        HTTPException: If token invalid or expired
    """
    try:
        # TODO: Implement actual JWT verification
        # payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        # user = await get_user_by_id(payload.get("sub"))

        # Mock user for template
        user = {"id": 1, "email": "user@example.com", "role": "admin"}

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return user

    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

async def get_db() -> Session:
    """
    Database session dependency.

    Yields:
        Database session
    """
    # TODO: Implement actual database session
    # db = SessionLocal()
    # try:
    #     yield db
    # finally:
    #     db.close()
    pass

def require_role(required_role: str):
    """
    Dependency to check user role.

    Args:
        required_role: Required role (admin/user/viewer)
    """
    async def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("role") != required_role and current_user.get("role") != "admin":
            raise HTTPException(
                status_code=403,
                detail=f"Insufficient permissions. Required role: {required_role}"
            )
        return current_user
    return role_checker

# ============================================================================
# CRUD OPERATIONS
# ============================================================================

async def create_resource_db(resource: ResourceCreate, user_id: int, db: Session) -> dict:
    """
    Create resource in database.

    Args:
        resource: Resource data
        user_id: Creator user ID
        db: Database session

    Returns:
        Created resource dict
    """
    # TODO: Implement actual database creation
    new_resource = {
        "id": 1,
        "name": resource.name,
        "description": resource.description,
        "status": resource.status,
        "created_by": user_id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    logger.info(f"Resource created: {new_resource['id']}")
    return new_resource

async def get_resources_db(skip: int, limit: int, db: Session) -> tuple:
    """
    Get paginated resources from database.

    Args:
        skip: Number of records to skip
        limit: Maximum records to return
        db: Database session

    Returns:
        Tuple (resources list, total count)
    """
    # TODO: Implement actual database query
    resources = []
    total = 0
    return resources, total

async def get_resource_db(resource_id: int, db: Session) -> Optional[dict]:
    """
    Get single resource by ID.

    Args:
        resource_id: Resource ID
        db: Database session

    Returns:
        Resource dict or None
    """
    # TODO: Implement actual database query
    return None

async def update_resource_db(resource_id: int, resource: ResourceUpdate, db: Session) -> Optional[dict]:
    """
    Update resource in database.

    Args:
        resource_id: Resource ID
        resource: Updated resource data
        db: Database session

    Returns:
        Updated resource dict or None
    """
    # TODO: Implement actual database update
    return None

async def delete_resource_db(resource_id: int, db: Session) -> bool:
    """
    Delete resource from database.

    Args:
        resource_id: Resource ID
        db: Database session

    Returns:
        True if deleted, False if not found
    """
    # TODO: Implement actual database deletion
    return False

# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/", response_model=ResourceList)
async def list_resources(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum records to return"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    List all resources with pagination.

    - **skip**: Number of records to skip (default 0)
    - **limit**: Maximum records to return (default 100, max 1000)

    Returns paginated list of resources.
    """
    try:
        resources, total = await get_resources_db(skip, limit, db)

        total_pages = (total + limit - 1) // limit if limit > 0 else 0
        page = (skip // limit) + 1 if limit > 0 else 1

        logger.info(f"Listed {len(resources)} resources (page {page}/{total_pages})")

        return ResourceList(
            items=resources,
            total=total,
            page=page,
            page_size=limit,
            total_pages=total_pages
        )

    except Exception as e:
        logger.error(f"Error listing resources: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{resource_id}", response_model=ResourceResponse)
async def get_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get single resource by ID.

    - **resource_id**: Resource unique identifier

    Raises 404 if resource not found.
    """
    try:
        resource = await get_resource_db(resource_id, db)

        if not resource:
            raise HTTPException(status_code=404, detail=f"Resource {resource_id} not found")

        logger.info(f"Retrieved resource: {resource_id}")
        return resource

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving resource {resource_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
async def create_resource(
    resource: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("user"))
):
    """
    Create new resource.

    Requires authentication and user role minimum.

    Returns created resource with generated ID.
    """
    try:
        new_resource = await create_resource_db(resource, current_user["id"], db)

        logger.info(f"Resource created: {new_resource['id']} by user {current_user['id']}")
        return new_resource

    except Exception as e:
        logger.error(f"Error creating resource: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{resource_id}", response_model=ResourceResponse)
async def update_resource_full(
    resource_id: int,
    resource: ResourceCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("user"))
):
    """
    Update resource (full replacement).

    Requires authentication and user role minimum.

    - **resource_id**: Resource to update
    - All fields required (full replacement)

    Raises 404 if resource not found.
    """
    try:
        updated = await update_resource_db(resource_id, ResourceUpdate(**resource.dict()), db)

        if not updated:
            raise HTTPException(status_code=404, detail=f"Resource {resource_id} not found")

        logger.info(f"Resource updated: {resource_id} by user {current_user['id']}")
        return updated

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating resource {resource_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.patch("/{resource_id}", response_model=ResourceResponse)
async def update_resource_partial(
    resource_id: int,
    resource: ResourceUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("user"))
):
    """
    Update resource (partial update).

    Requires authentication and user role minimum.

    - **resource_id**: Resource to update
    - Only provided fields will be updated

    Raises 404 if resource not found.
    """
    try:
        updated = await update_resource_db(resource_id, resource, db)

        if not updated:
            raise HTTPException(status_code=404, detail=f"Resource {resource_id} not found")

        logger.info(f"Resource patched: {resource_id} by user {current_user['id']}")
        return updated

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error patching resource {resource_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    """
    Delete resource.

    Requires authentication and admin role.

    - **resource_id**: Resource to delete

    Raises 404 if resource not found.
    Returns 204 No Content on success.
    """
    try:
        deleted = await delete_resource_db(resource_id, db)

        if not deleted:
            raise HTTPException(status_code=404, detail=f"Resource {resource_id} not found")

        logger.info(f"Resource deleted: {resource_id} by admin {current_user['id']}")
        return None

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting resource {resource_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")
