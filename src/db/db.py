import asyncio
import logging

from sqlalchemy import inspect
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool
from sqlalchemy_utils import create_database, database_exists

from config_db import settings


logger = logging.getLogger(__name__)


engine = create_async_engine(
    url=settings.get_db_ulr,
    poolclass=NullPool if settings.MODE == "TEST" else None,
)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


async def get_async_session():
    async with async_session_maker() as session:
        yield session


class Base(DeclarativeBase):
    pass


async def reset_tables():
    _import_all_models()
    async with engine.begin() as eng:
        await eng.run_sync(Base.metadata.drop_all)
        await eng.run_sync(Base.metadata.create_all)


async def reset_tables_cascade():
    _import_all_models()
    async with engine.begin() as eng:
        await eng.exec_driver_sql("DROP TABLE IF EXISTS notifications CASCADE")
        await eng.exec_driver_sql("DROP TABLE IF EXISTS invitations CASCADE")
        await eng.exec_driver_sql("DROP TABLE IF EXISTS corp_members CASCADE")
        await eng.exec_driver_sql("DROP TABLE IF EXISTS corps CASCADE")
        await eng.exec_driver_sql("DROP TABLE IF EXISTS tasks CASCADE")
        await eng.exec_driver_sql("DROP TABLE IF EXISTS users CASCADE")
        await eng.run_sync(Base.metadata.create_all)


def _import_all_models():
    from models.users import UsersModel  # noqa: F401
    from models.tasks import TasksModel  # noqa: F401
    from models.corp import CorpModel  # noqa: F401
    from models.invitation import InvitationModel  # noqa: F401
    from models.notification import NotificationModel  # noqa: F401


async def _table_exists(conn, table_name: str) -> bool:
    def _check(sync_conn):
        insp = inspect(sync_conn)
        return table_name in insp.get_table_names()
    return await conn.run_sync(_check)


async def _column_exists(conn, table_name: str, column_name: str) -> bool:
    def _check(sync_conn):
        insp = inspect(sync_conn)
        columns = [col["name"] for col in insp.get_columns(table_name)]
        return column_name in columns
    return await conn.run_sync(_check)


async def add_missing_columns(eng):
    if await _table_exists(eng, "users"):
        if not await _column_exists(eng, "users", "avatar_url"):
            await eng.exec_driver_sql("ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) DEFAULT NULL")
            logger.info("Added avatar_url column to users table")
        if not await _column_exists(eng, "users", "corp_id"):
            await eng.exec_driver_sql("ALTER TABLE users ADD COLUMN corp_id INTEGER")
            logger.info("Added corp_id column to users table")

    if await _table_exists(eng, "tasks"):
        if not await _column_exists(eng, "tasks", "status"):
            await eng.exec_driver_sql("ALTER TABLE tasks ADD COLUMN status VARCHAR(20) DEFAULT 'active'")
            logger.info("Added status column to tasks table")
        if not await _column_exists(eng, "tasks", "creator_id"):
            await eng.exec_driver_sql("ALTER TABLE tasks ADD COLUMN creator_id INTEGER")
            await eng.exec_driver_sql("UPDATE tasks SET creator_id = owner_id")
            await eng.exec_driver_sql("ALTER TABLE tasks ALTER COLUMN creator_id SET NOT NULL")
            await eng.exec_driver_sql("ALTER TABLE tasks ADD CONSTRAINT fk_tasks_creator FOREIGN KEY (creator_id) REFERENCES users(id)")
            logger.info("Added creator_id column to tasks table")
        if not await _column_exists(eng, "tasks", "assignee_id"):
            await eng.exec_driver_sql("ALTER TABLE tasks ADD COLUMN assignee_id INTEGER")
            logger.info("Added assignee_id column to tasks table")


async def create_tables():
    _import_all_models()
    async with engine.begin() as eng:
        await eng.run_sync(Base.metadata.create_all)
    logger.info("Tables created")


async def create_db():
    url = settings.get_db_ulr.replace("+asyncpg", "")

    exists = await asyncio.to_thread(database_exists, url)
    if not exists:
        await asyncio.to_thread(create_database, url)
        logger.info("Databases created on startup (auto)")
    else:
        logger.info("Databases already exist, skipping creation")

    await create_tables_if_not_exists()


async def create_tables_if_not_exists():
    _import_all_models()

    async with engine.connect() as conn:
        exists = await _table_exists(conn, "users")
    if not exists:
        await create_tables()
        logger.info("Tables created on startup (auto)")
    else:
        logger.info("Tables already exist, skipping creation")

    async with engine.begin() as eng:
        await add_missing_columns(eng)