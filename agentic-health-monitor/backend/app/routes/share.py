import uuid
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, Dict
from app.core.supabase_client import get_supabase

logger = logging.getLogger(__name__)
router = APIRouter()


class ShareReportRequest(BaseModel):
    report: Dict[str, Any]
    form: Dict[str, Any]


@router.post("/share-report")
def create_share_link(payload: ShareReportRequest):
    token = str(uuid.uuid4())
    try:
        get_supabase().table("shared_reports").insert({
            "token": token,
            "report": payload.report,
            "form": payload.form,
        }).execute()
    except Exception as exc:
        logger.error("share-report insert failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create share link.")
    return {"token": token}


@router.get("/shared/{token}")
def get_shared_report(token: str):
    try:
        result = get_supabase().table("shared_reports").select("report,form,created_at").eq("token", token).single().execute()
    except Exception as exc:
        logger.error("shared report fetch failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=404, detail="Report not found or link is invalid.")
    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found or link is invalid.")
    return result.data
