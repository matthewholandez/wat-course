from pydantic import BaseModel
from sqlmodel import Field, SQLModel

class BaseCourse(SQLModel):
    title: str

class Course(BaseCourse, table=True):
    pid: str = Field(primary_key=True)
    code: str

class ReadCourse(BaseCourse):
    code: str