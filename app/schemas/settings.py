from pydantic import BaseModel

class SettingsBase(BaseModel):
    key: str
    value: str

class SettingsCreate(SettingsBase):
    pass

class SettingsInDB(SettingsBase):
    id: int

    class Config:
        from_attributes = True