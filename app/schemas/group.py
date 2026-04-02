from pydantic import BaseModel

class GroupBase(BaseModel):
    name: str
    description: str | None = None

class GroupCreate(GroupBase):
    pass

class GroupUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

class GroupInDB(GroupBase):
    id: int

    class Config:
        from_attributes = True