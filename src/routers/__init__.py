from fastapi import APIRouter
from routers.tasks import router as tasks_router
from routers.users import router as users_router
from routers.corp import router as corp_router
from routers.invitation import router as invitation_router
from routers.notification import router as notification_router

router = APIRouter()

router.include_router(tasks_router)
router.include_router(users_router)
router.include_router(corp_router)
router.include_router(invitation_router)
router.include_router(notification_router)
