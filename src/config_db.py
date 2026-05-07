from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DB_HOST: str
    DB_NAME: str
    DB_PASS: str
    DB_PORT: str
    DB_USER: str
    SECRET_KEY: str
    MODE: str = "DEV"

    @property
    def get_db_ulr(self):
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASS}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    model_config = SettingsConfigDict(env_file=(".test.env", ".env"), extra="ignore")


settings = Settings()  # type: ignore
