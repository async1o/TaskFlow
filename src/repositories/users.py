from utils.repositories import SQLAlchemyRepositories
from models.users import UsersModel


class UserRepositories(SQLAlchemyRepositories):
    model = UsersModel